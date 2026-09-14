---
desc: Universal Security Standards & Zero-Leakage Invariants — Secret Governance, Parameterized Queries, Least Privilege & Air-Gapped Test Isolation
rules: [R_CORE, R_SEC_STD, R_DB, R_PKG, R_LICENSE]
---
# Universal Security Standards & Zero-Leakage Invariants

## 1. Core Principle: Zero-Leakage & Defense-in-Depth

This standard defines the mandatory security invariants for all software, services, libraries, and AI Agent workflows within the **AgentOption** and **Zero Universe** ecosystems. Every AI agent and developer must strictly adhere to these invariants without exception.

---

## 2. Invariant 1: Secrets & Credentials Governance (R_SEC_SECRET)

1. **Absolute Zero Hardcoding**:
   - Never embed passwords, database connection strings, private keys, JWT signing keys, API tokens, or server internal IP addresses in source code, configuration files tracked by Git, unit tests, or commit messages.
   - Any commit attempting to add secrets must be rejected or immediately scrubbed via `git reset` / filter-repo before remote synchronization.
2. **Externalized Secret Injection**:
   - Production secrets must be loaded strictly via Environment Variables (`.env` ignored by Git), OS Secret Stores, or secure Key Vaults (`IConfiguration`).
   - For integration or local development, always provide `.env.example` with dummy values.
3. **Automated Secret Scrubbing**:
   - When executing diagnostic benchmarks or reverse engineering tasks against live enterprise instances, the resulting benchmark reports must contain **only aggregated performance metrics** (row counts, throughput, latency). Database credentials, instance ports, user accounts, and database names must be completely sanitized.

---

## 3. Invariant 2: Database & Data Access Security (R_DB)

1. **Mandatory Parameterized Queries**:
   - 100% of dynamic SQL queries across all ORMs (ZeroData.Sql, ADO.NET, Dapper, EF Core) must use parameterized commands (`@param` / `?`).
   - String concatenation or string interpolation (`$"SELECT ... WHERE id = {userInput}"`) is an immediate blocking defect.
2. **Identifier Whitelisting**:
   - Dynamic table names, column projections, and `ORDER BY` clauses must be strictly matched against internal metadata whitelists or sanitized via dialect-specific escaping (e.g. `[dbo].[Table]`, `"schema"."table"`, `` `table` ``).
3. **Principle of Least Privilege (PoLP)**:
   - Application connections must operate under credentials granting only the minimum necessary privileges (e.g., `db_datareader` + `db_datawriter`). Administrative permissions (`sysadmin`, `db_owner`) are prohibited for routine application runtimes.

---

## 4. Invariant 3: Test Isolation & Environment Segregation (R_SEC_TEST)

1. **Autonomous CI/CD Isolation**:
   - Automated unit and integration test suites committed to repository test projects (`*.Tests.csproj`) must execute **100% in-memory or in mock isolation** (e.g., SQLite In-Memory, WireMock, Mock Repositories).
   - Test suites must never depend on live external network endpoints, internal corporate IPs, or reachable production servers.
2. **Ad-Hoc Real Database Probing**:
   - Benchmarks or exploratory tests against real corporate databases must reside exclusively in ad-hoc scratch scripts outside of the committed test assembly.
   - Test fixtures must not be committed to Git if they reference non-public infrastructure.

---

## 5. Invariant 4: Data Privacy & PII Sanitization

1. **Zero Retention of Sensitive Data**:
   - Personally Identifiable Information (PII) such as customer real names, phone numbers, email addresses, national IDs, and financial records must never be logged, printed to console, or embedded in markdown walkthroughs.
2. **Data Masking in Diagnostics**:
   - Diagnostic queries must mask sensitive fields:
     - Phone: `090****123`
     - Email: `a***@example.com`
     - Tokens/Keys: `eyJhbGciOi...[TRUNCATED]`
3. **Database Dumps & Artifacts**:
   - Physical database backup files (`.bak`, `.mdf`, `.ldf`, raw `.sql` dumps) must never be committed to Git. Enforce in `.gitignore`.

---

## 6. Invariant 5: Dependency & Supply Chain Security (R_PKG, R_LICENSE)

1. **Vulnerability Auditing**:
   - Regularly execute `dotnet list package --vulnerable` or `npm audit` to detect and eliminate high/critical CVEs.
2. **Sovereign Clean-Room Licensing**:
   - Strict prohibition against importing copyleft or viral licensed code (GPL, AGPL) into sovereign permissive projects (MIT/Apache 2.0). Clean-room reimplementation only.
3. **No Machine-Specific Local Paths**:
   - Prohibit hardcoded absolute machine paths (e.g., `E:\Tools\...`, `C:\Users\...`) in checked-in build scripts, `nuget.config`, or `.csproj` files.

---

## 7. Invariant 6: Audit Logging & Immutability (R_EVT, R_ENG_OS)

1. **Write Audit Trails**:
   - All state-mutating operations (INSERT, UPDATE, DELETE, Permission changes) must emit structured audit events containing:
     - Timestamp (UTC)
     - Actor / Subject ID
     - Action & Entity Type
     - Delta / Previous vs New State
2. **Cryptographic Proof Chain**:
   - Security audit findings and pentest reports must record cryptographic hashes (SHA-256) of observed binary artifacts, reproduction commands, and execution evidence.
