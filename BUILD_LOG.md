# Keyhole Engineering Build Log

Comprehensive chronological record of architectural milestones, engineering implementations, cryptographic design decisions, and cloud deployments during the Midnight AI & Privacy Hackathon 2026.

---

### [2026-08-28] - Phase 0 & Phase 1: Toolchain Scaffolding and Compact Circuit Prototyping

* **Toolchain and Compiler Setup**:
  * Configured local Ubuntu Linux and WSL build environment with Node.js 22 LTS, TypeScript 5, and Rust toolchains.
  * Installed official Compact compiler CLI (`compactc` v0.34.0) targeting Compact Runtime 0.19.0 and Midnight ledger protocol 9.1.0.
  * Verified zero-knowledge witness handling, private constraint generation, and ledger state disclosure rules via test circuits.

* **Monorepo Architecture Scaffolding**:
  * Structured repository into decoupled packages:
    * `contracts/`: Midnight Compact smart contracts, ZKIR circuit specifications, and verification test harnesses.
    * `gateway/`: Express/Node.js Zero-Trust Policy Enforcement Gateway, connector abstractions, and proof client.
    * `dashboard/`: React 18 + Vite + TailwindCSS compliance monitoring console with real-time SSE feeds.
    * `sdk/`: Decoupled Python (`keyhole-shield`) and TypeScript (`@keyhole/sdk`) client integration packages.

* **Core Compact Smart Contracts (v1 and v2)**:
  * Authored `contracts/scope-policy.compact` (v1 core subset verification: `(response_field_mask & ~allowed_field_mask) == 0`).
  * Authored `contracts/scope-policy-v2.compact` (v2 multi-dimensional policy circuit incorporating record limits and timestamp recency constraints).
  * Compiled contracts to ZKIR bytecode (`contracts/build/zkir/verify_scope_membership.zkir`) with proving and verification keys.
  * Executed automated test harness (`contracts/test-contract.ts`) verifying compliant proofs, disallowed field rejections, and empty set edge cases.

---

### [2026-08-29] - Phase 2 & Phase 3: Cryptographic Upstream Binding, 9 Connectors, and Pure Light UI

* **Two-Witness Cryptographic Upstream Binding**:
  * Addressed the self-attestation vulnerability in standard privacy proxies by binding the SHA-256 digest of authentic upstream TLS API responses (`raw_upstream_payload_hash: Bytes<32>`) as a required private witness in the circuit.
  * Ensures the gateway cannot fabricate data or forge compliant masks without invalidating the on-chain state commitment.

* **9 Enterprise Connectors and Real API Interceptors**:
  * Built connector abstractions for Google Workspace (Gmail, Google Calendar), Microsoft 365 (Azure Graph), Slack Enterprise Grid, GitHub Enterprise, PostgreSQL SQL Proxy, Salesforce CRM, Notion & Wikis, and Custom REST / OpenAPI Webhooks.
  * Implemented server-side masking, column-level allowlist filtering, and parameter stripping.

* **Active Zero-Day Canary Trap and Session Quarantine**:
  * Designed honeypot honeytoken parameter injection engine.
  * Out-of-scope exfiltration attempts and prompt injections trigger an immediate HTTP 423 session lock, quarantining rogue autonomous agents before external SaaS systems are accessed.

* **Persistence Layer and Cloud Database Synchronization**:
  * Migrated from local storage to Supabase Cloud PostgreSQL with automated bi-directional policy caching and audit trail replication.
  * Integrated Server-Sent Events (SSE) stream at `/api/audit-stream` for sub-100ms live compliance dashboard telemetry.

* **Silicon Valley Pure Light UI Architecture**:
  * Refactored frontend styling to an enterprise light palette (`#f8fafc` canvas, pure white `#ffffff` cards, `#0f172a` typography, and subtle `#e2e8f0` borders).
  * Built animated skeleton screens (`SkeletonLoader.tsx`) and interactive aperture visualizer (`HeroShowcase.tsx`).

---

### [2026-08-30] - Phase 4 & Phase 5: Resend Email OTP Suite, Cloud Production Deployment, and SDK Packaging

* **Resend REST Email Verification and OTP Authentication Suite**:
  * Implemented `gateway/src/email-service.ts` integrating Resend REST API for dark-mode HTML email delivery.
  * Added 6-digit email OTP verification lifecycle:
    * `POST /api/auth/register`: Dispatches branded verification code via Resend.
    * `POST /api/auth/verify-email-otp`: Activates user account in Supabase and issues 7-day signed JWT.
    * `POST /api/auth/resend-otp`: Dispatches fresh verification PIN with 60-second cooldown timer.
    * `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`: Self-service password recovery.
  * Added 1-click instant demo login for judges and evaluators.

* **Automated Security Test Suite**:
  * Authored comprehensive 11-scenario automated test suite (`scratch/full_auth_test_suite.cjs`).
  * Validated 31/31 security checks passing with 100% test coverage across registration, OTP validation, invalid token rejection, duplicate email prevention, and password recovery.

* **Expansion to 30 Active Enterprise Scope Policies**:
  * Populated 30 production-grade scope policies across all 9 connectors (6 Gmail policies, 3 GCal, 3 M365, 3 Slack, 3 GitHub, 3 PostgreSQL, 3 Salesforce, 3 Notion, 3 Custom REST).
  * Upgraded `ConnectedAgents.tsx` with natural flex wrapping (eliminating horizontal scrollbars), instant service category filter pills, and live search.

* **Universal 1-Line Drop-in SDK Packages**:
  * Packaged `sdk/python/` (`keyhole-shield` with `KeyholeShield`, `KeyholeProof`, and tool bindings for CrewAI, LangChain, and AutoGen).
  * Packaged `sdk/typescript/` (`@keyhole/sdk` with OpenAI function tool generation).
  * Added runnable examples (`sdk/examples/python_crewai_demo.py`).

* **Enterprise Account and Security Settings Suite**:
  * Created `/settings` with Profile customization (Name, Role, Organization, Timezone, Security Alert Emails toggle).
  * Added Master Password change form with real-time password strength meter.
  * Added Developer API Key management with 1-click token copy and regeneration.
  * Built backend endpoints: `PUT /api/auth/profile`, `POST /api/auth/change-password`, and `POST /api/auth/api-keys/regenerate`.

* **AWS Cloud Production Deployment and Custom Domain Activation**:
  * Containerized application via Docker multi-stage build.
  * Configured AWS CodeBuild pipeline (`keyhole-builder`) and deployed container to AWS App Runner.
  * Bound custom domain `keyhole.techsangi.com.np` to App Runner CNAME target (`puvyfpwdq6.us-east-1.awsapprunner.com`).
  * Completed AWS Certificate Manager (ACM) DNS validation, achieving active status with full HTTPS SSL encryption.

---

### Verification and Health Check Summary

* **Production Custom Domain**: `https://keyhole.techsangi.com.np`
* **App Runner Direct**: `https://puvyfpwdq6.us-east-1.awsapprunner.com`
* **Health Check**: `GET /api/health` -> Status `healthy`
* **Midnight Prover Latency**: `p50 ~7ms · mean ~10ms · p95 ~22ms` (50-run benchmark, `generateScopeProof()` circuit path)
* **Test Suite Status**: 31 / 31 Automated Checks Passing (100% Pass Rate)
