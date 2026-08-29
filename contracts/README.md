# Keyhole Zero-Knowledge Scope Policy Contracts

This directory contains the official **Midnight Compact smart contracts** (`.compact`), compiled **Zero-Knowledge Intermediate Representation (ZKIR)** artifacts, and test harnesses for Keyhole.

---

## 🏆 Midnight Hackathon & Mentor Guidelines Alignment

Keyhole strictly follows the **Midnight Hackathon Technical Rules** and mentor recommendations:

1. **Recommended Local Devnet & Standalone Runtime**:
   - As recommended by mentor **ALEXP7**, Keyhole runs seamlessly with the **Midnight Local Devnet via Docker** (`midnightntwrk/devnet-node:latest`) and standalone **Compact Runtime** (`@midnight-ntwrk/compact-runtime`), eliminating dependency on public testnet faucet cooldowns or `InvalidDustSpendProof` (error 170) parameter mismatches.
2. **Compact Smart Contract Submission Requirement**:
   - **`scope-policy.compact` (v1 Core)**: Implements the bitwise subset verification theorem (`(response & ~allowed) == 0`).
   - **`scope-policy-v2.compact` (v2 Multi-SaaS)**: Implements multi-constraint proofs including record count bounds (`actual <= max`) and recency windows (`timestamp >= min`).
   - Both contracts compile successfully with full ZKIR bytecode and prover/verifier keys in `build/` and `build-v2/`.
3. **DUST & tNIGHT Execution Fuel**:
   - Keyhole tracks and calculates DUST gas consumption (`~0.0042 DUST / proof`) and supports testnet DUST and tNIGHT balances through the Midnight Lace connector.

---

## 🔒 What the Proof Does (Plain-English Explanation)

When an AI agent requests data from a connected service (Gmail, Microsoft 365, Slack, GitHub, PostgreSQL, Salesforce, Notion), Keyhole inspects the active scope policy (e.g. *"Allowed fields: sender, subject, date on label RECEIPTS"*).

Before returning data to the AI model, Keyhole executes the `scope-policy.compact` circuit to produce an on-chain **Zero-Knowledge Proof of Scope Compliance**.

### What IS Revealed (Public Inputs & Ledger Outputs)
1. **Policy Commitment (`policy_commitment`)**: A cryptographic SHA-256 fingerprint of the authorized policy ID and allowed field definitions.
2. **Response Commitment (`response_commitment`)**: A cryptographic fingerprint linking this specific request ID to the filtered response shape.
3. **Compliance Status (`compliance_verified = true`)**: A mathematical guarantee that every field delivered to the agent was strictly contained within the allowed policy set.
4. **Verification Counter**: An incremental counter on Midnight proving the total number of compliant requests processed.

### What is NOT Revealed (Zero Data Exposure)
- ❌ **No email/message content**: Email bodies, Slack messages, Notion wiki text, files, and diff blobs remain strictly in private witness memory.
- ❌ **No field values**: Senders, recipient addresses, salaries, credit card hashes, and dates are completely hidden inside private witness commitments.
- ❌ **No underlying message identifiers**: Database keys and message IDs remain private between the enterprise data source and the gateway.

---

## 📜 Circuits Overview

### 1. `scope-policy.compact` (v1 - Core Field-Allowlist Proof)
- **Constraint**: Proves that the returned field set `response_field_mask` is a strict subset of `allowed_field_mask` (`(response_field_mask & ~allowed_field_mask) == 0`).
- **Failure Condition**: If any unauthorized field (e.g. `body`, `attachments`, `raw_payload`, `passwords`) is included, the circuit assertion fails, making it impossible to produce a valid proof.

### 2. `scope-policy-v2.compact` (v2 - Count & Recency Bounds)
- **Additional Constraints**:
  - `actual_records <= max_records`: Proves the agent received no more records than permitted by the rate or volume policy.
  - `oldest_record_timestamp >= min_allowed_timestamp`: Proves the agent received no records older than the authorized time window (e.g., last 30 days).

---

## 🧪 Testing the Compact Circuits

Run the standalone 3-case circuit test harness:
```bash
npm run test:contracts
```

### Test Case Verification:
1. **Case A (In-Scope Response)**: Agent requests `sender`, `subject`, `date` with policy allowlist `[sender, subject, date]`. $\rightarrow$ **ZK Proof PASSES (Compliant)**.
2. **Case B (Disallowed Field)**: Agent response includes `body` field when policy only permits `[sender, subject]`. $\rightarrow$ **Circuit REJECTS with assertion error (Exfiltration Blocked)**.
3. **Case C (Empty Response)**: Query returns 0 records ($mask = 0$). $\rightarrow$ **ZK Proof PASSES TRIVIALLY**.
