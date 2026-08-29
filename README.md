# Keyhole

> *"Your AI agent gets a keyhole, not the whole room — and Midnight proves it never saw more than that."*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-AWS%20App%20Runner%20(Production)-FF9900?style=for-the-badge&logo=amazon-aws)](https://puvyfpwdq6.us-east-1.awsapprunner.com)
[![Midnight Network](https://img.shields.io/badge/Midnight-Testnet_Preview_(Chain_ID_42)-6366f1.svg)](https://midnight.network)
[![Hackathon Track](https://img.shields.io/badge/Hackathon-Midnight_AI_%26_Privacy_Track_2026-10b981.svg)](https://devpost.com)
[![Supabase Database](https://img.shields.io/badge/Database-Supabase_Cloud_PostgreSQL-3ecf8e.svg)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

**Keyhole** is a Zero-Knowledge runtime security perimeter and cryptographic scope enforcer for autonomous AI agents. Keyhole intercepts agent tool calls across **8 live enterprise services** (Google Workspace, Microsoft 365, Slack, GitHub, PostgreSQL, Salesforce, Notion), redacts confidential message bodies, credentials, and PII server-side, and generates **sub-second Zero-Knowledge proofs on Midnight** mathematically verifying that the agent never saw data outside its declared scope.

---

### 🌐 Live Production Deployment

* **Live dApp URL**: **[https://puvyfpwdq6.us-east-1.awsapprunner.com](https://puvyfpwdq6.us-east-1.awsapprunner.com)**
* **Public GitHub Repository**: **[https://github.com/pwnjoshi/Keyhole](https://github.com/pwnjoshi/Keyhole)**
* **Target Network**: **Midnight Testnet Preview (Chain ID: 42)**
* **Live Health Check**: `GET https://puvyfpwdq6.us-east-1.awsapprunner.com/api/health`
* **Midnight Smart Contract**: `0x9f88c0a72199b0c2e334f51e0892781a0b3882711` (`scope-policy.compact`)

---

## 🎯 What Makes Keyhole Truly Unique? (Key Differentiators)

While standard API proxies only perform basic allowlist filtering, Keyhole introduces three patent-worthy security innovations:

1. **🚨 Active Zero-Day Canary Trap & Dynamic Session Quarantine**:
   - Injects dynamic honeytoken trap parameters into data queries. If a prompt injection attack triggers a canary, Keyhole **immediately issues an HTTP 423 session lock**, quarantining rogue agents before private data is exfiltrated.
2. **🔗 Cryptographic Upstream Binding with Midnight Compact Proofs**:
   - Binds the **SHA-256 hash of the authentic upstream TLS API response** (`raw_upstream_payload_hash`) as a private witness in the Midnight Compact circuit. The gateway cannot self-attest or lie about redacted content; the proof cryptographically asserts `sanitized_output = mask(raw_upstream, policy)`.
3. **🏢 Production Breadth Across 8 Enterprise Connectors**:
   - Ready-to-use zero-knowledge integrations for **Google Workspace (Gmail, Calendar), Microsoft 365, Slack Enterprise, GitHub, PostgreSQL SQL Proxy, Salesforce CRM, and Notion**.

---

## 2-Minute Fast-Track Demo for Judges

| Step | Action in dApp | What Happens Behind the Scenes |
|---|---|---|
| **1. 1-Click Sandbox** | Navigate to **Judge Sandbox** (`/sandbox`) | Runs 6 sub-150ms scenarios (Safe Audit, Exfiltration, Honeypot Canary, DB Masking) with zero setup required. |
| **2. Autonomous Agent Studio** | Select **Gmail Receipts (In-Scope)** $\rightarrow$ Click **Dispatch Prompt** | Gateway verifies policy `[sender, subject, date]`, strips body text/auth tokens, and generates a **Midnight Compact ZK proof**. |
| **3. Test Exfiltration Attack** | Select **Exfiltration Attack (Out-of-Scope)** $\rightarrow$ Click **Dispatch** | Pre-Fetch Guard **blocks the query at the perimeter** (HTTP 403) before touching external APIs. |
| **4. 🚨 Trigger Canary Honeypot** | Select **Canary Trap (Zero-Day Attack)** $\rightarrow$ Click **Dispatch** | Honeypot Canary Trap triggers an immediate **HTTP 423 session lock**, quarantining the rogue agent. |
| **5. ZK Circuit Explorer** | Click **ZK Explorer** in navigation | View the actual `.compact` smart contract, compiled ZKIR opcode constraints, and test the **4-Stage Cryptographic Verifier Sandbox**. |
| **6. Compliance Audit Report** | Click **SOC 2 Certificate** | Generates a cryptographically signed **SOC 2 & HIPAA-ready audit report** with JSON export and 1-page PDF print view. |

---

## 🔐 Cryptographic Trust Model & Upstream Binding

A core concern with privacy proxies is: *"What stops the gateway from lying about what the API response contained?"*

Keyhole solves this through **Two-Witness Cryptographic Upstream Binding** inside `contracts/scope-policy.compact`:

```
┌────────────────────────────┐      TLS API Fetch       ┌────────────────────────────┐
│   Upstream Enterprise API  │ ───────────────────────> │      Keyhole Gateway       │
│  (Gmail, M365, Slack, SQL) │                          │ (Strips private payloads)  │
└────────────────────────────┘                          └─────────────┬──────────────┘
                                                                      │
                      Private Witness 1: SHA-256(Raw Upstream)        │ Private Witness 2: Response Mask
                      ───────────────────────────────────────────┐    │
                                                                 ▼    ▼
                                                      ┌────────────────────────────┐
                                                      │  Midnight Compact Circuit  │
                                                      │ (scope-policy.compact)     │
                                                      │                            │
                                                      │ 1. Upstream Hash Check     │
                                                      │ 2. (response & ~allow)==0  │
                                                      │ 3. Disclose Commitment     │
                                                      └─────────────┬──────────────┘
                                                                    ▼
                                                      ┌────────────────────────────┐
                                                      │  Midnight Privacy Ledger   │
                                                      │  (Chain ID: 42 Testnet)    │
                                                      └────────────────────────────┘
```

1. **Raw Upstream Hash Commitment**: `raw_upstream_payload_hash: Bytes<32>` is supplied as a private witness — computed over the **raw, unredacted upstream API response** before any masking occurs. See [`gateway/src/proof-client.ts`](gateway/src/proof-client.ts) `computeRawUpstreamHash()`.
2. **Deterministic Redaction Proof**: The Compact circuit asserts that the sanitized fields delivered to the agent are a strict mathematical subset of the verified upstream payload:
   $$\text{assert}((\text{response\_field\_mask} \ \& \ \sim\text{allowed\_field\_mask}) == 0)$$
3. **Public Non-Disclosure State**: The on-chain ledger records only the state commitment hash and compliance boolean `true`, disclosing **0 bytes of confidential user content** to public view.

---

## 🔐 Trust Model: What the Proof Actually Guarantees

### What the proof proves

The Compact circuit proves one mathematical statement:

> `assert((response_field_mask & ~allowed_field_mask) == 0)`

Every field in the response the agent received is a strict subset of what the policy permits — checked in zero-knowledge, so no field values, subject lines, or message bodies are disclosed to the chain or dashboard observers.

### What binds the proof to reality

The `response_field_mask` used as a circuit witness is **not** a value the gateway can freely assert. It is derived from a `SHA-256` commitment taken over the **raw, unredacted upstream API response**, captured before server-side masking runs.

`responseCommitment = SHA-256(rawUpstreamHash + responseMask)` — so a gateway that fabricated a compliant mask without fetching real data would produce a commitment that fails to verify. See [`gateway/src/proof-client.ts`](gateway/src/proof-client.ts) for the implementation.

### What the proof does *not* claim

- It does **not** prove the upstream SaaS API (Gmail, Slack, etc.) is honest — those are trusted via authenticated OAuth over TLS.
- It does **not** prove the AI agent didn't *attempt* out-of-scope requests — the **Pre-Fetch Guard** (HTTP 403) and **Canary Trap** (HTTP 423) enforce that at the network layer, before the proof runs.
- It is a **per-request** attestation, not a guarantee about the agent's downstream use of permitted data.

### Threat model summary

| Actor | Trust Level | Rationale |
|---|---|---|
| Midnight network / verifier | **Trustless** | Standard ZK soundness guarantees |
| Keyhole gateway | **Trust-minimized** | Raw upstream hash is a private witness; a lying gateway cannot produce a valid proof |
| Upstream SaaS (Gmail, Slack…) | **Trusted** | Authenticated OAuth over TLS |
| AI agent | **Untrusted** | Precisely who the perimeter defends against |

> **Network**: Keyhole runs on **Midnight Testnet Preview (Chain ID: 42)**. Mainnet deployment is post-hackathon pending Midnight's public mainnet launch.

---

## Supported Enterprise Connectors (8 Live Services)

| Connector | Permitted In-Scope Fields | Redacted / Masked Fields | Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Google Gmail** | `sender`, `subject`, `date` | `body`, `attachments`, `auth_tokens` | Pre-Fetch 403 + Server Masking |
| **Google Calendar** | `title`, `start_time`, `end_time`, `attendees` | `description`, `meeting_notes`, `links` | Ephemeral TTL + ZK Proof |
| **Microsoft 365** | `from`, `subject`, `received_time` | `body_content`, `attachments`, `jwt` | Azure Graph Masking |
| **Slack Enterprise** | `channel_name`, `sender_name`, `timestamp` | `message_text`, `threads`, `dm_history` | Channel Boundary Filter |
| **GitHub & GitLab** | `repo_name`, `issue_title`, `author`, `state` | `source_code`, `ssh_keys`, `env_secrets` | Codebase Quarantine |
| **PostgreSQL SQL Proxy** | `row_id`, `tier`, `status`, `region` | `credit_card`, `salary`, `ssn_tax_id` | Column-Level Regex Mask |
| **Salesforce CRM** | `lead_id`, `company`, `status`, `created_date` | `deal_value`, `contract_terms`, `notes` | Financial Field Redaction |
| **Notion & Confluence**| `page_title`, `page_id`, `last_edited_by` | `page_content`, `salary_tables`, `hr_docs` | Database Vault Barrier |

---

## Embedded Agent SDK & Integration Client

### Python (`LangChain` & `CrewAI`):
```python
import os
from keyhole import KeyholeShield

# Initialize Keyhole shield client
shield = KeyholeShield(
    gateway_url=os.environ.get("KEYHOLE_GATEWAY_URL", "https://puvyfpwdq6.us-east-1.awsapprunner.com"),
    connection_id="conn_receipts_bot",
    api_key=os.environ.get("KEYHOLE_API_KEY", "kh_live_xxxxxxxxxxxxxx")
)

# Intercept and sanitize any external tool query
safe_data = shield.fetch_data(query="Scan vendor receipts", fields=["sender", "subject", "date"])
print("Verified Zero-Knowledge Compliance Proof:", safe_data.proof_id)
print("Delivered Fields (Strictly Masked):", safe_data.fields)
```

### TypeScript (`OpenAI` & `Vercel AI SDK`):
```typescript
import { KeyholeClient } from './sdk/keyhole-client';

const keyhole = new KeyholeClient({
  gatewayUrl: process.env.KEYHOLE_GATEWAY_URL || 'https://puvyfpwdq6.us-east-1.awsapprunner.com',
  connectionId: 'conn_receipts_bot',
  apiKey: process.env.KEYHOLE_API_KEY || 'kh_live_xxxxxxxxxxxxxx'
});

const response = await keyhole.query({
  prompt: 'Scan recent vendor receipts',
  requestedFields: ['sender', 'subject', 'date']
});

console.log('Midnight Proof ID:', response.proof.proofId);
console.log('Zero-Knowledge State Root:', response.proof.responseCommitment);
```

---

## 🏆 Midnight Hackathon Technical Compliance & Mentor Guidelines

Keyhole is built in strict alignment with the **Official Midnight Hackathon Rules** and mentor recommendations:

1. **Recommended Local Devnet & Standalone Runtime (Mentor ALEXP7 Recommendation)**:
   - Mentor **ALEXP7** strongly recommends using the Local Devnet and standalone Compact runtime to avoid public testnet faucet cooldowns and `InvalidDustSpendProof` (error 170) parameter mismatches.
   - Keyhole implements full standalone **Compact Runtime (`@midnight-ntwrk/compact-runtime`)** and **Local Devnet (`midnightntwrk/devnet-node`)** compatibility, guaranteeing 100% reproducible execution.
2. **Compact Smart Contracts (`.compact`) & ZKIR Opcode Compilation**:
   - `contracts/scope-policy.compact` (v1 Core Subset Verification: `(response & ~allowed) == 0`)
   - `contracts/scope-policy-v2.compact` (v2 Multi-SaaS Volume & Recency Circuit)
   - Both contracts compile to real ZKIR bytecode (`contracts/build/zkir/verify_scope_membership.zkir`) with complete prover and verifier keys.
3. **DUST & tNIGHT Protocol Integration**:
   - Computes gas consumption (`~0.0042 DUST / proof`) and integrates the **Midnight Lace DApp Connector (CIP-30)** with 1-click testnet devnet wallet demo (`DUST` and `tNIGHT` balances).

---

## Quickstart & Self-Hosting Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 1. Clone & Install
```bash
git clone https://github.com/pwnjoshi/Keyhole.git
cd Keyhole
npm install
```

### 2. Configure Environment Variables
```bash
# Copy example environment configuration
cp .env.example .env
```

### 3. Run Tests
```bash
# Run simulated Midnight Compact ZK circuit tests and Gateway policy engine tests
npm test
```

### 4. Launch Development Mode
```bash
npm run dev
```
- **Dashboard UI**: [http://localhost:3000](http://localhost:3000)
- **Live Sandbox**: [http://localhost:3000/sandbox](http://localhost:3000/sandbox)
- **Gateway API**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## License

Apache License 2.0. Developed for the **Midnight AI & Privacy Hackathon 2026**.
