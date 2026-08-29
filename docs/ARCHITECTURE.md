# Keyhole System Architecture

Keyhole is a zero-knowledge data-access gateway that acts as a secure, provable mediator between autonomous AI agents and sensitive user services (such as Gmail or Google Calendar).

---

## 1. System Overview

```
                                  +-----------------------+
                                  |     AI Agent          |
                                  | (LangChain/AutoGPT/etc|
                                  +-----------+-----------+
                                              |
                          1. Request          | 5. Filtered Data + ZK Proof
                          {connectionId,      |    {records: [...], proof: "..."}
                           query, fields}     |
                                              v
+-----------------------------------------------------------------------------------+
|                               KEYHOLE GATEWAY                                     |
|                                                                                   |
|  +---------------------+   2. Policy Pre-Check    +----------------------------+  |
|  |    Policy Store     | -----------------------> |       Policy Engine        |  |
|  |  (Allowed Fields,   |                          |  - Pre-fetch validation    |  |
|  |   Filters, Limits)  |                          |  - Post-fetch field mask   |  |
|  +---------------------+                          +--------------+-------------+  |
|                                                                  |                |
|                                               3. Fetch Records   |                |
|                                                                  v                |
|  +-----------------------------------------------------------------------------+  |
|  |                      DataConnector Interface Abstraction                     |  |
|  |    +------------------------------+     +------------------------------+    |  |
|  |    |     Gmail Data Connector     |     |     GCal Data Connector      |    |  |
|  |    |  - OAuth 2.0 (gmail.readonly)|     |  - OAuth 2.0 (calendar.read) |    |  |
|  |    +------------------------------+     +------------------------------+    |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                  |                |
|                                         4. Compute Witness & ZK  |                |
|                                                                  v                |
|  +---------------------+                          +----------------------------+  |
|  |   Audit Log Feed    | <----------------------- |     Midnight Proof Client  |  |
|  |  (SSE / WebSocket)  |    Emit Audit Event      |  - Build Field Bitmask/Set |  |
|  +----------+----------+    (COMPLIANT / BLOCKED) |  - Execute Compact Circuit |  |
|             |                                     +--------------+-------------+  |
+-------------|----------------------------------------------------|----------------+
              |                                                    |
              v Real-time Events                                   v Proof / Verification
+-----------------------------+                     +-------------------------------+
|     KEYHOLE DASHBOARD       |                     |  MIDNIGHT SMART CONTRACT      |
| - Connected Agents & Scope  |                     |  - scope-policy.compact       |
| - Live Event Stream         |                     |  - Proves:                    |
| - Cryptographic Verification|                     |    field_set(Response)        |
| - Zero Data Exposure        |                     |      ⊆ allowed_fields(Policy) |
+-----------------------------+                     +-------------------------------+
```

---

## 2. Core Components

### A. Data Connector Abstraction (`gateway/src/connectors/`)
All connected services implement `DataConnector`. The gateway core and policy engine know nothing about Gmail or Google Calendar internals:
- `id`: Unique identifier for the connector (e.g. `'gmail'`, `'gcal'`).
- `availableFields`: Comprehensive list of field identifiers supported by the provider.
- `fetch(params)`: Executes authentic remote API calls returning raw data objects.

### B. Policy Engine (`gateway/src/policy-engine.ts`)
1. **Pre-fetch Check**: If the agent's request asks for fields outside the connection's policy (e.g. requesting `body` when the policy only allows `sender` and `subject`), the gateway **immediately terminates the request with HTTP 403**, logs a `BLOCKED` audit event, and **never touches the external API**.
2. **Post-fetch Redaction**: If the request is allowed, records retrieved from the provider are strictly filtered down to the declared `allowed_fields`.
3. **ZK Proof Generation**: The filtered payload and declared policy are passed to the Compact proof circuit.

### C. Compact Zero-Knowledge Contract (`contracts/scope-policy.compact`)
The Midnight Compact contract guarantees that:
- Every field returned to the AI agent is an exact subset of the cryptographic policy commitment (`response_fields ⊆ policy_allowed_fields`).
- The verifier (and dashboard) learns **only** that the access was compliant, without seeing email senders, subjects, bodies, or timestamps.

### D. Live Compliance Dashboard (`dashboard/`)
- A real-time web application built with React, Vite, and Tailwind CSS.
- Subscribes to Server-Sent Events (SSE) from the gateway.
- Displays agent statuses, active scope boundaries, and live compliant/blocked logs.
- **Privacy Guarantees**: Under no circumstances is sensitive email or calendar data displayed in the dashboard.

---

## 3. Threat Model & Guarantees

| Threat / Risk | Keyhole Defense |
|---|---|
| Malicious agent asks for private emails (`body`, `attachments`) | Pre-fetch policy check rejects before hitting Gmail API |
| Prompt injection hijacking an in-scope agent | Gateway enforces server-side field masking regardless of LLM outputs |
| Snooping dashboard observer or network verifier | Compact ZK proof proves compliance without exposing record content |
| Rogue connector or unverified data leak | Append-only tamper-evident audit log with cryptographic proof signatures |
