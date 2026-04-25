# Portfolio Remediation Checklist

**Generated:** 2026-03-18 19:15:16 UTC  
**Source:** repo-knowledge DB (`data/knowledge.db`)  
**Scope:** all repos with posture = needs_attention  
**Repos in scope:** 71

---

## Program Summary

| # | Program | Repos affected |
|---|---------|---------------|
| 1 | CI baseline rollout | 67 |
| 2 | Dependency hygiene | 55 |
| 3 | Supply-chain hardening | 59 |
| 4 | SAST rollout | 54 |
| 5 | Test floor enforcement | 60 |

**Total open findings across all repos:** 283 (0 critical, 84 high, 116 medium, 80 low, 3 info)  
**Total failing/warning controls:** 821

---

### local/mcp-org-github

- **Posture:** needs_attention
- **Pass rate:** 87.5%
- **Open findings:** 5 (3 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening

**Failing controls:**
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection rules documented for this specific repo. BRANCH_POLICY.md exists for org-wide policy but enforcemen)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (docs-quality.yml uses actions/checkout@v4 which is below the org's own v6 floor. The org-guard workflow itself checks fo)
- [ ] QUA-004: Dead code, stale TODOs, and abandoned paths reviewed — warn (llms.txt says 32 repos / 8 MCP servers but profile/README.md says 99 repos. This is stale content drift. No TODOs/FIXMEs)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (GitHub Actions not pinned to SHA. Uses major version tags (@v4, @v6, @v17, @v2). Dependabot covers updates but SHA pinni)

**Open findings:**
- [ ] [medium] CODE_OF_CONDUCT.md has placeholder contact method — Replace [INSERT CONTACT METHOD] with an actual contact email or link to the org's reporting mechanism.
- [ ] [medium] docs-quality.yml uses actions/checkout@v4 (below org v6 floor) — Update both checkout@v4 references to actions/checkout@v6 in docs-quality.yml.
- [ ] [medium] llms.txt is stale — reports 32 repos vs 99 in README — Update llms.txt to reflect current repo count and tool inventory. Consider adding a CI check to detect drift between README and llms.txt.
- [ ] [low] GitHub Actions not pinned to SHA — Pin actions to full commit SHAs with version comments: e.g., actions/checkout@<sha> # v6. Dependabot will still propose updates.
- [ ] [low] docs-quality.yml triggers on master branch — Remove 'master' from the branches list in docs-quality.yml push trigger.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/Attestia-Desktop

- **Posture:** needs_attention
- **Pass rate:** 0.6%
- **Open findings:** 6 (2 high, 4 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-004: Least-privilege/network/TLS/resource controls are set or explicitly N/A — warn (Sidecar uses HTTP (not HTTPS) to localhost. Acceptable for local IPC but not documented as security assumption.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — warn (CI exists (publish.yml, pages.yml) but no build/test CI workflow. Only publish on release and pages on push.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI workflow runs build/lint/test on push or PR. publish.yml only runs on release.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No security/dependency/secret scans in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented. Publish only on release (good gating).)
- [ ] CPR-002: Encryption requirements in transit/at rest are satisfied or gap recorded — warn (Sidecar communication is HTTP (unencrypted). Acceptable for localhost but financial data warrants note.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (Packages appear current as of v1.0.2. No automated check against latest versions.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No Dependabot/Renovate configured.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No automated secrets scan. Manual review found no hardcoded secrets.)
- [ ] SCR-004: Secret storage and rotation path documented — warn (No secret rotation documentation. API key stored in appsettings.json (plain text on disk).)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST tool. .NET analyzers enabled via AnalysisLevel=latest but no security-specific analyzers (e.g., Microsoft.CodeAn)
- [ ] SEC-004: Input validation and output encoding are adequate — warn (No length validation on Intent string fields (Id, Kind, Description). No regex validation on blockchain addresses/chainI)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM. Central package management provides partial inventory.)
- [ ] SUP-004: Build/release flow resists tampering and uses trusted sources — warn (No Node.js executable signature verification in sidecar. NodeBundleLocator falls back to system PATH.)
- [ ] TST-001: Test suite executes successfully where present — fail (No test projects found. Testing packages declared in Directory.Packages.props (xunit, Moq, FluentAssertions) but no test)
- [ ] TST-002: Unit coverage exists for critical logic — fail (Zero test coverage. Critical gap for financial software.)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — fail (No integration tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests at all.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — fail (No coverage. Test framework configured but unused.)

**Open findings:**
- [ ] [high] No CI build/test workflow — Add ci.yml running dotnet build, dotnet test, and security analysis on push to src/**.
- [ ] [high] No test projects for financial software — Add test projects for Core models, Client SDK, Sidecar process management, and ViewModel input validation.
- [ ] [medium] Missing input validation on financial models — Add StringLength attributes, regex validation for blockchain addresses and chainIds.
- [ ] [medium] No Node.js executable verification in sidecar — Prefer bundled Node.js, verify executable hash before spawning.
- [ ] [medium] No SAST tooling — Add Microsoft.CodeAnalysis.NetAnalyzers or roslyn-analyzers with security rules.
- [ ] [medium] No dependency update mechanism — Add dependabot.yml for NuGet monthly updates.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/CodeClone-Desktop

- **Posture:** needs_attention
- **Pass rate:** 0.5%
- **Open findings:** 6 (4 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — warn (CI exists (publish.yml, pages.yml) but no build/test workflow.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI for build/lint/test.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No security scans in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented.)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — warn (No central package management. Versions hardcoded in each csproj.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (No automated check against latest versions.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No Dependabot/Renovate.)
- [ ] OBS-001: Structured logging/error reporting is present where appropriate — warn (Debug logging only (Microsoft.Extensions.Logging.Debug). No structured production logging.)
- [ ] OBS-003: Failure diagnostics are actionable — warn (Empty catch blocks provide no diagnostic info.)
- [ ] PRF-003: No obvious pathological loops/N+1/unbounded work — warn (No size limits on JSON deserialization. Diagnostics array could exhaust memory.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No TreatWarningsAsErrors. No EnforceCodeStyleInBuild. NoWarn=CS1591 on Domain.)
- [ ] RUN-002: Crash/data-loss/error paths identified — warn (Empty catch blocks mask errors in SnapshotService and CodeCloneService. Corrupted snapshots silently skipped.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No automated secrets scan.)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST tool. No security-specific analyzers.)
- [ ] SEC-002: No critical injection/deserialization/RCE-class patterns — fail (Subprocess argument injection: CodeCloneService.cs passes repoPath via string interpolation into Arguments instead of Ar)
- [ ] SEC-004: Input validation and output encoding are adequate — fail (No path normalization/validation before file reads. No bounds on JSON deserialization array sizes. repoPath in subproces)
- [ ] SEC-006: Security-relevant warnings are triaged or justified — warn (Empty catch blocks in 4 locations silently swallow errors.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] TST-001: Test suite executes successfully where present — fail (No test projects.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (Zero coverage.)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — fail (No tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests for path traversal, JSON edge cases, subprocess argument escaping.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — fail (No coverage.)

**Open findings:**
- [ ] [high] No CI build/test workflow — Add ci.yml with dotnet build, test, and security analysis.
- [ ] [high] No test projects — Add CodeClone.Tests project with path traversal, JSON edge case, and subprocess argument tests.
- [ ] [high] Path traversal in MainViewModel.LoadFileContent — Normalize with Path.GetFullPath and validate StartsWith(repoRoot).
- [ ] [high] Subprocess argument injection in CodeCloneService — Use ProcessStartInfo.ArgumentList instead of string-interpolated Arguments.
- [ ] [medium] No SAST tooling — Add security analyzers to Directory.Build.props.
- [ ] [medium] No dependency update mechanism — Add dependabot.yml for NuGet.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/ConsensusOS

- **Posture:** needs_attention
- **Pass rate:** 64.2%
- **Open findings:** 4 (2 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-003: No critical misconfigurations in infra/config — warn (Dockerfile not fully audited for base image pinning, USER directive, or layer minimization.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow for build/test. Only docker.yml (GHCR publish), npm.yml (npm publish), pages.yml (site). Build and test n)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI runs build or test.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No SAST, dep audit, or secret scanning in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented.)
- [ ] CON-002: Base images are current, minimal, and pinned — warn (Dockerfile base image pinning not verified.)
- [ ] CON-003: Containers do not run as root without formal exception — warn (USER directive not verified.)
- [ ] CON-004: Container hardening is present or gap explicitly recorded — warn (Container hardening not verified.)
- [ ] MON-002: Alerting/monitoring ownership and thresholds documented or explicit gap recorded — warn (No external alerting. Health checks are internal only.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (tsc --noEmit as lint. No eslint/prettier.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual SAST review. No automated SAST.)
- [ ] SEC-003: Authn/authz checks exist where privileged actions exist — warn (Plugin system has trust boundary (third-party plugins are untrusted). Event bus accepts unvalidated payloads from plugin)
- [ ] SEC-004: Input validation and output encoding are adequate — warn (RPC responses from XRPL nodes parsed with type casting (as Record<string, unknown>) without schema validation. Malformed)
- [ ] SEC-005: Crypto/session/secret handling uses safe APIs and patterns — fail (Signature verification in release-verifier.ts is a placeholder: defaultSignatureVerifier accepts any non-empty string as)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM (zero deps).)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing. Docker image pushed to GHCR.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage tooling configured.)

**Open findings:**
- [ ] [high] No CI workflow for build/test — Add ci.yml with npm ci, tsc, vitest run, npm audit.
- [ ] [high] Signature verification is a placeholder — Implement real signature verification with ED25519 or ECDSA public key.
- [ ] [medium] Dockerfile not audited for hardening — Review Dockerfile for pinned base image, non-root USER, multi-stage build.
- [ ] [medium] RPC responses parsed without schema validation — Add Zod or manual schema validation for RPC response shapes.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/InControl-Desktop

- **Posture:** needs_attention
- **Pass rate:** 72.5%
- **Open findings:** 4 (1 medium, 3 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] BDR-002: Backup/restore strategy documented or explicit gap recorded — warn (No backup mechanism for user conversations)
- [ ] BDR-003: Disaster-recovery/manual recovery steps documented or explicit gap recorded — warn (No DR documented for user data)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate configured)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback mechanism for NuGet packages. Desktop versioning allows side-by-side)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (dotnet format check in CI but uses continue-on-error:true — format violations don't block)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions NOT pinned to SHA (uses @v4 tags))
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No explicit security edge case tests)

**Open findings:**
- [ ] [medium] GitHub Actions not pinned to SHA — Pin actions/checkout@v4 etc. to commit SHAs
- [ ] [low] Format check uses continue-on-error — Remove continue-on-error to enforce formatting
- [ ] [low] No SBOM generated — Add dotnet-sbom or CycloneDX tool
- [ ] [low] No branch protection documented — Document or enable branch protection

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/LeaseGate

- **Posture:** needs_attention
- **Pass rate:** 0.6%
- **Open findings:** 5 (3 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — warn (policy-ci.yml exists but only covers policy tests. No general CI for build+full test.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI workflow runs full build+test on all projects.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No security/dep scans in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (Policy CI gates on tests. No general branch protection.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (No automated outdated check.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate.)
- [ ] DPL-001: Deployment scripts/manifests/path reviewed — warn (Policy bundles published via GitHub releases. No NuGet publish workflow for libraries.)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No documented rollback.)
- [ ] LIC-003: Attribution/license-file obligations satisfied — fail (NO LICENSE FILE in repository. GitHub reports null license. Critical for open-source compliance.)
- [ ] LIC-004: Unknown or ambiguous licenses triaged — fail (Repo has no license — all rights reserved by default.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No explicit TreatWarningsAsErrors or EnforceCodeStyleInBuild found.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No automated secrets scan.)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST tool configured.)
- [ ] SEC-002: No critical injection/deserialization/RCE-class patterns — warn (Shell metacharacter blocking is solid (UseShellExecute=false, IndexOfAny blocklist). BUT path traversal in GovernanceRec)
- [ ] SEC-004: Input validation and output encoding are adequate — fail (Path traversal: GovernanceReceiptService.SaveBundle(outputPath) writes to arbitrary path without Path.GetFullPath valida)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No explicit path traversal tests for GovernanceReceiptService.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting.)

**Open findings:**
- [ ] [high] No LICENSE file in repository — Add MIT LICENSE file to match other org repos.
- [ ] [high] No general CI build/test workflow — Add ci.yml with dotnet build LeaseGate.sln, dotnet test.
- [ ] [high] Path traversal in GovernanceReceiptService — Validate with Path.GetFullPath and ensure paths stay within allowed root directories.
- [ ] [medium] No SAST tooling — Add security analyzers. Critical for governance software.
- [ ] [medium] No dependency update mechanism — Add dependabot.yml.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/LeaseGate-Lite

- **Posture:** needs_attention
- **Pass rate:** 66.3%
- **Open findings:** 4 (1 high, 2 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No security/dependency scan in CI (but Dependabot configured))
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback documented)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No explicit format enforcement in CI)
- [ ] SEC-003: Authn/authz checks exist where privileged actions exist — warn (Daemon on localhost:5177 has no authentication. Documented as by-design for home-PC scope in SECURITY.md)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions NOT pinned to SHA)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — fail (Large binaries committed: LeaseGateLite-v0.1.0-win-x64.zip (51.5MB), dist/ and release-test/ dirs with compiled DLLs/EXE)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — warn (No integration/E2E tests)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No security edge case tests for daemon HTTP API)

**Open findings:**
- [ ] [high] Large binaries committed to repo (51.5MB+) — Remove committed binaries. Use GitHub Releases for distribution. Add to .gitignore and use git filter-branch or BFG to clean history
- [ ] [medium] Daemon HTTP API has no authentication — Documented as by-design for home-PC. Consider adding opt-in auth for shared machines
- [ ] [medium] GitHub Actions not pinned to SHA — Pin actions to commit SHAs
- [ ] [low] No SBOM generated — Add dotnet-sbom tool

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/LoKey-Typer

- **Posture:** needs_attention
- **Pass rate:** 0.5%
- **Open findings:** 5 (1 high, 2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — warn (deploy.yml exists but only builds and deploys. No lint/test step.)
- [ ] CIC-002: CI runs build/lint/test — fail (CI does not run lint or test.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No security scans in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (High vulns in dev deps: flatted DoS, minimatch ReDoS.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (Dev deps have known vulns.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No Dependabot/Renovate.)
- [ ] QUA-001: Primary build/lint commands run successfully — warn (tsc passes but ESLint has 10 errors (React hooks violations).)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (ESLint configured but 10 errors not fixed.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No secrets scan.)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST. ESLint has react-hooks but no security rules.)
- [ ] SEC-006: Security-relevant warnings are triaged or justified — warn (10 ESLint errors unfixed.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] TST-001: Test suite executes successfully where present — fail (No test files found.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (Zero coverage.)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — fail (No tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — fail (No coverage.)

**Open findings:**
- [ ] [high] No tests — Add vitest with tests for typing logic, personalization engine, and ambient scheduling.
- [ ] [medium] 10 ESLint errors unfixed — Fix ESLint errors or add lint step to CI to catch regressions.
- [ ] [medium] CI does not run lint or test — Add lint and test steps before deploy.
- [ ] [low] No SAST tooling — Add eslint-plugin-security.
- [ ] [low] No dependency update mechanism — Add dependabot.yml.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/Registrum

- **Posture:** needs_attention
- **Pass rate:** 77.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — fail (No CI.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage.)

**Open findings:**
- [ ] [high] No CI
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/ScalarScope

- **Posture:** needs_attention
- **Pass rate:** 59.0%
- **Open findings:** 3 (2 high, 1 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — warn (Only pages.yml. No CI.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI. Only pages.yml.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — fail (No SECURITY.md.)
- [ ] TST-001: Test suite executes successfully where present — fail (No tests.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)

**Open findings:**
- [ ] [high] Empty scaffold - no code or tests
- [ ] [high] No CI
- [ ] [medium] No SECURITY.md

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/VectorCaliper

- **Posture:** needs_attention
- **Pass rate:** 77.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — fail (No CI.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage.)

**Open findings:**
- [ ] [high] No CI
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/ai-jam-sessions

- **Posture:** needs_attention
- **Pass rate:** 61.7%
- **Open findings:** 4 (1 high, 2 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-003: No critical misconfigurations in infra/config — warn (Dockerfile not audited for hardening.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No dep audit, SAST, or secret scanning in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented.)
- [ ] CON-002: Base images are current, minimal, and pinned — warn (Dockerfile not audited for base image pinning.)
- [ ] CON-003: Containers do not run as root without formal exception — warn (USER directive not verified.)
- [ ] CON-004: Container hardening is present or gap explicitly recorded — warn (Container hardening not verified.)
- [ ] DEP-002: No unresolved critical dependency vulnerabilities — warn (Cannot run npm audit (pnpm project, no package-lock.json). pnpm audit not run locally.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (Cannot verify via npm audit.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (@modelcontextprotocol/sdk 1.26.0 vs 1.27.1. vitest/coverage major behind.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate. No dep audit in CI.)
- [ ] LIC-002: No prohibited or policy-conflicting licenses — warn (vocal-synth-engine is GitHub dep pinned to commit hash — license not verified in lockfile.)
- [ ] LIC-004: Unknown or ambiguous licenses triaged — warn (vocal-synth-engine license status unknown (GitHub commit dep).)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (TypeScript strict. No eslint/prettier configured.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual SAST review. No automated SAST.)
- [ ] SEC-002: No critical injection/deserialization/RCE-class patterns — fail (cli.ts uses child_process.exec() for openInBrowser with string interpolation. File paths are quoted but not escaped — ba)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (vocal-synth-engine pinned to GitHub commit hash (not semver). Other deps pinned via pnpm-lock.yaml.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No security-specific tests (e.g., path traversal in song loader, exec injection).)

**Open findings:**
- [ ] [high] CLI uses exec() for browser open — command injection risk — Replace exec() with execFile() or spawn() with shell:false. Pass filePath as argv, not template string.
- [ ] [medium] Dockerfile not audited — Audit Dockerfile for pinned base image, non-root USER, minimal layers.
- [ ] [medium] GitHub commit hash dependency (vocal-synth-engine) — Publish vocal-synth-engine to npm with semver. Verify its license.
- [ ] [low] No linter configured — Add eslint config.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/ai-ui

- **Posture:** needs_attention
- **Pass rate:** 0.8%
- **Open findings:** 6 (2 high, 3 medium, 1 info)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow for core code. Only pages.yml exists (site deployment only). No build/test/lint/audit in CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI runs build/lint/test. Tests only run locally.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No security/dependency/secret scans in CI.)
- [ ] CIC-004: CI secrets handled securely — warn (Pages workflow uses standard actions with minimal permissions. No secrets in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No documented branch protection. Pages workflow has concurrency control.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (1 moderate vulnerability in devalue (transitive from astro): prototype pollution GHSA-cfw5-2vxh-hr84. Fix available via )
- [ ] DEP-005: Stale/EOL dependencies identified — warn (astro pinned to ^5.5.0, current installed 5.18.0, latest is 6.0.5 (major version behind).)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No dependabot.yml or Renovate configured. No documented update cadence.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter/linter configured. @ts-check used in all MJS files.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST in CI. Manual review performed.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (npm packages not signed.)
- [ ] SUP-004: Build/release flow resists tampering and uses trusted sources — warn (No CI build verification. Local build only.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No code coverage tool configured. No coverage reporting.)

**Open findings:**
- [ ] [high] CI does not run build/lint/test — Add build/test/audit steps to CI workflow
- [ ] [high] No CI workflow for core code — Add a ci.yml workflow that runs npm test, npm audit, and optionally lint on push/PR to src/**, cli/**, package.json
- [ ] [medium] Moderate prototype pollution in devalue — Run npm audit fix to update devalue
- [ ] [medium] No dependency update automation — Add dependabot.yml with monthly npm + github-actions updates
- [ ] [medium] No security scans in CI — Add npm audit and optionally semgrep to CI
- [ ] [info] No SBOM generated — Generate SBOM with syft or cyclonedx-npm

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/ambient-wavs

- **Posture:** needs_attention
- **Pass rate:** 64.0%
- **Open findings:** 7 (3 high, 1 medium, 3 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — warn (No CI config. Only tsconfig.json.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No .github directory. No CI configuration.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (@types/node ^22.0.0, current is 25.x. typescript ^5.4.0 OK.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate. Private prototype.)
- [ ] INV-003: Maintainer/owner/operational responsibility identifiable — warn (No author field in package.json. Private project. Org ownership via GitHub.)
- [ ] LIC-003: Attribution/license-file obligations satisfied — fail (No LICENSE file. No license field in package.json.)
- [ ] OBS-003: Failure diagnostics are actionable — warn (HTTP errors return generic text with no server-side logging.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] PRF-003: No obvious pathological loops/N+1/unbounded work — warn (readFileSync in HTTP handler blocks event loop. OK for prototype/dev.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter or linter configured.)
- [ ] RUN-002: Crash/data-loss/error paths identified — warn (Server uses readFileSync—if file disappears between existsSync and read, unhandled error.)
- [ ] RUN-003: Timeouts/retries/resource boundaries are reasonable — warn (No HTTP connection timeouts. readFileSync blocks event loop for ~5MB WAV files.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No secrets scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST tool.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] TST-001: Test suite executes successfully where present — fail (No test suite. No test script in package.json.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No unit tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests at all.)

**Open findings:**
- [ ] [high] CI does not run build/test — Add CI workflow.
- [ ] [high] No CI configuration — Add ci.yml with tsc --noEmit check.
- [ ] [high] No LICENSE file — Add LICENSE file (MIT recommended) and license field to package.json.
- [ ] [medium] No test suite — Add basic tests for DSP primitives and WAV encoding.
- [ ] [low] No HTTP connection timeouts — Add server.timeout or request timeouts.
- [ ] [low] No server-side HTTP error logging — Log 404/400/403 responses to stderr.
- [ ] [low] readFileSync blocks event loop in HTTP handler — Use async readFile with streaming for WAV files.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/anchor

- **Posture:** needs_attention
- **Pass rate:** 52.5%
- **Open findings:** 6 (2 high, 3 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] BDR-002: Backup/restore strategy documented or explicit gap recorded — warn (No backup mechanism)
- [ ] BDR-003: Disaster-recovery/manual recovery steps documented or explicit gap recorded — warn (No DR documented)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (NO CI/CD workflows at all. No .github/workflows/ directory)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — fail (No CI, no branch protection)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No Dependabot/Renovate. No CI. No automated dep updates)
- [ ] DPL-001: Deployment scripts/manifests/path reviewed — warn (No deployment pipeline. Manual builds only)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback mechanism)
- [ ] OBS-001: Structured logging/error reporting is present where appropriate — warn (Rust uses Result types but no structured logging framework)
- [ ] QUA-001: Primary build/lint commands run successfully — warn (No CI to verify builds. Local build works. 166 Rust tests available)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter enforcement. CONTRIBUTING.md has style rules but no automated check)
- [ ] QUA-003: Major complexity/duplication hotspots identified and bounded — warn (168 instances of unwrap/panic/todo in Rust. Contributing rules forbid in production paths)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST. No CI at all. Manual review found path traversal risk and weak hashing)
- [ ] SEC-002: No critical injection/deserialization/RCE-class patterns — warn (No eval/exec/innerHTML. But save_project/load_project accept user-supplied paths without validation)
- [ ] SEC-004: Input validation and output encoding are adequate — warn (File path parameter not validated in save/load commands. Tauri capabilities may limit scope)
- [ ] SEC-005: Crypto/session/secret handling uses safe APIs and patterns — warn (djb2 hash (non-cryptographic, 32-bit) for integrity. Detects corruption but not tampering. No encryption at rest)
- [ ] SEC-006: Security-relevant warnings are triaged or justified — warn (No SECURITY.md. No vulnerability disclosure process)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-004: Build/release flow resists tampering and uses trusted sources — warn (No CI to verify builds. Manual build only)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — warn (No frontend tests for React components)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting)

**Open findings:**
- [ ] [high] No CI/CD workflows exist — Create ci.yml with cargo test, cargo clippy, npm audit, tsc --noEmit
- [ ] [high] No SECURITY.md or vulnerability disclosure policy — Create SECURITY.md with threat model, reporting channel, response SLA
- [ ] [medium] 168 unwrap/panic/todo instances in Rust — Audit and replace production-path unwraps with Result propagation
- [ ] [medium] No path validation on save/load file operations — Add path validation or use Tauri filesystem sandbox API
- [ ] [medium] djb2 hash (non-cryptographic) used for integrity — Upgrade to SHA-256 via sha2 crate for tamper detection
- [ ] [low] No dependency update mechanism — Add Dependabot configuration

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/avatar-runtime

- **Posture:** needs_attention
- **Pass rate:** 68.0%
- **Open findings:** 4 (3 high, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — fail (No CI.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — fail (No SECURITY.md.)
- [ ] LIC-003: Attribution/license-file obligations satisfied — fail (No LICENSE file.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (Minimal.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage.)

**Open findings:**
- [ ] [high] No CI
- [ ] [high] No LICENSE file
- [ ] [high] No SECURITY.md
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/backprop

- **Posture:** needs_attention
- **Pass rate:** 0.8%
- **Open findings:** 6 (3 medium, 2 low, 1 info)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No pnpm audit, no SAST, no secret scan in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No documented branch protection.)
- [ ] CON-002: Base images are current, minimal, and pinned — warn (Base image node:22-slim not pinned to specific SHA. Uses latest node:22-slim tag.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (1 high vuln in rollup >=4.0.0 <4.59.0 (path traversal GHSA-mw96-cpmx-2vgc), dev dep via vitest>vite. 1 moderate in esbui)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No dependabot.yml or Renovate configured.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter/linter configured beyond tsc strict.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST in CI. Manual code review performed.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (npm packages not signed.)

**Open findings:**
- [ ] [medium] CI lacks audit and SAST steps — Add pnpm audit step to CI
- [ ] [medium] High vulnerability in rollup (dev dep) — Update vitest to pull in newer vite/rollup
- [ ] [medium] No dependency update automation — Add dependabot.yml
- [ ] [low] Docker base image not pinned to SHA — Pin to specific digest: FROM node:22-slim@sha256:<hash>
- [ ] [low] Moderate vulnerability in esbuild (dev dep) — Update vitest to pull in newer vite/esbuild
- [ ] [info] No SBOM generated — Generate SBOM with syft or cyclonedx-npm

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/claude-guardian

- **Posture:** needs_attention
- **Pass rate:** 67.9%
- **Open findings:** 7 (3 high, 2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (dep-audit job runs npm audit --omit=dev (dependency scan). No SAST tool (semgrep/codeql) in CI. No secret scanning in CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection rules documented. No required status checks documented. CI runs on push to main and PRs but enforce)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (3 high severity transitive vulnerabilities: hono<=4.12.6 (cookie injection, SSE injection, file access, prototype pollut)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (6 outdated packages: @types/archiver (6→7), @types/node (22→25), @vitest/coverage-v8 (3→4), commander (13→14), pidusage )
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (CI has dep-audit job (npm audit --omit=dev). No Dependabot/Renovate configured. No documented update cadence.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (TypeScript strict mode enforced via tsconfig.json. No explicit linter (eslint/prettier) configured. Code style is consis)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual SAST review performed (no semgrep/codeql in CI). Reviewed all 17 source files for injection, deserialization, RCE)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated. package-lock.json serves as de facto dependency inventory. No cyclonedx/syft/spdx output.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (npm packages are not signed. No provenance attestation. No GPG signing on releases.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No explicit security edge case tests (e.g., path traversal in outputPath, malformed JSON in state files, race conditions)

**Open findings:**
- [ ] [high] High CVE in transitive @hono/node-server<1.19.10 via @modelcontextprotocol/sdk — Run npm audit fix to update @modelcontextprotocol/sdk
- [ ] [high] High CVE in transitive express-rate-limit@8.2.1 via @modelcontextprotocol/sdk — Run npm audit fix to update @modelcontextprotocol/sdk
- [ ] [high] High CVEs in transitive dependency hono<=4.12.6 via @modelcontextprotocol/sdk — Run npm audit fix to update @modelcontextprotocol/sdk to a version shipping hono>4.12.6
- [ ] [medium] No automated SAST or secret scanning in CI — Add semgrep or CodeQL step to CI workflow. Add gitleaks step for secret scanning.
- [ ] [medium] guardian_doctor outputPath lacks path validation — Add path validation to ensure outputPath is within user home directory or ~/.claude-guardian/
- [ ] [low] No SBOM generated — Add SBOM generation step to CI or release workflow (e.g., npx @cyclonedx/cyclonedx-npm).
- [ ] [low] No linter/formatter enforcement configured — Add eslint and/or prettier configuration for consistent style enforcement.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/claude-memories

- **Posture:** needs_attention
- **Pass rate:** 63.0%
- **Open findings:** 7 (3 high, 2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow for build/test/lint. Only pages.yml exists (site deployment). Build and test are not run in CI on push or)
- [ ] CIC-002: CI runs build/lint/test — fail (CI does not run build, lint, or test. No ci.yml workflow exists.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No SAST, dependency audit, or secret scanning in CI (no CI exists).)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented. No required status checks (no CI to enforce).)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (ai-loadout significantly outdated: 1.1.0 installed vs 1.4.2 latest (3 minor versions behind). @types/node minor version )
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate configured. No documented update cadence. No CI to enforce dep checks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (TypeScript strict mode enabled. No eslint/prettier configured. Code style is consistent but not machine-enforced.)
- [ ] RUN-002: Crash/data-loss/error paths identified — warn (File I/O in analyzeMemoryMd() lacks try-catch around readFileSync and readdirSync. Unreadable files will crash the tool )
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual SAST review performed on all 7 source files. No automated SAST tool in CI (no CI exists at all).)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated. package-lock.json serves as informal dep inventory.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (npm packages not signed. No provenance attestation.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No tests for file I/O errors (unreadable files, permission denied). No tests for symlink loops in scanDir. No adversaria)

**Open findings:**
- [ ] [high] CI does not run build/lint/test — Add build+test jobs to CI workflow.
- [ ] [high] No CI workflow for build/test — Add ci.yml with npm ci, npm run build, npm test, npm audit steps. Use paths filter for src/**, tests/**, package.json.
- [ ] [high] No security scanning in CI — Add npm audit, semgrep/codeql, and gitleaks steps to CI.
- [ ] [medium] File I/O lacks error handling in analyzeMemoryMd — Wrap file I/O in try-catch with graceful error messages.
- [ ] [medium] ai-loadout dependency significantly outdated — Run npm update @mcptoolshop/ai-loadout to update to ^1.4.2.
- [ ] [low] No SBOM generated — Add SBOM generation to CI or release workflow.
- [ ] [low] No linter/formatter configured — Add eslint and/or prettier configuration.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/claude-session-copilot

- **Posture:** needs_attention
- **Pass rate:** 74.0%
- **Open findings:** 6 (2 high, 2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No SAST or secrets scanning.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (3 high vulns: hono (5 advisories), @hono/node-server (auth bypass), express-rate-limit (rate limit bypass). All transiti)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (@types/node ^22.0.0, current is 25.x.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter configured.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No secrets scanner in CI.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST in CI.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (0 tests. node --test finds no test files.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No unit tests despite 9 source files.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests at all.)

**Open findings:**
- [ ] [high] 3 high transitive dependency vulnerabilities — Run npm audit fix to update transitive deps.
- [ ] [high] No tests — Add tests for Store, DecisionLog, Timeline, SnapshotManager, PatternDetector.
- [ ] [medium] No SAST in CI
- [ ] [medium] No secrets scanner in CI
- [ ] [low] No SBOM
- [ ] [low] No package signing

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/clearance-opinion-engine

- **Posture:** needs_attention
- **Pass rate:** 69.1%
- **Open findings:** 5 (2 medium, 3 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No dep audit in CI (no deps to audit). No SAST (semgrep/codeql). No secret scanning (gitleaks).)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented.)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — fail (No package-lock.json present. npm audit cannot run (ENOLOCK error). While there are zero deps, lockfile is still expecte)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No eslint/prettier configured. Code style consistent (ES modules) but not machine-enforced.)
- [ ] RUN-003: Timeouts/retries/resource boundaries are reasonable — warn (No explicit fetch timeout configured (relies on default ~30s). Retry with exponential backoff (2 retries, 500ms base). B)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual SAST review of all 44 files. No automated SAST in CI.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM. Zero deps so minimal surface, but still best practice.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (No package-lock.json. Zero deps but lockfile expected for npm ecosystem consistency.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing or provenance.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage tooling configured in package.json. No coverage badge.)

**Open findings:**
- [ ] [medium] Missing package-lock.json — Run npm i --package-lock-only to generate a lockfile.
- [ ] [medium] No SAST or secret scanning in CI — Add gitleaks step to CI. Consider semgrep for JS SAST.
- [ ] [low] No SBOM generated — Generate minimal SBOM.
- [ ] [low] No explicit fetch timeout configuration — Add AbortController with configurable timeout to fetch calls.
- [ ] [low] No linter/formatter configured — Add eslint config.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/commandui

- **Posture:** needs_attention
- **Pass rate:** 66.3%
- **Open findings:** 5 (3 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] BDR-002: Backup/restore strategy documented or explicit gap recorded — warn (No backup mechanism for user's local SQLite database)
- [ ] BDR-003: Disaster-recovery/manual recovery steps documented or explicit gap recorded — warn (No disaster recovery documented for user data)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No security/dependency/secret scans in CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate configured)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback mechanism documented for desktop releases)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (Prettier configured but lint script echoes 'lint not configured yet'. No ESLint/clippy in CI)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No formal SAST (semgrep/codeql) in CI. Manual review found no injection patterns)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions NOT pinned to SHA (uses @v4 tags). Should pin to commit SHAs)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (MSI binary (4.9MB) committed to repo. Release artifacts should be in GitHub Releases only, not repo)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — warn (No E2E tests. Desktop app testing requires Tauri test harness)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No security edge case tests (e.g., command injection via PTY))
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting configured)

**Open findings:**
- [ ] [medium] GitHub Actions not pinned to SHA — Pin actions/checkout@v4, actions/setup-node@v4, etc. to specific commit SHAs
- [ ] [medium] MSI binary committed to repo — Remove binary from repo, distribute only via GitHub Releases. Add *.msi to .gitignore
- [ ] [medium] No security scans in CI — Add npm audit, cargo audit, or secret scanning to CI
- [ ] [low] Lint not configured — Configure ESLint for TS/React and clippy for Rust
- [ ] [low] No SBOM generated — Add SBOM generation for npm and cargo deps

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/deltamind

- **Posture:** needs_attention
- **Pass rate:** 0.8%
- **Open findings:** 3 (1 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI for core code. Only pages.yml.)
- [ ] CIC-002: CI runs build/lint/test — fail (Tests never run in CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No scans in CI.)
- [ ] CIC-004: CI secrets handled securely — warn (Pages standard.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No dependabot.)
- [ ] INV-001: README present and materially current — warn (README.md present. 7 translations. No SECURITY.md, no CHANGELOG.md.)
- [ ] INV-003: Maintainer/owner/operational responsibility identifiable — warn (Private monorepo. No author field in root package.json.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter configured.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (Not signed.)
- [ ] SUP-004: Build/release flow resists tampering and uses trusted sources — warn (No CI build verification.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage tool.)

**Open findings:**
- [ ] [high] No CI for core code — Add ci.yml with npm test across workspaces
- [ ] [medium] Missing SECURITY.md and CHANGELOG.md — Add SECURITY.md and CHANGELOG.md
- [ ] [medium] No dependabot — Add dependabot.yml

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/feature-reacher

- **Posture:** needs_attention
- **Pass rate:** 0.8%
- **Open findings:** 4 (1 high, 1 medium, 1 low, 1 info)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No audit or SAST in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection.)
- [ ] CON-002: Base images are current, minimal, and pinned — warn (Base image node:22-slim not pinned to SHA.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (2 high (flatted DoS, minimatch ReDoS), 2 moderate (ajv ReDoS, Next.js CSRF). Fix available via npm audit fix.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (next 16.1.6, latest 16.1.7.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No dependabot.)
- [ ] MON-002: Alerting/monitoring ownership and thresholds documented or explicit gap recorded — warn (No alerting documented.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST in CI.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (Not signed.)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — warn (No e2e tests for web UI.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage tool configured.)

**Open findings:**
- [ ] [high] 4 dependency vulnerabilities — npm audit fix
- [ ] [medium] No dependabot — Add dependabot.yml
- [ ] [low] Docker base image not pinned to SHA — Pin to specific digest
- [ ] [info] No SBOM — Generate SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/game-dev-mcp

- **Posture:** needs_attention
- **Pass rate:** 73.0%
- **Open findings:** 4 (1 high, 2 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No dep audit.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (Some outdated.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] RUN-002: Crash/data-loss/error paths identified — warn (Game engine errors need handling.)
- [ ] RUN-003: Timeouts/retries/resource boundaries are reasonable — warn (External engine timeouts.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST. Critical for game engine control.)
- [ ] SEC-002: No critical injection/deserialization/RCE-class patterns — warn (Controls external game engines. Need to verify input sanitization.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (0 test files. vitest fails.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests. Critical for game engine control.)

**Open findings:**
- [ ] [high] No test files
- [ ] [medium] Game engine input sanitization unverified
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/homebrew-core

- **Posture:** needs_attention
- **Pass rate:** 78.6%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] SAST rollout

**Failing controls:**
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] LIC-001: Third-party licenses inventoried — fail (No LICENSE file)
- [ ] LIC-002: No prohibited or policy-conflicting licenses — warn (Upstream BSD, but no LICENSE in fork)
- [ ] LIC-003: Attribution/license-file obligations satisfied — fail (Missing)
- [ ] LIC-004: Unknown or ambiguous licenses triaged — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)

**Open findings:**
- [ ] [high] Missing LICENSE file
- [ ] [medium] Missing SECURITY.md
- [ ] [low] Branch protection not verified

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/homebrew-mcp-tools

- **Posture:** needs_attention
- **Pass rate:** 75.9%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] SAST rollout

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] LIC-001: Third-party licenses inventoried — fail (No LICENSE)
- [ ] LIC-002: No prohibited or policy-conflicting licenses — warn
- [ ] LIC-003: Attribution/license-file obligations satisfied — fail
- [ ] LIC-004: Unknown or ambiguous licenses triaged — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)

**Open findings:**
- [ ] [high] Missing LICENSE file
- [ ] [medium] Missing SECURITY.md
- [ ] [low] Branch protection not verified

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/homevault

- **Posture:** needs_attention
- **Pass rate:** 80.8%
- **Open findings:** 4 (1 high, 1 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflows)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage)

**Open findings:**
- [ ] [high] No CI workflows at all
- [ ] [medium] Missing SECURITY.md
- [ ] [low] No CHANGELOG
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/integradio

- **Posture:** needs_attention
- **Pass rate:** 77.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — fail (No CI workflow.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage.)

**Open findings:**
- [ ] [high] No CI workflow — Add ci.yml with pytest.
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/llm-sync-drive

- **Posture:** needs_attention
- **Pass rate:** 77.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No audit.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No protection.)
- [ ] CPR-003: Retention/deletion/privacy obligations documented where applicable — warn (OAuth token persistence not documented.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — fail (No SECURITY.md. Google Drive API access needs security docs.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SCR-004: Secret storage and rotation path documented — warn (OAuth token storage not documented.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST. Uses Google API.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No OAuth flow tests.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage.)

**Open findings:**
- [ ] [high] No SECURITY.md — Add SECURITY.md documenting OAuth flow and token storage.
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/mcp-aside

- **Posture:** needs_attention
- **Pass rate:** 74.0%
- **Open findings:** 3 (2 high, 1 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-002: CI runs build/lint/test — warn (CI may only build (no test script).)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No dep audit.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (High transitive vulns (hono via MCP SDK).)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (@types/node ^22.0.0.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (No test script. 0 tests.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests.)

**Open findings:**
- [ ] [high] High transitive dep vulns (hono via MCP SDK) — npm audit fix.
- [ ] [high] No tests
- [ ] [medium] No SAST

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/mcp-examples

- **Posture:** needs_attention
- **Pass rate:** 85.2%
- **Open findings:** 2 (1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)
- [ ] TST-001: Test suite executes successfully where present — warn (No tests)

**Open findings:**
- [ ] [medium] Missing SECURITY.md
- [ ] [low] Branch protection not verified

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/mcp-file-forge

- **Posture:** needs_attention
- **Pass rate:** 63.0%
- **Open findings:** 4 (3 high, 1 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — fail (No CI workflow. Only pages.yml and publish.yml.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (High transitive vulns (hono via MCP SDK, ajv ReDoS).)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (Some outdated.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] PRF-003: No obvious pathological loops/N+1/unbounded work — warn (Unbounded file operations potential.)
- [ ] RUN-002: Crash/data-loss/error paths identified — warn (File operations need robust error handling.)
- [ ] RUN-003: Timeouts/retries/resource boundaries are reasonable — warn (File operations should have size limits.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST. Critical for file operations tool.)
- [ ] SEC-002: No critical injection/deserialization/RCE-class patterns — warn (File operations tool needs review for path traversal. Claims sandboxed.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (0 test files found. vitest configured but exits with code 1.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests. Critical for file operations tool.)

**Open findings:**
- [ ] [high] High transitive dep vulns — npm audit fix.
- [ ] [high] No CI workflow — Add ci.yml with build + lint + test.
- [ ] [high] No test files
- [ ] [medium] File operations need sandboxing review

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/mcp-personify

- **Posture:** needs_attention
- **Pass rate:** 77.1%
- **Open findings:** 4 (2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn
- [ ] TST-001: Test suite executes successfully where present — warn (Only .umap test content)
- [ ] TST-002: Unit coverage exists for critical logic — warn
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn

**Open findings:**
- [ ] [medium] Missing SECURITY.md
- [ ] [medium] No automated tests
- [ ] [low] Branch protection not verified
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/mcp-stress-test

- **Posture:** needs_attention
- **Pass rate:** 66.3%
- **Open findings:** 1 (1 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No pip-audit in CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection)
- [ ] CON-002: Base images are current, minimal, and pinned — warn (Base image not verified)
- [ ] CON-003: Containers do not run as root without formal exception — warn (Root check not verified)
- [ ] CON-004: Container hardening is present or gap explicitly recorded — warn (Not verified)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter enforcement)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Intentional adversarial payloads for stress testing)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions not pinned)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage)

**Open findings:**
- [ ] [medium] Actions not pinned to SHA — Pin to SHAs

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/mcp-tool-shop

- **Posture:** needs_attention
- **Pass rate:** 83.3%
- **Open findings:** 6 (2 high, 3 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No security/dependency/secret scanning in CI. Only build+deploy. npm audit not integrated into workflow.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection rules documented. No required checks before merge documented.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (2 high vulnerabilities: h3 <=1.15.5 (path traversal GHSA-wr4h-v87w-p3r7, CVSS 5.9 + SSE injection GHSA-22cc-p3c6-wpvm, C)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (@mcptoolshop/site-theme significantly outdated: current 0.2.6, latest 1.3.1 (major version behind). astro current 5.18.0)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot or Renovate configured. No documented update cadence.)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No explicit rollback mechanism. GitHub Pages deploys latest build. Previous versions can be redeployed by reverting comm)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No explicit linter or formatter configured (no eslint, prettier, or similar). TypeScript strict mode provides some enfor)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated. package-lock.json serves as implicit dependency list.)
- [ ] TST-001: Test suite executes successfully where present — warn (No test suite exists. No tests/ directory. For a static landing page this is low-risk, but build verification is only do)

**Open findings:**
- [ ] [high] High vulnerability in h3 (transitive dep) — Run npm audit fix in site/ directory to update h3 to >=1.15.6
- [ ] [high] High vulnerability in svgo (transitive dep) — Run npm audit fix in site/ directory
- [ ] [medium] @mcptoolshop/site-theme significantly outdated — Update @mcptoolshop/site-theme to ^1.3.1 and evaluate astro 6.x migration
- [ ] [medium] Moderate vulnerability in devalue (transitive dep) — Run npm audit fix in site/ directory
- [ ] [medium] No security scanning in CI — Add npm audit step to CI workflow before build
- [ ] [low] No explicit linter or formatter configured — Consider adding prettier for formatting consistency

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/mcp-tool-shop.github.io

- **Posture:** needs_attention
- **Pass rate:** 79.4%
- **Open findings:** 4 (2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-002: CI runs build/lint/test — warn (No build/lint in CI)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn
- [ ] TST-001: Test suite executes successfully where present — warn (No tests)

**Open findings:**
- [ ] [medium] Missing SECURITY.md
- [ ] [medium] No build/lint in CI
- [ ] [low] Branch protection not verified
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/nameops

- **Posture:** needs_attention
- **Pass rate:** 77.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — fail (No CI.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (Minimal.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage.)

**Open findings:**
- [ ] [high] No CI
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/nexus-control

- **Posture:** needs_attention
- **Pass rate:** 0.0%
- **Open findings:** 3 (2 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No dedicated security scan in CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection configured)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot configured)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback mechanism)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter enforced)
- [ ] QUA-005: Module boundaries/cohesion are understandable and non-chaotic — warn (Alpha-stage architecture, boundaries evolving)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions not pinned to SHA)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting)

**Open findings:**
- [ ] [medium] Actions not pinned to SHA
- [ ] [medium] Alpha status, not production-ready
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/nexus-suite

- **Posture:** needs_attention
- **Pass rate:** 80.9%
- **Open findings:** 4 (2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn
- [ ] TST-001: Test suite executes successfully where present — warn (No dedicated tests)
- [ ] TST-002: Unit coverage exists for critical logic — warn
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn

**Open findings:**
- [ ] [medium] Missing SECURITY.md
- [ ] [medium] No dedicated tests
- [ ] [low] Branch protection not verified
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/npm-escape-the-valley

- **Posture:** needs_attention
- **Pass rate:** 65.0%
- **Open findings:** 5 (3 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — warn (Only pages.yml. No CI workflow.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow. Only pages.yml for site.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-001: Dependency inventory generated successfully — warn (No package-lock.json. Cannot run npm audit.)
- [ ] DEP-002: No unresolved critical dependency vulnerabilities — warn (Cannot verify without lockfile.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (Cannot verify without lockfile.)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — fail (No package-lock.json present.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — warn (No SECURITY.md. Minimal surface: sets env var and requires npm-launcher.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No secrets scanner.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — fail (No package-lock.json. Dep versions not pinned beyond semver range.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (No tests. Verify script just requires the file.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)

**Open findings:**
- [ ] [high] No CI configuration — Add ci.yml with node require test.
- [ ] [high] No lockfile for dependency pinning — Generate and commit package-lock.json.
- [ ] [high] No package-lock.json — Run npm install to generate package-lock.json and commit it.
- [ ] [medium] No SECURITY.md — Add SECURITY.md documenting thin-launcher scope and npm-launcher delegation.
- [ ] [medium] No tests — Add basic smoke test that requires the entry point.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/npm-sovereignty

- **Posture:** needs_attention
- **Pass rate:** 64.0%
- **Open findings:** 5 (3 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — warn (Only pages.yml.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-001: Dependency inventory generated successfully — warn (No lockfile. Cannot audit.)
- [ ] DEP-002: No unresolved critical dependency vulnerabilities — warn (Cannot verify without lockfile.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (Cannot verify without lockfile.)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — fail (No package-lock.json.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — warn (No SECURITY.md.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No secrets scanner.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — fail (No lockfile.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (No tests.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)

**Open findings:**
- [ ] [high] No CI configuration — Add ci.yml.
- [ ] [high] No lockfile for dependency pinning
- [ ] [high] No package-lock.json — Generate and commit package-lock.json.
- [ ] [medium] No SECURITY.md
- [ ] [medium] No tests

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/npm-xrpl-camp

- **Posture:** needs_attention
- **Pass rate:** 49.4%
- **Open findings:** 4 (2 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow for build/test. Only pages.yml for site deployment.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI runs build or test.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No security scanning in CI.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented.)
- [ ] DEP-002: No unresolved critical dependency vulnerabilities — warn (Cannot run npm audit (no package-lock.json). npm-launcher is internal dep.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (Cannot verify: no lockfile for audit.)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — fail (No package-lock.json present.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — warn (No SECURITY.md. README documents: downloads binary from GitHub Releases, verifies SHA256, caches locally. No telemetry m)
- [ ] QUA-001: Primary build/lint commands run successfully — warn (verify script only runs node -e require check. No build step (pure JS). No real lint.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter configured. Single file so low priority.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual review of single file. No SAST in CI.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — fail (No package-lock.json for dep pinning.)
- [ ] TST-001: Test suite executes successfully where present — fail (No test suite. Only a verify script that checks require() doesn't crash.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No unit tests.)

**Open findings:**
- [ ] [high] No CI workflow for build/test — Add ci.yml with node verify step and npm audit.
- [ ] [high] No test suite — Add basic tests verifying config shape and npm-launcher integration.
- [ ] [medium] Missing SECURITY.md — Add SECURITY.md documenting binary provenance, SHA256 verification, and attack surface.
- [ ] [medium] Missing package-lock.json — Run npm i --package-lock-only.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/npm-xrpl-lab

- **Posture:** needs_attention
- **Pass rate:** 64.0%
- **Open findings:** 5 (3 high, 2 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-001: Config/IaC artifacts identified — warn (Only pages.yml.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI.)
- [ ] DEP-001: Dependency inventory generated successfully — warn (No lockfile.)
- [ ] DEP-002: No unresolved critical dependency vulnerabilities — warn (Cannot verify.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (Cannot verify.)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — fail (No package-lock.json.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — warn (No SECURITY.md.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — fail (No lockfile.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (No tests.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)

**Open findings:**
- [ ] [high] No CI configuration
- [ ] [high] No lockfile
- [ ] [high] No package-lock.json — Generate and commit package-lock.json.
- [ ] [medium] No SECURITY.md
- [ ] [medium] No tests

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/original_voice-soundboard

- **Posture:** needs_attention
- **Pass rate:** 76.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No audit.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No protection.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (0 tests.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No tests.)

**Open findings:**
- [ ] [high] No tests
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/payroll-engine

- **Posture:** needs_attention
- **Pass rate:** 0.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No dedicated security scan in CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection configured)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot configured)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback mechanism)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter enforced)
- [ ] SEC-006: Security-relevant warnings are triaged or justified — warn (Financial system needs pen testing)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions not pinned to SHA)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting)

**Open findings:**
- [ ] [high] Financial system needs pen testing
- [ ] [medium] Actions not pinned to SHA
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/polyglot

- **Posture:** needs_attention
- **Pass rate:** 80.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No audit.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No protection.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot.)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — fail (No SECURITY.md.)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage.)

**Open findings:**
- [ ] [high] No SECURITY.md
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/prototypes

- **Posture:** needs_attention
- **Pass rate:** 32.1%
- **Open findings:** 2 (1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI for build/test. Only pages.yml. Per-package CI explicitly removed to save Actions costs.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI runs build or test.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No security scanning.)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — warn (No root lockfile (pnpm-lock.yaml may exist but not at root).)
- [ ] INV-004: External services, deploy targets, and sensitive touchpoints inventoried — warn (No SECURITY.md. Archive of deprecated packages.)
- [ ] QUA-001: Primary build/lint commands run successfully — warn (turbo test configured but individual packages may not all have tests. Not verified per-package.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter at root. Individual packages may have their own.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual review of representative packages. No SAST.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (No lockfile verified at root.)
- [ ] TST-001: Test suite executes successfully where present — fail (turbo test configured but per-package CI removed. No tests verified running.)
- [ ] TST-002: Unit coverage exists for critical logic — warn (Individual packages may have tests but not verified.)

**Open findings:**
- [ ] [medium] No CI (per-package CI removed) — Add minimal ci.yml with turbo build + turbo test, or mark repo as archived.
- [ ] [low] No SECURITY.md — Add SECURITY.md or mark repo archived on GitHub.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/prov-spec

- **Posture:** needs_attention
- **Pass rate:** 88.9%
- **Open findings:** 2 (1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] SAST rollout

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)

**Open findings:**
- [ ] [medium] Missing SECURITY.md
- [ ] [low] Branch protection not verified

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/readme-i18n

- **Posture:** needs_attention
- **Pass rate:** 42.1%
- **Open findings:** 4 (3 high, 1 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] SAST rollout

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI)
- [ ] CIC-002: CI runs build/lint/test — fail
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] INV-001: README present and materially current — fail (No README.md)
- [ ] INV-002: Manifests/build files/runtime entrypoints identified — fail (No manifests)
- [ ] LIC-001: Third-party licenses inventoried — fail (No LICENSE)
- [ ] LIC-002: No prohibited or policy-conflicting licenses — fail
- [ ] LIC-003: Attribution/license-file obligations satisfied — fail
- [ ] LIC-004: Unknown or ambiguous licenses triaged — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)

**Open findings:**
- [ ] [high] Missing LICENSE file
- [ ] [high] Missing README.md
- [ ] [high] No CI workflows
- [ ] [medium] Missing SECURITY.md

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/registry-stats

- **Posture:** needs_attention
- **Pass rate:** 65.4%
- **Open findings:** 5 (1 high, 2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-004: Least-privilege/network/TLS/resource controls are set or explicitly N/A — warn (desktop-ci uses MSIX_CERT_PASSWORD secret. PFX cert generated in CI, not committed.)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflow for the TypeScript package (build/test/lint). desktop-ci.yml only covers C# MAUI app. publish.yml for npm)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI runs build or test for the TS package.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No SAST, dep audit, or secret scanning for TS package.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate. No CI dep audit.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No eslint/prettier configured.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (Manual SAST review. No SAST in CI.)
- [ ] SEC-004: Input validation and output encoding are adequate — warn (nuget uses encodeURIComponent (good). Docker pkg name not URL-encoded. npm/pypi direct interpolation (safe for valid nam)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No tests for invalid package names, URL injection, or malformed API responses. Contract tests call live APIs (fragile).)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage tooling configured.)

**Open findings:**
- [ ] [high] No CI workflow for TypeScript package — Add ci.yml with npm ci, tsup build, vitest run, npm audit.
- [ ] [medium] Docker package name not URL-encoded in API call — Use encodeURIComponent() for package name components in Docker API URL.
- [ ] [medium] No security scanning in CI — Add npm audit and gitleaks to CI.
- [ ] [low] No SBOM — Optional: add SBOM generation.
- [ ] [low] No linter configured — Add eslint config.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/registry-stats-vscode

- **Posture:** needs_attention
- **Pass rate:** 0.0%
- **Open findings:** 0

**Programs needed:**
- _None of the 5 standard programs triggered (other controls failing)_

**Failing controls:**
- _None_

**Open findings:**
- _None_

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/repo-tester

- **Posture:** needs_attention
- **Pass rate:** 75.0%
- **Open findings:** 2 (1 high, 1 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI)
- [ ] CIC-002: CI runs build/lint/test — fail
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)
- [ ] TST-001: Test suite executes successfully where present — warn (No tests)

**Open findings:**
- [ ] [high] No CI workflows
- [ ] [medium] Missing SECURITY.md

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/repomesh

- **Posture:** needs_attention
- **Pass rate:** 0.0%
- **Open findings:** 0

**Programs needed:**
- _None of the 5 standard programs triggered (other controls failing)_

**Failing controls:**
- _None_

**Open findings:**
- _None_

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/rippled-windows-debug

- **Posture:** needs_attention
- **Pass rate:** 85.7%
- **Open findings:** 2 (1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] SAST rollout

**Failing controls:**
- [ ] CIC-002: CI runs build/lint/test — warn (No build in CI)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn
- [ ] CIC-005: Branch protection/checks/release gating documented — warn
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)

**Open findings:**
- [ ] [medium] Missing SECURITY.md
- [ ] [low] Branch protection not verified

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/runforge-vscode

- **Posture:** needs_attention
- **Pass rate:** 0.0%
- **Open findings:** 0

**Programs needed:**
- _None of the 5 standard programs triggered (other controls failing)_

**Failing controls:**
- _None_

**Open findings:**
- _None_

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/shipcheck

- **Posture:** needs_attention
- **Pass rate:** 90.0%
- **Open findings:** 2 (1 high, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (No test script. Only verify (smoke test).)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No unit tests.)

**Open findings:**
- [ ] [high] No test suite — Add tests for detectTypes, init, audit commands.
- [ ] [low] No package signing

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/siege-kit

- **Posture:** needs_attention
- **Pass rate:** 0.0%
- **Open findings:** 0

**Programs needed:**
- _None of the 5 standard programs triggered (other controls failing)_

**Failing controls:**
- _None_

**Open findings:**
- _None_

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/site-theme

- **Posture:** needs_attention
- **Pass rate:** 0.8%
- **Open findings:** 3 (3 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No audit or SAST.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (2 vulnerabilities (1 high, 1 moderate) in lockfile.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No dependabot.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (npm run lint --if-present (no lint script defined).)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (Not signed.)
- [ ] TST-001: Test suite executes successfully where present — warn (No unit tests. CI validates templates by scaffolding + building all 4 templates.)
- [ ] TST-002: Unit coverage exists for critical logic — warn (No unit tests. Template validation in CI serves as integration test.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No edge case tests.)

**Open findings:**
- [ ] [medium] 2 vulnerabilities in lockfile — npm audit fix
- [ ] [medium] No dependabot — Add dependabot.yml
- [ ] [medium] No unit tests — Add unit tests for CLI scaffolding logic

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/sprite-creator-studio

- **Posture:** needs_attention
- **Pass rate:** 72.3%
- **Open findings:** 4 (1 high, 1 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No CI workflows)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI)
- [ ] CIC-004: CI secrets handled securely — fail (No CI)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot)
- [ ] DPL-001: Deployment scripts/manifests/path reviewed — warn (No deployment config)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback)
- [ ] DPL-004: Exposed services/endpoints/auth surfaces inventoried — warn (No deployment)
- [ ] OBS-001: Structured logging/error reporting is present where appropriate — warn (No structured logging)
- [ ] OBS-004: Metrics/tracing hooks exist or explicit absence is recorded — warn (No metrics)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks)
- [ ] SEC-006: Security-relevant warnings are triaged or justified — fail (No SECURITY.md)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (Not signed)
- [ ] SUP-004: Build/release flow resists tampering and uses trusted sources — warn (No CI build)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (Coverage not captured)

**Open findings:**
- [ ] [high] No CI workflows configured — Add ci.yml
- [ ] [medium] No SECURITY.md — Add SECURITY.md
- [ ] [low] No SBOM
- [ ] [low] No branch protection

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/stillpoint

- **Posture:** needs_attention
- **Pass rate:** 61.3%
- **Open findings:** 4 (3 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No security scan)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter)
- [ ] QUA-003: Major complexity/duplication hotspots identified and bounded — warn (Version mismatch: root 0.1.0 vs sub-packages 1.0.0)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions not pinned)
- [ ] TST-001: Test suite executes successfully where present — warn (Minimal test coverage visible in source)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No unit tests found)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — fail (No integration tests)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No security tests)

**Open findings:**
- [ ] [medium] Actions not pinned to SHA — Pin to SHAs
- [ ] [medium] No unit tests — Add test suite for server and UI
- [ ] [medium] Version mismatch root 0.1.0 vs sub-packages 1.0.0 — Align versions
- [ ] [low] No SBOM — Add CycloneDX

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/training-studio

- **Posture:** needs_attention
- **Pass rate:** 68.8%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No explicit security scan (npm audit not in CI))
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (1 HIGH: rollup arbitrary file write (GHSA-mw96-cpmx-2vgc). Fix available)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No rollback)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions not pinned)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting)

**Open findings:**
- [ ] [high] HIGH rollup vulnerability (arbitrary file write) — Run npm audit fix
- [ ] [medium] Actions not pinned to SHA — Pin to SHAs
- [ ] [low] No SBOM — Add CycloneDX

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/vocal-synth-engine

- **Posture:** needs_attention
- **Pass rate:** 69.7%
- **Open findings:** 5 (2 high, 1 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-004: Least-privilege/network/TLS/resource controls are set or explicitly N/A — warn (CORS enabled broadly)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No security scan)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (Branch protection unverified)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (1 high vuln)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot)
- [ ] MON-001: Health/readiness/liveness/heartbeat checks exist where applicable — warn (No health check endpoint)
- [ ] MON-002: Alerting/monitoring ownership and thresholds documented or explicit gap recorded — warn (No alerting)
- [ ] OBS-001: Structured logging/error reporting is present where appropriate — warn (No structured logging)
- [ ] OBS-004: Metrics/tracing hooks exist or explicit absence is recorded — warn (No metrics)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks)
- [ ] PRF-004: Scaling, memory, CPU, and I/O risks documented — warn (Audio processing memory not bounded)
- [ ] SEC-003: Authn/authz checks exist where privileged actions exist — warn (Express server with CORS enabled, no auth)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (Not signed)
- [ ] TST-001: Test suite executes successfully where present — fail (0 test files)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No unit coverage)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — fail (No integration tests)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — fail (No regression tests)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — fail (No coverage)

**Open findings:**
- [ ] [high] 1 high dependency vulnerability — npm audit fix
- [ ] [high] No test files found — Add tests
- [ ] [medium] Express CORS open, no auth — Add auth or restrict CORS
- [ ] [low] Branch protection unverified
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/websketch-demo

- **Posture:** needs_attention
- **Pass rate:** 76.6%
- **Open findings:** 3 (1 high, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No security scan)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (Branch protection unverified)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (3 high vulns)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (6 moderate vulns)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot)
- [ ] OBS-001: Structured logging/error reporting is present where appropriate — warn (No structured logging)
- [ ] OBS-004: Metrics/tracing hooks exist or explicit absence is recorded — warn (No metrics)
- [ ] PRF-002: Benchmarks/load tests/profiling exist or gap is recorded — warn (No benchmarks)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (Not signed)
- [ ] TST-002: Unit coverage exists for critical logic — warn (Minimal coverage)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — warn (No integration)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (Minimal edge cases)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (Coverage not captured)

**Open findings:**
- [ ] [high] 3 high dependency vulnerabilities — npm audit fix
- [ ] [low] Branch protection unverified
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop-org/websketch-mcp

- **Posture:** needs_attention
- **Pass rate:** 83.0%
- **Open findings:** 3 (1 high, 1 medium, 1 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No dep audit.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (Some outdated.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter in this repo.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No scanner.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No signing.)
- [ ] TST-001: Test suite executes successfully where present — fail (0 test files.)
- [ ] TST-002: Unit coverage exists for critical logic — fail (No tests.)

**Open findings:**
- [ ] [high] No test files
- [ ] [medium] No SAST
- [ ] [low] No SBOM

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop/mcp-tool-shop

- **Posture:** needs_attention
- **Pass rate:** 71.3%
- **Open findings:** 8 (2 high, 3 medium, 3 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — fail (2 high vulns in site deps (rollup GHSA-mw96-cpmx-2vgc, svgo GHSA-xpqw-6gx7-v673), fixable via npm audit fix)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (3 outdated deps with available fixes)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate configured)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (No explicit rollback documented)
- [ ] LIC-001: Third-party licenses inventoried — warn (LICENSE file is empty (0 bytes))
- [ ] LIC-002: No prohibited or policy-conflicting licenses — warn (Cannot verify compatibility, project license undefined)
- [ ] LIC-003: Attribution/license-file obligations satisfied — warn (Attribution unclear due to empty LICENSE)
- [ ] LIC-004: Unknown or ambiguous licenses triaged — warn (License is ambiguous, needs population)
- [ ] MON-002: Alerting/monitoring ownership and thresholds documented or explicit gap recorded — warn (No uptime monitoring or alerting)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter (prettier/eslint) configured)
- [ ] QUA-004: Dead code, stale TODOs, and abandoned paths reviewed — warn (2 stale override keys cause 1 invariant test failure)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No formal SAST in CI, but custom secret+URL scans exist)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting configured)

**Open findings:**
- [ ] [high] High vulnerability in rollup (site dep) — Run npm audit fix in site/
- [ ] [high] High vulnerability in svgo (site dep) — Run npm audit fix in site/
- [ ] [medium] LICENSE file is empty — Populate with chosen license text
- [ ] [medium] Moderate vulnerability in devalue (site dep) — Run npm audit fix in site/
- [ ] [medium] No branch protection documented — Document or enable branch protection
- [ ] [low] 2 stale override keys in data — Remove stale keys or re-sync projects.json
- [ ] [low] No SBOM generated — Add cyclonedx-npm to generate SBOM
- [ ] [low] No test coverage reporting — Add c8 coverage tool

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop/mcpt-link-fresh

- **Posture:** needs_attention
- **Pass rate:** 68.8%
- **Open findings:** 5 (2 medium, 3 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (CI does not run any security/dependency/secret scans. No SAST, no npm audit (N/A for zero deps but pattern not establish)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection rules documented. Apply workflow uses environment gate for approval, but no explicit branch protect)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — warn (No package-lock.json or node_modules present. While there are zero dependencies, a lockfile is still best practice for r)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter/linter configured (no eslint, prettier, or similar in package.json). Code style is consistent but not enfor)
- [ ] RUN-003: Timeouts/retries/resource boundaries are reasonable — warn (No explicit timeouts on fetch() calls to GitHub API or canonical endpoints. Relies on Node.js default behavior. Could ha)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No automated secrets scan tool (gitleaks/trufflehog) configured. Manual grep found no secrets in source.)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST tool executed. No semgrep, CodeQL, or bandit configured in CI or locally.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated. Zero dependencies makes this low-risk, but SBOM would document the Node.js runtime dependency.)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (No lockfile for dependency pinning. engines field specifies node>=20. GitHub Actions pin to node 22. Action versions pin)
- [ ] TST-001: Test suite executes successfully where present — warn (Unit tests: 111 pass, 0 fail. E2E tests: 20 pass, 2 fail (golden snapshot mismatches for plan.md and outreach-queue.md —)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting configured. Node.js --test runner supports --experimental-test-coverage but it's not wired up.)

**Open findings:**
- [ ] [medium] CI lacks security scanning steps — Add gitleaks and semgrep steps to CI. Since there are zero deps, npm audit is not needed but could be added as a no-op guard.
- [ ] [medium] No SAST tooling configured — Add semgrep or CodeQL step to ci.yml. Low effort given zero dependencies and pure Node.js.
- [ ] [low] 2 E2E golden snapshot tests failing — Regenerate golden snapshot files in tests/e2e/golden/ to match current renderer output.
- [ ] [low] No code formatter or linter configured — Add eslint or biome as a dev dependency with a lint script.
- [ ] [low] No fetch timeouts configured — Add AbortController with timeout to fetch calls (e.g., 30s for API calls, 10s for canonical data).

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop/mcpt-logo-presets

- **Posture:** needs_attention
- **Pass rate:** 0.6%
- **Open findings:** 8 (2 high, 4 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No .github/workflows. No CI at all.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI for build/lint/test.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI for security/dep/secret scans.)
- [ ] CIC-005: Branch protection/checks/release gating documented — fail (No branch protection or release gating.)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (logo-studio 0.4.0->1.0.0, @types/node 22->25, vitest 3->4.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No Dependabot/Renovate/documented cadence.)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (npm unpublish 72h only. No documented rollback.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No formatter config (.prettierrc, .eslintrc). TS strict only.)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No automated secrets scan. Manual grep: 0 matches.)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST tool. No semgrep/codeql/eslint-security. No CI.)
- [ ] SEC-004: Input validation and output encoding are adequate — warn (loader.ts:40 readFileSync(filePath) no path sanitization. JSON cast without runtime validation.)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM. package-lock.json partial inventory.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing or provenance.)
- [ ] SUP-004: Build/release flow resists tampering and uses trusted sources — warn (Manual publish, no build provenance.)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No edge case tests for malformed JSON, missing file, version mismatch.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting configured.)

**Open findings:**
- [ ] [high] No CI/CD configuration — Add ci.yml with build, typecheck, test, npm audit.
- [ ] [high] No automated build/test in CI — Add CI workflow: npm run typecheck, npm run test, npm audit.
- [ ] [medium] Manual npm publish, no provenance — Add publish workflow with --provenance flag.
- [ ] [medium] No SAST tooling — Add eslint with security plugin or semgrep to CI.
- [ ] [medium] No dependency update mechanism — Add dependabot.yml monthly per org rules.
- [ ] [medium] Peer dep logo-studio outdated (0.4.0 vs 1.0.0) — Update peerDependencies to >=1.0.0.
- [ ] [low] No linter or formatter — Add prettier and/or eslint.
- [ ] [low] Unsanitized file path in loadUserPresets — Add path.resolve() and optional schema validation.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop/mcpt-logo-studio

- **Posture:** needs_attention
- **Pass rate:** 0.6%
- **Open findings:** 8 (2 high, 6 medium)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CFG-004: Least-privilege/network/TLS/resource controls are set or explicitly N/A — warn (ComfyUI default URL is http (not https) to localhost:8188. Together API uses HTTPS. No validation that ComfyUI URL is lo)
- [ ] CIC-001: CI configuration exists for active repo or explicit N/A recorded — fail (No .github/workflows directory. No CI.)
- [ ] CIC-002: CI runs build/lint/test — fail (No CI for build/lint/test.)
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No CI for security/dep/secret scans.)
- [ ] CIC-005: Branch protection/checks/release gating documented — fail (No branch protection or release gating.)
- [ ] DEP-003: No unresolved high dependency vulnerabilities without exception — warn (3 high vulnerabilities in rollup (dev dep via vitest). GHSA-mw96-cpmx-2vgc: Arbitrary File Write via Path Traversal. Dev)
- [ ] DEP-005: Stale/EOL dependencies identified — warn (eslint 9.39.2->10.0.3, typescript-eslint 8.56.1->8.57.1, @types/node 22->25, vitest 3->4.)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — fail (No Dependabot/Renovate. No documented update cadence.)
- [ ] DPL-002: Safe rollout/rollback support exists or gap is recorded — warn (npm unpublish 72h. No documented rollback.)
- [ ] PRF-003: No obvious pathological loops/N+1/unbounded work — warn (CLI --variants has no upper bound. User could request variants=99999. Width/height also unbounded — could cause OOM.)
- [ ] QUA-003: Major complexity/duplication hotspots identified and bounded — warn (10 ESLint warnings for unused variables: BANNED_PATTERN, HEAVY_3D_PATTERN in brief-validator.ts, computeVramThrottleLeve)
- [ ] QUA-004: Dead code, stale TODOs, and abandoned paths reviewed — warn (Unused exports: BANNED_PATTERN, HEAVY_3D_PATTERN, computeVramThrottleLevel, CLIPTokenizer, T5_TIER_B_BUDGET. May be dead)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No automated secrets scan. Manual grep: 0 hardcoded secrets found.)
- [ ] SCR-004: Secret storage and rotation path documented — warn (API keys stored in env vars. No rotation documentation. Standard for CLI tools but worth noting.)
- [ ] SEC-001: SAST executed for all applicable languages — fail (No SAST tool (semgrep/codeql). ESLint has typescript-eslint but no security-focused rules.)
- [ ] SEC-004: Input validation and output encoding are adequate — warn (CLI numeric inputs (width, height, cfg, variants, seed) parsed without bounds validation. ComfyUI serverUrl used in fetc)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM. 0 runtime deps so risk is low.)
- [ ] SUP-003: Release artifacts/images/packages are signed or explicit gap recorded — warn (No package signing or provenance.)
- [ ] SUP-004: Build/release flow resists tampering and uses trusted sources — warn (Manual publish. No build provenance.)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage reporting configured.)

**Open findings:**
- [ ] [high] No CI/CD configuration — Add ci.yml with tsc, eslint, vitest, npm audit. Paths-gated per org rules.
- [ ] [high] No automated build/test/lint in CI — Add CI workflow.
- [ ] [medium] 3 high vulns in rollup (dev dep via vitest) — npm audit fix or update vitest.
- [ ] [medium] Manual npm publish, no provenance — Add publish workflow with --provenance.
- [ ] [medium] No SAST tooling — Add eslint-plugin-security or semgrep to CI.
- [ ] [medium] No dependency update mechanism — Add dependabot.yml monthly.
- [ ] [medium] SSRF risk in ComfyUI URL and unvalidated CLI inputs — Validate ComfyUI URL scheme and domain. Add numeric bounds for CLI inputs.
- [ ] [medium] Unbounded CLI image generation parameters — Add max bounds: variants<=20, width/height<=4096.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop/mcpt-marketing

- **Posture:** needs_attention
- **Pass rate:** 62.5%
- **Open findings:** 4 (2 medium, 2 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — warn (No secret/dependency scan in CI. Low risk for data-only repo)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection documented)
- [ ] DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented — warn (No Dependabot/Renovate configured)
- [ ] QUA-001: Primary build/lint commands run successfully — warn (Validation passes. Prettier format check fails on 2 files (CHANGELOG.md, SHIP_GATE.md). Not code files but CI would fail)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM. Lockfile serves as dep inventory)
- [ ] SUP-002: Provenance/pinning for dependencies and artifacts verified — warn (Actions NOT pinned to SHA (uses @v4 tags). Should pin to commit SHA)
- [ ] TST-002: Unit coverage exists for critical logic — warn (No separate unit test suite. Validation script covers schema conformance but not edge cases)
- [ ] TST-004: Regression/security edge cases are tested or gap is logged — warn (No regression/security edge case tests beyond schema validation)

**Open findings:**
- [ ] [medium] GitHub Actions not pinned to SHA — Pin actions/checkout@v4 and actions/setup-node@v4 to specific commit SHAs
- [ ] [medium] Prettier format check fails on 2 files — Run npm run fmt to fix formatting
- [ ] [low] No SBOM generated — Add SBOM generation
- [ ] [low] No branch protection documented — Document or enable branch protection

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

### mcp-tool-shop/mcpt-publishing

- **Posture:** needs_attention
- **Pass rate:** 72.0%
- **Open findings:** 6 (1 medium, 5 low)

**Programs needed:**
- [ ] CI baseline rollout
- [ ] Dependency hygiene
- [ ] Supply-chain hardening
- [ ] SAST rollout
- [ ] Test floor enforcement

**Failing controls:**
- [ ] CIC-003: CI runs security/dependency/secret scans or explicit gap recorded — fail (No SAST, dependency scanning, or secret scanning in CI workflows. Only functional tests.)
- [ ] CIC-005: Branch protection/checks/release gating documented — warn (No branch protection rules documented. Publish workflow fires on release:published which is appropriate. No required sta)
- [ ] DEP-004: Lockfiles/version pins are present and valid where expected — warn (package-lock.json exists but has version mismatch: lockfile lists sharp as a dependency at root level, but root package.)
- [ ] QUA-002: Formatting/style enforcement present and passing — warn (No linter or formatter configured (no eslint, prettier, or similar in package.json or config files). Code is consistentl)
- [ ] SCR-001: Secrets scan executed against repo contents — warn (No gitleaks/trufflehog scan configured in CI. Manual grep performed.)
- [ ] SEC-001: SAST executed for all applicable languages — warn (No SAST tool executed. No semgrep/codeql/bandit configured in CI or locally. Manual review performed instead.)
- [ ] SEC-002: No critical injection/deserialization/RCE-class patterns — warn (fix.mjs constructs git/gh CLI commands with string interpolation from user-provided flags (branchName, prBody). While in)
- [ ] SUP-001: SBOM generated or explicit gap recorded — warn (No SBOM generated. Zero prod deps makes this low-risk but gap exists.)
- [ ] TST-003: Integration/e2e coverage exists where architecture requires it — warn (No integration tests that actually call registry APIs (tests use mock/synthetic data). Reasonable for a CLI tool but gap)
- [ ] TST-005: Coverage/reporting captured or explicitly unavailable — warn (No coverage tool configured. No coverage reporting in CI or locally.)

**Open findings:**
- [ ] [medium] No security scanning in CI — Add npm audit and gitleaks steps to ci.yml prepublish-gate job.
- [ ] [low] Lockfile has phantom sharp dependency at root — Delete package-lock.json and regenerate with npm install.
- [ ] [low] No linter or formatter configured — Add ESLint and/or Prettier with a lint script in package.json.
- [ ] [low] No test coverage reporting — Add c8 as a dev dependency and update test script to 'c8 node scripts/test-providers.mjs'.
- [ ] [low] Shell command construction via string interpolation in fix.mjs — Use execFileSync with argument arrays instead of execSync with interpolated strings.
- [ ] [low] Three workflow files exceeds org max-2 rule — Consider combining publish.yml into ci.yml as a release-triggered job, or document the exception.

**Fix sheet:**
- [ ] Repo classified correctly
- [ ] Audit findings reviewed
- [ ] Open highs identified
- [ ] Program buckets assigned
- [ ] Fixes implemented
- [ ] Regression tests added for every fix
- [ ] CI updated
- [ ] Docs updated
- [ ] Audit rerun after fixes
- [ ] Findings closed or moved to accepted_risk
- [ ] Posture recomputed

---

## Order of Operations

1. Fix missing CI first (enforcement rail for everything else)
2. Lock dependency hygiene
3. Harden supply chain
4. Roll out SAST
5. Raise test floor + regression coverage
6. Clean up inventory/license/security-doc gaps

## Definition of Done

A repo is not "fixed" because code changed. It is fixed when:

- relevant findings are closed in the DB
- failing controls now pass or are formally excepted
- CI enforces the new baseline
- tests protect the change
- docs are updated where needed
- posture improves honestly
- no temporary patch leaves the same class of failure open

## Success Criteria

**CI baseline done when:** no active repo lacks CI, no active repo skips build/test in CI

**Dependency hygiene done when:** no active repo lacks expected lockfiles, no unresolved high dependency findings remain without exception

**Supply chain done when:** SBOM generation exists for active repos, Actions pinned, signing where applicable

**SAST rollout done when:** all applicable active repos run SAST in CI, open high-severity code findings closed or excepted

**Test floor done when:** no active core-code repo has zero tests, every audit-found bug fixed has a regression test
