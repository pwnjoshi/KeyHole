# Keyhole Build Log

Running log of engineering decisions, scope calls, architectural milestones, and implementation notes during the autonomous build.

---

### [2026-08-28] - Phase 0 & Phase 1: Environment Setup & Scaffolding
- **Toolchain Verification**: Verified WSL Ubuntu environment. Installed Compact compiler CLI `v0.34.0` targeting Compact Runtime `0.19.0` and ledger version `9.1.0.0-rc.3`.
- **Compiler Confirmation**: Tested trivial Compact circuit compilation (`test.compact`) with zero-knowledge witness handling and disclosure rules (`disclose(...)`).
- **Monorepo Architecture**: Structured codebase into decoupled packages:
  - `contracts/`: Midnight Compact smart contracts, circuit specifications, and ZK test harness.
  - `gateway/`: Express/Fastify policy enforcement gateway, connector abstractions, proof client, audit logger.
  - `dashboard/`: React + Vite + TailwindCSS compliance monitoring dashboard with live SSE feeds.
  - `agent-demo/`: Realistic multi-scenario autonomous agent runner.
  - `data/`: Seed policies and connection definitions.
  - `docs/`: System architecture and cryptographic flow documentation.

---

### [2026-08-28] - Phase 2: Midnight Compact Smart Contracts (v1 & v2)
- **Compact Circuits Written**:
  - `contracts/scope-policy.compact`: v1 zero-knowledge field allowlist compliance circuit enforcing `response_field_mask ⊆ allowed_field_mask`.
  - `contracts/scope-policy-v2.compact`: v2 circuit extending policy checks with count and recency bounds (`actual_records <= max_records`, `oldest_timestamp >= min_allowed_timestamp`).
- **Compilation**: Compiled both contracts via Compact compiler `v0.34.0`, generating ZKIR circuits, proving/verifying keys, and TypeScript runtime bindings.
- **Test Harness (`contracts/test-contract.ts`)**: Built and executed automated 3-case test harness:
  - Case A (In-Scope): `[sender, subject, date]` $\rightarrow$ Proof succeeded, verified on ledger (`compliance_verified: true`).
  - Case B (Disallowed Field): `[sender, subject, body]` $\rightarrow$ Circuit rejected with ZK constraint assertion error as expected.
  - Case C (Empty Set): $0$ fields $\rightarrow$ Proof succeeded trivially.

---

### [2026-08-28] - Phase 3: 100% Real Live Engine & SQLite Persistence
- **Eliminated All Mock Datasets**:
  - `GmailConnector`: Removed all simulated datasets. All queries execute directly against the real **Google Gmail v1 API** (`gmail.users.messages.list`, `gmail.users.messages.get`). Throws actionable error if not authenticated.
  - `GCalConnector`: Removed mock calendar events. Fetches live events from **Google Calendar v3 API** (`calendar.events.list`).
- **Persistent SQLite Database (`better-sqlite3`)**:
  - Created `data/keyhole.db` with WAL mode enabled.
  - Tables: `users`, `policies`, `audit_events`, `integrations`.
- **In-Dashboard Google OAuth Credentials Manager**:
  - Added dedicated configuration modal in `IntegrationsHub.tsx` (`POST /api/auth/google/credentials`).
  - Allows clients to enter their Google Cloud Client ID and Secret directly in the UI with instant OAuth redirection (`http://localhost:4000/api/auth/google/callback`).

---

### [2026-08-28] - Phase 4: Full Pure Light Mode Redesign, Skeleton Loading & Technical Architecture
- **Pure Light Mode**:
  - Stripped all `dark:` classes across all components, styling, and Tailwind configuration.
  - Premium Silicon Valley enterprise palette: crisp `#f8fafc` canvas, pure white `#ffffff` cards, deep `#0f172a` typography, and subtle `#e2e8f0` borders.
- **Skeleton Screen Loaders (`SkeletonLoader.tsx`)**:
  - Built animated pulse skeletons for Policy cards, SSE Compliance Feed rows, and Telemetry metrics.
- **Interactive Aperture Visualizer & Attack Sandbox (`HeroShowcase.tsx`)**:
  - Real-time interactive slider demonstrating the Keyhole aperture ($25\%$ strict vs $100\%$ exposed room).
  - Embedded Threat Simulation Sandbox comparing raw OAuth vs Keyhole Zero-Knowledge Shielding.
- **Dedicated Technical Whitepaper (`/about`)**:
  - Complete architectural breakdown covering why OAuth 2.0 fails for autonomous agents, Midnight Compact circuit mechanics, and SOC2/HIPAA compliance standards.
- **React Router Navigation & Role-Gated Access Control**:
  - Real routes: `/`, `/about`, `/studio`, `/console`, `/integrations`, `/circuit`, `/analytics`, `/login`.
  - Protected route guards with JWT token verification and Lace Wallet display restricted to authenticated sessions.
