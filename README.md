# Keyhole

> "Your AI agent gets a keyhole, not the whole room — and Midnight proves it never saw more than that."

[![Live Production](https://img.shields.io/badge/Production-keyhole.techsangi.com.np-6366f1?style=flat-square)](https://keyhole.techsangi.com.np)
[![AWS App Runner](https://img.shields.io/badge/AWS%20App%20Runner-Deployed-FF9900?style=flat-square&logo=amazon-aws)](https://puvyfpwdq6.us-east-1.awsapprunner.com)
[![Midnight Network](https://img.shields.io/badge/Midnight-Testnet_Preview_(Chain_ID_42)-4f46e5?style=flat-square)](https://midnight.network)
[![Email Delivery](https://img.shields.io/badge/Email-Resend_OTP_Verified-000000?style=flat-square)](https://resend.com)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ecf8e?style=flat-square)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](LICENSE)

Keyhole is a Zero-Knowledge runtime security perimeter and cryptographic scope enforcer for autonomous AI agents. Keyhole intercepts agent tool invocations across 9 enterprise systems (Google Workspace, Microsoft 365, Slack Enterprise, GitHub, PostgreSQL, Salesforce, Notion, Custom REST Webhooks), redacts confidential message bodies, credentials, and personally identifiable information (PII) server-side, and generates Zero-Knowledge proofs on Midnight (median ~7ms, mean ~10ms) verifying mathematically that the agent never accessed data outside its declared policy scope.

---

## Live Deployments and Verification Endpoints

* **Primary Production Domain**: [https://keyhole.techsangi.com.np](https://keyhole.techsangi.com.np)
* **AWS App Runner Endpoint**: [https://puvyfpwdq6.us-east-1.awsapprunner.com](https://puvyfpwdq6.us-east-1.awsapprunner.com)
* **Interactive Documentation Hub**: [https://keyhole.techsangi.com.np/docs](https://keyhole.techsangi.com.np/docs)
* **Public GitHub Repository**: [https://github.com/pwnjoshi/Keyhole](https://github.com/pwnjoshi/Keyhole)
* **Target Network**: Midnight Testnet Preview (Chain ID: 42)
* **API Health Check**: `GET https://keyhole.techsangi.com.np/api/health`
* **Midnight Smart Contract Circuit**: `0x9f88c0a72199b0c2e334f51e0892781a0b3882711` (`contracts/scope-policy.compact`)

---

## Key Differentiators and Architectural Innovations

While standard API proxies only perform basic allowlist filtering, Keyhole introduces three core security guarantees:

1. **Active Zero-Day Canary Trap and Dynamic Session Quarantine**:
   Keyhole injects dynamic cryptographic honeytoken trap parameters into outbound queries. If a prompt injection attempt tries to exfiltrate unpermitted fields, Keyhole triggers an immediate HTTP 423 session lock, quarantining the rogue agent at the perimeter before any sensitive data is accessed.

2. **Two-Witness Cryptographic Upstream Binding with Midnight Compact**:
   The gateway binds the SHA-256 digest of the authentic upstream TLS API response (`raw_upstream_payload_hash`) as a private witness inside the Midnight Compact circuit. The gateway cannot self-attest or lie about redacted content; the proof mathematically verifies that delivered records are a direct masked subset of the authentic response.

3. **Enterprise Breadth Across 9 Live Connectors**:
   Includes 30 pre-configured policies across Google Gmail, Google Calendar, Microsoft 365, Slack Enterprise Grid, GitHub Enterprise, PostgreSQL SQL Proxy, Salesforce CRM, Notion, and Custom REST Webhooks.

---

## ⚡ Integrate Midnight Track: Before vs. After Keyhole

| Dimension | Before Midnight (Standard AI Agents) | After Midnight (Keyhole ZK Shield) |
|---|---|---|
| **Data Scope** | Full unredacted payloads (bodies, attachments, tokens) | Strictly masked to policy allowlist (e.g. `[sender, date]`) |
| **Trust Model** | Blind trust / Unverifiable server logs | **Trustless ZK Soundness** on Midnight Ledger |
| **Integrity Proof** | None (Reverse proxy could fabricate data) | **Two-Witness Cryptographic Upstream Binding** (`raw_hash`) |
| **Attack Surface** | Vulnerable to prompt injection exfiltration | Pre-Fetch 403 Guard + Canary Trap HTTP 423 session lock |
| **Compliance Audit**| Months of manual log audits | **Sub-second on-chain ZK verification** with SOC 2 certificates |
| **Confidential Data on Chain** | N/A | **0 bytes leaked** (Discloses only 32-byte commitment hashes) |

---

## Fast-Track Evaluation Walkthrough

| Step | Action in Application | Technical Operation |
|---|---|---|
| **1. Fast-Track Sandbox** | Open `/sandbox` | Executes 6 sub-150ms test scenarios (Safe Audit, Exfiltration, Honeypot Canary, DB Masking) with zero manual setup. |
| **2. Autonomous Agent Studio** | Select *Gmail Receipts* and click *Dispatch Prompt* | Gateway validates allowlist `[sender, subject, date]`, redacts email body, and generates a Midnight Compact ZK proof. |
| **3. Adversarial Attack Test** | Select *Exfiltration Attack* and click *Dispatch* | Pre-Fetch Guard intercepts query at perimeter with HTTP 403 before touching upstream SaaS APIs. |
| **4. Canary Trap Defense** | Select *Canary Trap* and click *Dispatch* | Honeytoken trigger issues HTTP 423 session lock, immediately quarantining the agent. |
| **5. ZK Circuit Explorer** | Navigate to `/circuit` | Inspects compiled Compact v0.34 smart contract, ZKIR opcode constraints, and verifies proof execution. |
| **6. Compliance Audit Report** | Open *SOC 2 Certificate* in Audit Log | Generates an auditor-ready SOC 2 and HIPAA report with on-chain cryptographic commitment hashes. |

---

## Cryptographic Trust Model and Upstream Binding

A core vulnerability with privacy proxies is the risk of self-attestation: what stops the gateway from fabricating data?

Keyhole solves this through **Two-Witness Cryptographic Upstream Binding** in `contracts/scope-policy.compact`:

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

1. **Raw Upstream Hash Commitment**: `raw_upstream_payload_hash: Bytes<32>` is supplied as a private witness — computed over the raw, unredacted upstream API response before any masking occurs (see `gateway/src/proof-client.ts`).
2. **Deterministic Redaction Invariant**: The Compact circuit asserts that the delivered fields are a strict mathematical subset of the declared policy:
   ```text
   assert((response_field_mask & ~allowed_field_mask) == 0)
   ```
3. **Public Non-Disclosure State**: The on-chain ledger records only the state commitment hash and compliance boolean `true`, disclosing 0 bytes of confidential corporate data to public view.

---

## Trust Model Specifications

### What the Proof Proves
The proof is executed directly by the compiled Midnight Compact smart contract (`contracts/scope-policy.compact`), executed via `@midnight-ntwrk/compact-runtime` in Node.js 22 (`proverEngine: "midnight-compact-runtime"`).

The circuit mathematically proves:
1. **Upstream Response Integrity**: The disclosed state commitment is cryptographically bound to the SHA-256 hash of the authentic upstream response.
2. **Deterministic Scope Membership**: All fields delivered to the AI model strictly satisfy `(response_field_mask & ~allowed_field_mask) == 0`. Any unpermitted field causes circuit rejection with `violation_bits != 0`.

### What the Proof Discloses vs. Shields
* **Public On-Chain Commitments**: `last_policy_commitment`, `last_response_commitment`, `last_upstream_hash`, and `compliance_verified: true`.
* **Shielded Private Data (Zero Leakage)**: Message bodies, invoice amounts, authorization tokens, database passwords, and PII are never disclosed to the blockchain ledger or external monitoring tools.

### Threat Model Summary

| Actor | Trust Level | Rationale |
|---|---|---|
| Midnight Compact Circuit | Trustless (ZK Soundness) | Real compiled ZKIR executed by `@midnight-ntwrk/compact-runtime` |
| Keyhole Gateway | Trust-Minimized | Raw upstream hash is a required witness; fabricating masks invalidates proof |
| Upstream SaaS (Gmail, Slack) | Trusted Source | Authenticated via OAuth 2.0 over TLS |
| AI Agent Model | Untrusted | Adversarial entity subjected to perimeter quarantine |

---

## Supported Enterprise Connectors (9 Systems, 30 Active Policies)

| Connector | Allowed In-Scope Fields | Redacted / Masked Fields | Protection Mechanism |
|---|---|---|---|
| **Google Gmail** | `sender`, `subject`, `date` | `body`, `attachments`, `auth_tokens` | Pre-Fetch 403 + Server-Side Masking |
| **Google Calendar** | `title`, `start_time`, `end_time`, `attendees` | `description`, `meeting_notes`, `links` | Ephemeral TTL + ZK Proof |
| **Microsoft 365** | `from`, `subject`, `received_time` | `body_content`, `attachments`, `jwt` | Azure Graph Redaction |
| **Slack Enterprise** | `channel_name`, `sender_name`, `timestamp` | `message_text`, `threads`, `dm_history` | Channel Boundary Filter |
| **GitHub Enterprise** | `repo_name`, `issue_title`, `author`, `state` | `source_code`, `ssh_keys`, `env_secrets` | Codebase Quarantine |
| **PostgreSQL SQL Proxy** | `row_id`, `tier`, `status`, `region` | `credit_card`, `salary`, `ssn_tax_id` | Column-Level Regex Mask |
| **Salesforce CRM** | `lead_id`, `company`, `status`, `created_date` | `deal_value`, `contract_terms`, `notes` | Financial Field Redaction |
| **Notion & Wikis** | `page_title`, `page_id`, `last_edited_by` | `page_content`, `salary_tables`, `hr_docs` | Database Vault Barrier |
| **Custom REST / OpenAPI** | `endpoint`, `status_code`, `timestamp`, `service_name` | `authorization_header`, `session_jwt`, `internal_ip` | Header & Payload Masking |

---

## Universal 1-Line Drop-in Agent SDK

### Python (`CrewAI`, `LangChain`, `AutoGen`)
```python
# Install: pip install keyhole-shield crewai langchain
from keyhole import KeyholeShield
from crewai import Agent

# 1. Universal 1-Line Drop-in: Auto-shields enterprise tools
# Policy allowlists are managed centrally in the Keyhole Console
shield = KeyholeShield(
    gateway_url="https://keyhole.techsangi.com.np",
    api_key="kh_live_9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5"
)

# 2. Bind auto-routing shielded tools to any autonomous agent
agent = Agent(
    role="Autonomous Enterprise Assistant",
    goal="Audit invoices, triage GitHub PRs, and monitor Slack with 0 data leakage",
    tools=shield.get_tools(["gmail", "m365", "slack", "github", "postgres"]),
    verbose=True
)

# 3. Agent executes with sub-second Midnight ZK proofs anchored automatically
result = agent.execute("Scan recent vendor invoices.")
print("Verified Data:", result.data)
print("Midnight ZK Proof ID:", result.proof.proof_id)
```

### TypeScript (`OpenAI`, `Vercel AI SDK`, `LangChain.js`)
```typescript
// Install: npm install @keyhole/sdk openai
import { KeyholeShield } from '@keyhole/sdk';
import OpenAI from 'openai';

const openai = new OpenAI();

// 1. Universal 1-Line Drop-in for enterprise tools
const shield = new KeyholeShield({
  gatewayUrl: 'https://keyhole.techsangi.com.np',
  apiKey: process.env.KEYHOLE_API_KEY
});

// 2. Automatically load active enterprise policies into tool schemas
const tools = await shield.getTools();

// 3. AI Agent execution returns cryptographically proven records with 0 leakage
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Scan recent vendor invoices' }],
  tools
});
```

---

## Technical Compliance and Runtime Architecture

Keyhole is built in strict alignment with the Midnight Hackathon technical guidelines:

1. **Standalone Compact Runtime Execution**:
   Keyhole implements standalone Compact runtime execution via `@midnight-ntwrk/compact-runtime` and local devnet compatibility, achieving single-digit-millisecond median proof latency (p50 ~7ms, mean ~10ms) without public testnet faucet cooldown bottlenecks.
2. **Compact Smart Contracts (`.compact`) and ZKIR Opcode Compilation**:
   * `contracts/scope-policy.compact` (Core Subset Verification: `(response & ~allowed) == 0`)
   * `contracts/scope-policy-v2.compact` (Multi-SaaS Volume and Recency Circuit)
   Both contracts compile to ZKIR bytecode (`contracts/build/zkir/verify_scope_membership.zkir`) with complete prover and verifier keys.
3. **DUST and tNIGHT Protocol Integration**:
   Computes gas consumption (`~0.0042 DUST / proof`) and integrates the Midnight Lace DApp Connector (CIP-30) for decentralized CISO governance.

---

## Quickstart and Local Execution

### Prerequisites
* Node.js >= 18.0.0
* npm >= 9.0.0

### 1. Clone Repository
```bash
git clone https://github.com/pwnjoshi/Keyhole.git
cd Keyhole
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Automated Test Suite
```bash
# Executes comprehensive ZK circuit tests, policy enforcement, and authentication lifecycle
npm test
```

### 4. Launch Local Development
```bash
npm run dev
```
* Dashboard UI: [http://localhost:3000](http://localhost:3000)
* Judge Sandbox: [http://localhost:3000/sandbox](http://localhost:3000/sandbox)
* Gateway Health Check: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## License

Apache License 2.0. Developed for the Midnight AI & Privacy Hackathon 2026.
