# Portfolio Audit Report

**Generated:** 2026-03-18 19:36:11 UTC  
**Source:** repo-knowledge DB (`data/knowledge.db`)  

---

## 1. Executive Summary

- **Total repos:** 176
- **Audited:** 176 (100.0%)
- **Unaudited:** 0 (0.0%)
- **Healthy:** 105
- **Needs attention:** 70
- **Critical:** 0
- **Total findings:** 642 (637 open)

## 2. Database Completeness

| Table | Rows |
|-------|------|
| repos | 176 |
| repo_notes | 668 |
| repo_relationships | 408 |
| repo_releases | 324 |
| repo_facts | 620 |
| repo_docs | 1363 |
| repo_tech | 173 |
| repo_topics | 1399 |
| audit_runs | 209 |
| audit_findings | 642 |
| audit_control_results | 16034 |
| audit_controls | 80 |
| audit_metrics | 202 |

**Note types:**

| Type | Count |
|------|-------|
| architecture | 191 |
| thesis | 190 |
| command | 107 |
| release_summary | 78 |
| convention | 55 |
| warning | 37 |
| next_step | 6 |
| pain_point | 3 |
| drift_risk | 1 |

**Relationship types:**

| Type | Count |
|------|-------|
| shares_domain_with | 230 |
| companion_to | 66 |
| depends_on | 43 |
| related_to | 31 |
| shares_package_with | 22 |
| supersedes | 16 |

**Knowledge coverage:**

- Repos with thesis note: 176/176 (100.0%)
- Repos with architecture note: 176/176 (100.0%)
- Repos with relationships: 159/176 (90.3%)
- Repos with releases: 110/176 (62.5%)

## 3. Portfolio Posture

| Posture | Count | % of Audited |
|---------|-------|-------------|
| healthy | 105 | 59.7% |
| needs_attention | 70 | 39.8% |
| unknown | 1 | 0.6% |

## 4. Findings Summary

**By severity:**

| Severity | Open | Fixed | Accepted Risk | False Positive | Other | Total |
|----------|------|-------|---------------|----------------|-------|-------|
| high | 108 | 1 | 0 | 0 | 0 | 109 |
| medium | 241 | 1 | 1 | 0 | 0 | 243 |
| low | 281 | 0 | 1 | 0 | 1 | 283 |
| info | 7 | 0 | 0 | 0 | 0 | 7 |

**By domain:**

| Domain | Total | Open |
|--------|-------|------|
| supply_chain | 207 | 206 |
| cicd | 115 | 114 |
| security_sast | 102 | 100 |
| dependencies_sca | 87 | 87 |
| testing | 45 | 44 |
| code_quality | 34 | 34 |
| inventory | 20 | 20 |
| containers | 9 | 9 |
| licenses | 9 | 9 |
| runtime | 5 | 5 |
| secrets | 4 | 4 |
| performance | 3 | 3 |
| compliance_privacy | 1 | 1 |
| observability | 1 | 1 |

## 5. High-Severity Findings

108 open critical/high findings:

| Severity | Repo | Domain | Title | Remediation |
|----------|------|--------|-------|-------------|
| high | mcp-tool-shop-org/Attestia-Desktop | cicd | No CI build/test workflow | Add ci.yml running dotnet build, dotnet test, and security analysis on push to src/**. |
| high | mcp-tool-shop-org/Attestia-Desktop | testing | No test projects for financial software | Add test projects for Core models, Client SDK, Sidecar process management, and ViewModel input validation. |
| high | mcp-tool-shop-org/CodeClone-Desktop | cicd | No CI build/test workflow | Add ci.yml with dotnet build, test, and security analysis. |
| high | mcp-tool-shop-org/CodeClone-Desktop | security_sast | Path traversal in MainViewModel.LoadFileContent | Normalize with Path.GetFullPath and validate StartsWith(repoRoot). |
| high | mcp-tool-shop-org/CodeClone-Desktop | security_sast | Subprocess argument injection in CodeCloneService | Use ProcessStartInfo.ArgumentList instead of string-interpolated Arguments. |
| high | mcp-tool-shop-org/CodeClone-Desktop | testing | No test projects | Add CodeClone.Tests project with path traversal, JSON edge case, and subprocess argument tests. |
| high | mcp-tool-shop-org/ConsensusOS | cicd | No CI workflow for build/test | Add ci.yml with npm ci, tsc, vitest run, npm audit. |
| high | mcp-tool-shop-org/ConsensusOS | security_sast | Signature verification is a placeholder | Implement real signature verification with ED25519 or ECDSA public key. |
| high | mcp-tool-shop-org/LeaseGate | cicd | No general CI build/test workflow | Add ci.yml with dotnet build LeaseGate.sln, dotnet test. |
| high | mcp-tool-shop-org/LeaseGate | licenses | No LICENSE file in repository | Add MIT LICENSE file to match other org repos. |
| high | mcp-tool-shop-org/LeaseGate | security_sast | Path traversal in GovernanceReceiptService | Validate with Path.GetFullPath and ensure paths stay within allowed root directories. |
| high | mcp-tool-shop-org/LeaseGate-Lite | supply_chain | Large binaries committed to repo (51.5MB+) | Remove committed binaries. Use GitHub Releases for distribution. Add to .gitignore and use git filter-branch or BFG to c |
| high | mcp-tool-shop-org/LoKey-Typer | testing | No tests | Add vitest with tests for typing logic, personalization engine, and ambient scheduling. |
| high | mcp-tool-shop-org/Registrum | cicd | No CI | - |
| high | mcp-tool-shop-org/ScalarScope | cicd | No CI | - |
| high | mcp-tool-shop-org/ScalarScope | testing | Empty scaffold - no code or tests | - |
| high | mcp-tool-shop-org/ToolShopStudio | inventory | No SECURITY.md | Add SECURITY.md documenting sandboxing model and external tool invocation. |
| high | mcp-tool-shop-org/VectorCaliper | cicd | No CI | - |
| high | mcp-tool-shop-org/ai-jam-sessions | security_sast | CLI uses exec() for browser open — command injection risk | Replace exec() with execFile() or spawn() with shell:false. Pass filePath as argv, not template string. |
| high | mcp-tool-shop-org/ai-ui | cicd | CI does not run build/lint/test | Add build/test/audit steps to CI workflow |
| high | mcp-tool-shop-org/ai-ui | cicd | No CI workflow for core code | Add a ci.yml workflow that runs npm test, npm audit, and optionally lint on push/PR to src/**, cli/**, package.json |
| high | mcp-tool-shop-org/ambient-wavs | cicd | CI does not run build/test | Add CI workflow. |
| high | mcp-tool-shop-org/ambient-wavs | cicd | No CI configuration | Add ci.yml with tsc --noEmit check. |
| high | mcp-tool-shop-org/ambient-wavs | licenses | No LICENSE file | Add LICENSE file (MIT recommended) and license field to package.json. |
| high | mcp-tool-shop-org/anchor | cicd | No CI/CD workflows exist | Create ci.yml with cargo test, cargo clippy, npm audit, tsc --noEmit |
| high | mcp-tool-shop-org/anchor | security_sast | No SECURITY.md or vulnerability disclosure policy | Create SECURITY.md with threat model, reporting channel, response SLA |
| high | mcp-tool-shop-org/avatar-runtime | cicd | No CI | - |
| high | mcp-tool-shop-org/avatar-runtime | inventory | No SECURITY.md | - |
| high | mcp-tool-shop-org/avatar-runtime | licenses | No LICENSE file | - |
| high | mcp-tool-shop-org/claude-guardian | dependencies_sca | High CVE in transitive @hono/node-server<1.19.10 via @modelcontextprotocol/sdk | Run npm audit fix to update @modelcontextprotocol/sdk |
| high | mcp-tool-shop-org/claude-guardian | dependencies_sca | High CVE in transitive express-rate-limit@8.2.1 via @modelcontextprotocol/sdk | Run npm audit fix to update @modelcontextprotocol/sdk |
| high | mcp-tool-shop-org/claude-guardian | dependencies_sca | High CVEs in transitive dependency hono<=4.12.6 via @modelcontextprotocol/sdk | Run npm audit fix to update @modelcontextprotocol/sdk to a version shipping hono>4.12.6 |
| high | mcp-tool-shop-org/claude-memories | cicd | CI does not run build/lint/test | Add build+test jobs to CI workflow. |
| high | mcp-tool-shop-org/claude-memories | cicd | No CI workflow for build/test | Add ci.yml with npm ci, npm run build, npm test, npm audit steps. Use paths filter for src/**, tests/**, package.json. |
| high | mcp-tool-shop-org/claude-memories | cicd | No security scanning in CI | Add npm audit, semgrep/codeql, and gitleaks steps to CI. |
| high | mcp-tool-shop-org/claude-session-copilot | dependencies_sca | 3 high transitive dependency vulnerabilities | Run npm audit fix to update transitive deps. |
| high | mcp-tool-shop-org/claude-session-copilot | testing | No tests | Add tests for Store, DecisionLog, Timeline, SnapshotManager, PatternDetector. |
| high | mcp-tool-shop-org/deltamind | cicd | No CI for core code | Add ci.yml with npm test across workspaces |
| high | mcp-tool-shop-org/feature-reacher | dependencies_sca | 4 dependency vulnerabilities | npm audit fix |
| high | mcp-tool-shop-org/game-dev-mcp | testing | No test files | - |
| high | mcp-tool-shop-org/homebrew-core | licenses | Missing LICENSE file | - |
| high | mcp-tool-shop-org/homebrew-mcp-tools | licenses | Missing LICENSE file | - |
| high | mcp-tool-shop-org/homevault | cicd | No CI workflows at all | - |
| high | mcp-tool-shop-org/integradio | cicd | No CI workflow | Add ci.yml with pytest. |
| high | mcp-tool-shop-org/llm-sync-drive | inventory | No SECURITY.md | Add SECURITY.md documenting OAuth flow and token storage. |
| high | mcp-tool-shop-org/mcp-aside | dependencies_sca | High transitive dep vulns (hono via MCP SDK) | npm audit fix. |
| high | mcp-tool-shop-org/mcp-aside | testing | No tests | - |
| high | mcp-tool-shop-org/mcp-file-forge | cicd | No CI workflow | Add ci.yml with build + lint + test. |
| high | mcp-tool-shop-org/mcp-file-forge | dependencies_sca | High transitive dep vulns | npm audit fix. |
| high | mcp-tool-shop-org/mcp-file-forge | testing | No test files | - |
| high | mcp-tool-shop-org/mcp-tool-shop | dependencies_sca | High vulnerability in h3 (transitive dep) | Run npm audit fix in site/ directory to update h3 to >=1.15.6 |
| high | mcp-tool-shop-org/mcp-tool-shop | dependencies_sca | High vulnerability in svgo (transitive dep) | Run npm audit fix in site/ directory |
| high | mcp-tool-shop-org/nameops | cicd | CI does not run tests | Add test step to CI or separate ci.yml |
| high | mcp-tool-shop-org/nameops | cicd | No CI | - |
| high | mcp-tool-shop-org/npm-escape-the-valley | cicd | No CI configuration | Add ci.yml with node require test. |
| high | mcp-tool-shop-org/npm-escape-the-valley | cicd | No CI workflow for core code | Add ci.yml with npm test and npm audit |
| high | mcp-tool-shop-org/npm-escape-the-valley | dependencies_sca | No lockfile present | Run npm i --package-lock-only and commit package-lock.json |
| high | mcp-tool-shop-org/npm-escape-the-valley | dependencies_sca | No package-lock.json | Run npm install to generate package-lock.json and commit it. |
| high | mcp-tool-shop-org/npm-escape-the-valley | supply_chain | No dependency pinning | Generate and commit package-lock.json |
| high | mcp-tool-shop-org/npm-escape-the-valley | supply_chain | No lockfile for dependency pinning | Generate and commit package-lock.json. |
| high | mcp-tool-shop-org/npm-launcher | supply_chain | No lockfile for binary launcher | Run npm i --package-lock-only and commit package-lock.json |
| high | mcp-tool-shop-org/npm-sovereignty | cicd | No CI configuration | Add ci.yml. |
| high | mcp-tool-shop-org/npm-sovereignty | cicd | No CI for core code | Add ci.yml |
| high | mcp-tool-shop-org/npm-sovereignty | dependencies_sca | No lockfile | Generate and commit package-lock.json |
| high | mcp-tool-shop-org/npm-sovereignty | dependencies_sca | No package-lock.json | Generate and commit package-lock.json. |
| high | mcp-tool-shop-org/npm-sovereignty | supply_chain | No dependency pinning | Generate lockfile |
| high | mcp-tool-shop-org/npm-sovereignty | supply_chain | No lockfile for dependency pinning | - |
| high | mcp-tool-shop-org/npm-xrpl-camp | cicd | No CI for core code | Add ci.yml |
| high | mcp-tool-shop-org/npm-xrpl-camp | cicd | No CI workflow for build/test | Add ci.yml with node verify step and npm audit. |
| high | mcp-tool-shop-org/npm-xrpl-camp | dependencies_sca | No lockfile | Generate package-lock.json |
| high | mcp-tool-shop-org/npm-xrpl-camp | supply_chain | No dependency pinning | Generate lockfile |
| high | mcp-tool-shop-org/npm-xrpl-camp | testing | No test suite | Add basic tests verifying config shape and npm-launcher integration. |
| high | mcp-tool-shop-org/npm-xrpl-lab | cicd | No CI configuration | - |
| high | mcp-tool-shop-org/npm-xrpl-lab | cicd | No CI for core code | Add ci.yml |
| high | mcp-tool-shop-org/npm-xrpl-lab | dependencies_sca | No lockfile | Generate package-lock.json |
| high | mcp-tool-shop-org/npm-xrpl-lab | dependencies_sca | No package-lock.json | Generate and commit package-lock.json. |
| high | mcp-tool-shop-org/npm-xrpl-lab | supply_chain | No dependency pinning | Generate lockfile |
| high | mcp-tool-shop-org/npm-xrpl-lab | supply_chain | No lockfile | - |
| high | mcp-tool-shop-org/original_voice-soundboard | testing | No tests | - |
| high | mcp-tool-shop-org/payroll-engine | security_sast | Financial system needs pen testing | - |
| high | mcp-tool-shop-org/polyglot | dependencies_sca | Multiple high/moderate dep vulnerabilities | npm audit fix |
| high | mcp-tool-shop-org/polyglot | inventory | No SECURITY.md | - |
| high | mcp-tool-shop-org/polyglot-vscode | dependencies_sca | 3 high transitive dep vulns via MCP SDK chain | Update @mcptoolshop/polyglot-mcp which should update MCP SDK. |
| high | mcp-tool-shop-org/readme-i18n | cicd | No CI workflows | - |
| high | mcp-tool-shop-org/readme-i18n | inventory | Missing README.md | - |
| high | mcp-tool-shop-org/readme-i18n | licenses | Missing LICENSE file | - |
| high | mcp-tool-shop-org/registry-stats | cicd | No CI for core JS/TS code | Add ci.yml for core code with test/build/audit steps |
| high | mcp-tool-shop-org/registry-stats | cicd | No CI workflow for TypeScript package | Add ci.yml with npm ci, tsup build, vitest run, npm audit. |
| high | mcp-tool-shop-org/registry-stats-vscode | dependencies_sca | 1 high dependency vulnerability | npm audit fix |
| high | mcp-tool-shop-org/repo-crawler-mcp | dependencies_sca | 3 high transitive dependency vulnerabilities | Run npm audit fix. |
| high | mcp-tool-shop-org/repo-tester | cicd | No CI workflows | - |
| high | mcp-tool-shop-org/repomesh | testing | No test files found | Add test coverage |
| high | mcp-tool-shop-org/runforge-vscode | dependencies_sca | 4 high dependency vulnerabilities | npm audit fix |
| high | mcp-tool-shop-org/shipcheck | testing | No test suite | Add tests for detectTypes, init, audit commands. |
| high | mcp-tool-shop-org/sprite-creator-studio | cicd | No CI workflows configured | Add ci.yml |
| high | mcp-tool-shop-org/synthesis | dependencies_sca | 1 high dependency vulnerability | npm audit fix |
| high | mcp-tool-shop-org/training-studio | dependencies_sca | HIGH rollup vulnerability (arbitrary file write) | Run npm audit fix |
| high | mcp-tool-shop-org/vocal-synth-engine | dependencies_sca | 1 high dependency vulnerability | npm audit fix |
| high | mcp-tool-shop-org/vocal-synth-engine | testing | No test files found | Add tests |
| high | mcp-tool-shop-org/websketch-demo | dependencies_sca | 3 high dependency vulnerabilities | npm audit fix |
| high | mcp-tool-shop-org/websketch-ir | dependencies_sca | 1 high dependency vulnerability | npm audit fix |
| high | mcp-tool-shop-org/websketch-mcp | testing | No test files | - |
| high | mcp-tool-shop/mcp-tool-shop | dependencies_sca | High vulnerability in rollup (site dep) | Run npm audit fix in site/ |
| high | mcp-tool-shop/mcp-tool-shop | dependencies_sca | High vulnerability in svgo (site dep) | Run npm audit fix in site/ |
| high | mcp-tool-shop/mcpt-logo-presets | cicd | No CI/CD configuration | Add ci.yml with build, typecheck, test, npm audit. |
| high | mcp-tool-shop/mcpt-logo-presets | cicd | No automated build/test in CI | Add CI workflow: npm run typecheck, npm run test, npm audit. |
| high | mcp-tool-shop/mcpt-logo-studio | cicd | No CI/CD configuration | Add ci.yml with tsc, eslint, vitest, npm audit. Paths-gated per org rules. |
| high | mcp-tool-shop/mcpt-logo-studio | cicd | No automated build/test/lint in CI | Add CI workflow. |

## 6. Most Common Patterns

| Finding | Severity | Domain | Repos Affected |
|---------|----------|--------|----------------|
| No SBOM | low | supply_chain | 109 |
| No SAST | medium | security_sast | 39 |
| Actions not pinned to SHA | medium | supply_chain | 30 |
| Branch protection not verified | low | cicd | 25 |
| No SBOM generated | info | supply_chain | 21 |
| Branch protection unverified | low | cicd | 13 |
| No SAST in CI | medium | security_sast | 13 |
| No tests | high | testing | 13 |
| Missing SECURITY.md | medium | inventory | 12 |
| No SECURITY.md | medium | inventory | 11 |
| No dependabot | medium | dependencies_sca | 11 |
| No package signing | low | supply_chain | 9 |
| No signing | low | supply_chain | 9 |
| No dependency update mechanism | medium | dependencies_sca | 8 |
| No Dependabot | low | dependencies_sca | 7 |
| GitHub Actions not pinned to SHA | medium | supply_chain | 6 |
| Missing SECURITY.md and CHANGELOG.md | medium | inventory | 6 |
| No SAST tooling | medium | security_sast | 6 |
| No lockfile | high | dependencies_sca | 6 |
| No CI | high | cicd | 5 |
| No CI build workflow | medium | cicd | 5 |
| 1 high dependency vulnerability | high | dependencies_sca | 4 |
| 1 moderate vulnerability | medium | dependencies_sca | 4 |
| No CI configuration | high | cicd | 4 |
| No CI for core code | high | cicd | 4 |
| No branch protection documented | medium | cicd | 4 |
| No dependency pinning | high | supply_chain | 4 |
| No secrets scanner in CI | medium | secrets | 4 |
| No security scanning in CI | high | cicd | 4 |
| No security scans in CI | medium | cicd | 4 |

## 7. Control Pass Rates

| Control | Domain | Title | Pass | Fail | Warn | N/A | Rate |
|---------|--------|-------|------|------|------|-----|------|
| BDR-001 | backup_dr | Critical state/data and recovery surface identifie | 81 | 0 | 0 | 121 | 100.0% |
| BDR-002 | backup_dr | Backup/restore strategy documented or explicit gap | 26 | 0 | 5 | 171 | 83.9% |
| BDR-003 | backup_dr | Disaster-recovery/manual recovery steps documented | 18 | 0 | 3 | 181 | 85.7% |
| CIC-001 | cicd | CI configuration exists for active repo or explici | 160 | 30 | 11 | 0 | 79.2% |
| CIC-002 | cicd | CI runs build/lint/test | 155 | 36 | 10 | 0 | 76.7% |
| CIC-003 | cicd | CI runs security/dependency/secret scans or explic | 26 | 36 | 138 | 1 | 12.9% |
| CIC-004 | cicd | CI secrets handled securely | 177 | 1 | 6 | 17 | 95.7% |
| CIC-005 | cicd | Branch protection/checks/release gating documented | 13 | 3 | 173 | 12 | 6.8% |
| QUA-001 | code_quality | Primary build/lint commands run successfully | 185 | 0 | 13 | 3 | 93.0% |
| QUA-002 | code_quality | Formatting/style enforcement present and passing | 57 | 0 | 122 | 22 | 31.7% |
| QUA-003 | code_quality | Major complexity/duplication hotspots identified a | 177 | 0 | 3 | 21 | 97.8% |
| QUA-004 | code_quality | Dead code, stale TODOs, and abandoned paths review | 195 | 0 | 4 | 2 | 97.5% |
| QUA-005 | code_quality | Module boundaries/cohesion are understandable and  | 198 | 0 | 1 | 2 | 99.0% |
| CPR-001 | compliance_privacy | Data classes handled by repo are identified | 199 | 0 | 0 | 2 | 99.5% |
| CPR-002 | compliance_privacy | Encryption requirements in transit/at rest are sat | 69 | 0 | 1 | 131 | 97.2% |
| CPR-003 | compliance_privacy | Retention/deletion/privacy obligations documented  | 17 | 0 | 1 | 183 | 89.5% |
| CPR-004 | compliance_privacy | Audit logging/access control for compliance-releva | 6 | 0 | 0 | 195 | 85.7% |
| CFG-001 | config_iac | Config/IaC artifacts identified | 164 | 6 | 5 | 26 | 93.2% |
| CFG-002 | config_iac | IaC/config scan executed where applicable | 16 | 0 | 0 | 185 | 94.1% |
| CFG-003 | config_iac | No critical misconfigurations in infra/config | 13 | 0 | 5 | 183 | 68.4% |
| CFG-004 | config_iac | Least-privilege/network/TLS/resource controls are  | 73 | 0 | 4 | 124 | 93.6% |
| CFG-005 | config_iac | Required environment variables and secrets are doc | 172 | 0 | 0 | 29 | 99.4% |
| CON-001 | containers | Container assets scanned where applicable | 14 | 0 | 2 | 186 | 87.5% |
| CON-002 | containers | Base images are current, minimal, and pinned | 4 | 0 | 12 | 186 | 25.0% |
| CON-003 | containers | Containers do not run as root without formal excep | 3 | 2 | 11 | 186 | 18.8% |
| CON-004 | containers | Container hardening is present or gap explicitly r | 8 | 0 | 8 | 186 | 50.0% |
| DEP-001 | dependencies_sca | Dependency inventory generated successfully | 177 | 0 | 9 | 15 | 94.7% |
| DEP-002 | dependencies_sca | No unresolved critical dependency vulnerabilities | 173 | 0 | 12 | 16 | 93.0% |
| DEP-003 | dependencies_sca | No unresolved high dependency vulnerabilities with | 149 | 15 | 21 | 16 | 80.1% |
| DEP-004 | dependencies_sca | Lockfiles/version pins are present and valid where | 142 | 11 | 13 | 35 | 85.0% |
| DEP-005 | dependencies_sca | Stale/EOL dependencies identified | 126 | 0 | 51 | 24 | 70.8% |
| DEP-006 | dependencies_sca | Update path exists: Dependabot/Renovate/manual cad | 11 | 22 | 140 | 28 | 6.3% |
| DPL-001 | deployment | Deployment scripts/manifests/path reviewed | 173 | 0 | 4 | 24 | 97.2% |
| DPL-002 | deployment | Safe rollout/rollback support exists or gap is rec | 75 | 0 | 39 | 87 | 65.2% |
| DPL-003 | deployment | Production and development settings are separated | 94 | 0 | 0 | 107 | 98.9% |
| DPL-004 | deployment | Exposed services/endpoints/auth surfaces inventori | 146 | 0 | 1 | 54 | 98.6% |
| INT-001 | integrations | Third-party services and scopes inventoried | 131 | 0 | 0 | 29 | 100.0% |
| INT-002 | integrations | External credentials/OAuth/webhook permissions use | 77 | 0 | 0 | 83 | 100.0% |
| INT-003 | integrations | Webhook signatures, callback validation, and idemp | 2 | 0 | 0 | 158 | 100.0% |
| INV-001 | inventory | README present and materially current | 195 | 1 | 5 | 0 | 96.5% |
| INV-002 | inventory | Manifests/build files/runtime entrypoints identifi | 196 | 1 | 4 | 0 | 97.0% |
| INV-003 | inventory | Maintainer/owner/operational responsibility identi | 199 | 0 | 3 | 0 | 98.5% |
| INV-004 | inventory | External services, deploy targets, and sensitive t | 190 | 4 | 6 | 1 | 94.5% |
| LIC-001 | licenses | Third-party licenses inventoried | 194 | 3 | 2 | 2 | 97.0% |
| LIC-002 | licenses | No prohibited or policy-conflicting licenses | 195 | 1 | 5 | 0 | 96.5% |
| LIC-003 | licenses | Attribution/license-file obligations satisfied | 194 | 6 | 1 | 0 | 96.0% |
| LIC-004 | licenses | Unknown or ambiguous licenses triaged | 123 | 1 | 8 | 69 | 92.5% |
| MON-001 | monitoring | Health/readiness/liveness/heartbeat checks exist w | 10 | 0 | 1 | 191 | 90.9% |
| MON-002 | monitoring | Alerting/monitoring ownership and thresholds docum | 3 | 0 | 4 | 195 | 42.9% |
| OBS-001 | observability | Structured logging/error reporting is present wher | 149 | 0 | 17 | 35 | 89.2% |
| OBS-002 | observability | Logs do not expose secrets or sensitive data | 199 | 0 | 0 | 2 | 99.5% |
| OBS-003 | observability | Failure diagnostics are actionable | 170 | 0 | 2 | 29 | 98.3% |
| OBS-004 | observability | Metrics/tracing hooks exist or explicit absence is | 22 | 0 | 15 | 164 | 57.9% |
| PRF-001 | performance | Performance-sensitive paths identified | 167 | 0 | 0 | 35 | 100.0% |
| PRF-002 | performance | Benchmarks/load tests/profiling exist or gap is re | 12 | 0 | 67 | 123 | 15.2% |
| PRF-003 | performance | No obvious pathological loops/N+1/unbounded work | 182 | 0 | 4 | 16 | 97.8% |
| PRF-004 | performance | Scaling, memory, CPU, and I/O risks documented | 59 | 0 | 2 | 141 | 96.7% |
| RUN-001 | runtime | Runtime entrypoints and privilege model reviewed | 185 | 0 | 0 | 16 | 99.5% |
| RUN-002 | runtime | Crash/data-loss/error paths identified | 180 | 0 | 5 | 16 | 96.8% |
| RUN-003 | runtime | Timeouts/retries/resource boundaries are reasonabl | 175 | 0 | 6 | 20 | 96.2% |
| RUN-004 | runtime | Dangerous debug/dev modes are not enabled by defau | 187 | 0 | 0 | 14 | 99.5% |
| SCR-001 | secrets | Secrets scan executed against repo contents | 125 | 0 | 72 | 4 | 63.1% |
| SCR-002 | secrets | No active hardcoded secrets, tokens, credentials,  | 201 | 0 | 0 | 0 | 99.5% |
| SCR-003 | secrets | Examples/config templates do not expose live secre | 169 | 0 | 0 | 32 | 99.4% |
| SCR-004 | secrets | Secret storage and rotation path documented | 37 | 0 | 3 | 161 | 90.2% |
| SEC-001 | security_sast | SAST executed for all applicable languages | 66 | 8 | 100 | 27 | 37.7% |
| SEC-002 | security_sast | No critical injection/deserialization/RCE-class pa | 189 | 2 | 7 | 3 | 95.0% |
| SEC-003 | security_sast | Authn/authz checks exist where privileged actions  | 39 | 0 | 3 | 159 | 90.7% |
| SEC-004 | security_sast | Input validation and output encoding are adequate | 171 | 2 | 8 | 20 | 94.0% |
| SEC-005 | security_sast | Crypto/session/secret handling uses safe APIs and  | 78 | 1 | 1 | 121 | 96.3% |
| SEC-006 | security_sast | Security-relevant warnings are triaged or justifie | 182 | 13 | 4 | 2 | 91.0% |
| SUP-001 | supply_chain | SBOM generated or explicit gap recorded | 7 | 0 | 178 | 16 | 3.8% |
| SUP-002 | supply_chain | Provenance/pinning for dependencies and artifacts  | 141 | 10 | 47 | 3 | 70.9% |
| SUP-003 | supply_chain | Release artifacts/images/packages are signed or ex | 39 | 1 | 122 | 39 | 23.9% |
| SUP-004 | supply_chain | Build/release flow resists tampering and uses trus | 185 | 0 | 12 | 4 | 93.4% |
| TST-001 | testing | Test suite executes successfully where present | 148 | 24 | 22 | 7 | 75.9% |
| TST-002 | testing | Unit coverage exists for critical logic | 146 | 25 | 17 | 13 | 77.2% |
| TST-003 | testing | Integration/e2e coverage exists where architecture | 85 | 7 | 17 | 92 | 77.3% |
| TST-004 | testing | Regression/security edge cases are tested or gap i | 120 | 13 | 41 | 27 | 68.6% |
| TST-005 | testing | Coverage/reporting captured or explicitly unavaila | 31 | 5 | 127 | 38 | 18.9% |

**Worst performing controls (lowest pass rate):**

- SUP-001: SBOM generated or explicit gap recorded (3.8% pass)
- DEP-006: Update path exists: Dependabot/Renovate/manual cadence documented (6.3% pass)
- CIC-005: Branch protection/checks/release gating documented (6.8% pass)
- CIC-003: CI runs security/dependency/secret scans or explicit gap recorded (12.9% pass)
- PRF-002: Benchmarks/load tests/profiling exist or gap is recorded (15.2% pass)
- CON-003: Containers do not run as root without formal exception (18.8% pass)
- TST-005: Coverage/reporting captured or explicitly unavailable (18.9% pass)
- SUP-003: Release artifacts/images/packages are signed or explicit gap recorded (23.9% pass)
- CON-002: Base images are current, minimal, and pinned (25.0% pass)
- QUA-002: Formatting/style enforcement present and passing (31.7% pass)

**Best performing controls (highest pass rate):**

- PRF-001: Performance-sensitive paths identified (100.0% pass)
- INT-003: Webhook signatures, callback validation, and idempotency enforced where applicable (100.0% pass)
- INT-002: External credentials/OAuth/webhook permissions use least privilege (100.0% pass)
- INT-001: Third-party services and scopes inventoried (100.0% pass)
- BDR-001: Critical state/data and recovery surface identified (100.0% pass)
- SCR-002: No active hardcoded secrets, tokens, credentials, or keys (99.5% pass)
- OBS-002: Logs do not expose secrets or sensitive data (99.5% pass)
- CPR-001: Data classes handled by repo are identified (99.5% pass)
- RUN-004: Dangerous debug/dev modes are not enabled by default (99.5% pass)
- RUN-001: Runtime entrypoints and privilege model reviewed (99.5% pass)

## 8. Repos by Posture

### needs_attention (70 repos)

| Slug | Pass Rate | High | Medium | Low |
|------|-----------|------|--------|-----|
| local/mcp-org-github | 87.5% | 0 | 3 | 2 |
| mcp-tool-shop-org/ai-jam-sessions | 61.7% | 1 | 2 | 1 |
| mcp-tool-shop-org/ai-ui | 76.0% | 2 | 3 | 0 |
| mcp-tool-shop-org/ambient-wavs | 64.0% | 3 | 1 | 3 |
| mcp-tool-shop-org/anchor | 52.5% | 2 | 3 | 1 |
| mcp-tool-shop-org/Attestia-Desktop | 60.0% | 2 | 4 | 0 |
| mcp-tool-shop-org/avatar-runtime | 68.0% | 3 | 0 | 1 |
| mcp-tool-shop-org/backprop | 84.0% | 0 | 3 | 2 |
| mcp-tool-shop-org/claude-guardian | 67.9% | 3 | 2 | 2 |
| mcp-tool-shop-org/claude-memories | 63.0% | 3 | 2 | 2 |
| mcp-tool-shop-org/claude-session-copilot | 74.0% | 2 | 2 | 2 |
| mcp-tool-shop-org/clearance-opinion-engine | 69.1% | 0 | 2 | 3 |
| mcp-tool-shop-org/CodeClone-Desktop | 51.0% | 4 | 2 | 0 |
| mcp-tool-shop-org/commandui | 66.3% | 0 | 3 | 2 |
| mcp-tool-shop-org/ConsensusOS | 64.2% | 2 | 2 | 0 |
| mcp-tool-shop-org/deltamind | 76.0% | 1 | 2 | 0 |
| mcp-tool-shop-org/feature-reacher | 82.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/game-dev-mcp | 73.0% | 1 | 2 | 1 |
| mcp-tool-shop-org/homebrew-core | 78.6% | 1 | 1 | 1 |
| mcp-tool-shop-org/homebrew-mcp-tools | 75.9% | 1 | 1 | 1 |
| mcp-tool-shop-org/homevault | 80.8% | 1 | 1 | 2 |
| mcp-tool-shop-org/InControl-Desktop | 72.5% | 0 | 1 | 3 |
| mcp-tool-shop-org/integradio | 77.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/LeaseGate | 63.0% | 3 | 2 | 0 |
| mcp-tool-shop-org/LeaseGate-Lite | 66.3% | 1 | 2 | 1 |
| mcp-tool-shop-org/llm-sync-drive | 77.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/LoKey-Typer | 53.0% | 1 | 2 | 2 |
| mcp-tool-shop-org/mcp-aside | 74.0% | 2 | 1 | 0 |
| mcp-tool-shop-org/mcp-examples | 85.2% | 0 | 1 | 1 |
| mcp-tool-shop-org/mcp-file-forge | 63.0% | 3 | 1 | 0 |
| mcp-tool-shop-org/mcp-personify | 77.1% | 0 | 2 | 2 |
| mcp-tool-shop-org/mcp-stress-test | 66.3% | 0 | 2 | 0 |
| mcp-tool-shop-org/mcp-tool-shop | 83.3% | 2 | 4 | 1 |
| mcp-tool-shop-org/mcp-tool-shop.github.io | 79.4% | 0 | 2 | 2 |
| mcp-tool-shop-org/nameops | 77.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/nexus-control | - | 0 | 2 | 1 |
| mcp-tool-shop-org/nexus-suite | 80.9% | 0 | 2 | 2 |
| mcp-tool-shop-org/npm-escape-the-valley | 65.0% | 3 | 2 | 0 |
| mcp-tool-shop-org/npm-sovereignty | 64.0% | 3 | 2 | 0 |
| mcp-tool-shop-org/npm-xrpl-camp | 49.4% | 2 | 2 | 0 |
| mcp-tool-shop-org/npm-xrpl-lab | 64.0% | 3 | 2 | 0 |
| mcp-tool-shop-org/original_voice-soundboard | 76.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/payroll-engine | - | 1 | 1 | 1 |
| mcp-tool-shop-org/polyglot | 80.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/prototypes | 32.1% | 0 | 1 | 1 |
| mcp-tool-shop-org/prov-spec | 88.9% | 0 | 1 | 1 |
| mcp-tool-shop-org/readme-i18n | 42.1% | 3 | 1 | 0 |
| mcp-tool-shop-org/Registrum | 77.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/registry-stats | 65.4% | 1 | 2 | 2 |
| mcp-tool-shop-org/registry-stats-vscode | - | 0 | 0 | 0 |
| mcp-tool-shop-org/repo-tester | 75.0% | 1 | 1 | 0 |
| mcp-tool-shop-org/repomesh | - | 0 | 0 | 0 |
| mcp-tool-shop-org/rippled-windows-debug | 85.7% | 0 | 1 | 1 |
| mcp-tool-shop-org/runforge-vscode | - | 0 | 0 | 0 |
| mcp-tool-shop-org/ScalarScope | 59.0% | 2 | 1 | 0 |
| mcp-tool-shop-org/siege-kit | - | 0 | 0 | 0 |
| mcp-tool-shop-org/site-theme | 80.0% | 0 | 3 | 0 |
| mcp-tool-shop-org/sprite-creator-studio | 72.3% | 1 | 1 | 2 |
| mcp-tool-shop-org/stillpoint | 61.3% | 0 | 3 | 1 |
| mcp-tool-shop-org/training-studio | 68.8% | 1 | 1 | 1 |
| mcp-tool-shop-org/VectorCaliper | 77.0% | 1 | 1 | 1 |
| mcp-tool-shop-org/vocal-synth-engine | 69.7% | 2 | 1 | 2 |
| mcp-tool-shop-org/websketch-demo | 76.6% | 1 | 0 | 2 |
| mcp-tool-shop-org/websketch-mcp | 83.0% | 1 | 1 | 1 |
| mcp-tool-shop/mcp-tool-shop | 71.3% | 2 | 3 | 3 |
| mcp-tool-shop/mcpt-link-fresh | 68.8% | 0 | 2 | 3 |
| mcp-tool-shop/mcpt-logo-presets | 58.0% | 2 | 4 | 2 |
| mcp-tool-shop/mcpt-logo-studio | 63.0% | 2 | 6 | 0 |
| mcp-tool-shop/mcpt-marketing | 62.5% | 0 | 2 | 2 |
| mcp-tool-shop/mcpt-publishing | 72.0% | 0 | 1 | 5 |

### healthy (105 repos)

| Slug | Pass Rate | High | Medium | Low |
|------|-----------|------|--------|-----|
| mcp-tool-shop-org/.github | 96.8% | 0 | 0 | 1 |
| mcp-tool-shop-org/a11y-assist | 84.0% | 0 | 1 | 2 |
| mcp-tool-shop-org/a11y-ci | 76.0% | 0 | 2 | 1 |
| mcp-tool-shop-org/a11y-demo-site | 97.1% | 0 | 0 | 1 |
| mcp-tool-shop-org/a11y-evidence-engine | 71.6% | 0 | 0 | 1 |
| mcp-tool-shop-org/a11y-lint | 85.0% | 0 | 1 | 2 |
| mcp-tool-shop-org/a11y-mcp-tools | 69.1% | 0 | 1 | 1 |
| mcp-tool-shop-org/accessibility-suite | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/ai-loadout | 88.0% | 0 | 0 | 3 |
| mcp-tool-shop-org/ai-music-sheets | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/ai-rpg-engine | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/ally-demo-python | 89.0% | 0 | 0 | 2 |
| mcp-tool-shop-org/artifact | 81.0% | 0 | 3 | 8 |
| mcp-tool-shop-org/aspire-ai | 80.0% | 0 | 2 | 1 |
| mcp-tool-shop-org/Attestia | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/audiobooker | 70.0% | 0 | 1 | 2 |
| mcp-tool-shop-org/avatar-face-mvp | 81.4% | 0 | 1 | 2 |
| mcp-tool-shop-org/backpropagate | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/brain-dev | 83.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/brand | 80.0% | 0 | 2 | 4 |
| mcp-tool-shop-org/build-governor | 68.8% | 0 | 1 | 1 |
| mcp-tool-shop-org/cannon-archive | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/civility-kernel | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/ClaimLedger | - | 0 | 0 | 0 |
| mcp-tool-shop-org/claude-collaborate | 89.3% | 0 | 0 | 2 |
| mcp-tool-shop-org/claude-rpg | 83.0% | 0 | 2 | 3 |
| mcp-tool-shop-org/claude-rules | 67.9% | 0 | 2 | 2 |
| mcp-tool-shop-org/claude-sfx | 88.0% | 0 | 1 | 3 |
| mcp-tool-shop-org/claude-toolstack | 85.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/code-batch | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/code-covered | 69.0% | 0 | 0 | 1 |
| mcp-tool-shop-org/codeclone-suite | 77.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/codecomfy-vscode | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/codeteam | 76.9% | 0 | 2 | 2 |
| mcp-tool-shop-org/codeteam-suite | 71.3% | 0 | 1 | 1 |
| mcp-tool-shop-org/comfy-headless | 79.0% | 0 | 0 | 1 |
| mcp-tool-shop-org/context-window-manager | 83.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/control-room | 72.5% | 0 | 1 | 1 |
| mcp-tool-shop-org/CreatorLedger | 83.1% | 0 | 1 | 2 |
| mcp-tool-shop-org/CursorAssist | 71.0% | 0 | 0 | 3 |
| mcp-tool-shop-org/DeterministicMouseTrainingEngine | 85.7% | 0 | 1 | 2 |
| mcp-tool-shop-org/dev-op-typer | 63.8% | 0 | 2 | 1 |
| mcp-tool-shop-org/escape-the-valley | 83.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/file-compass | 83.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/flexiflow | 83.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/glyphstudio | 71.3% | 0 | 1 | 1 |
| mcp-tool-shop-org/headless-wheel-builder | 83.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/jam-session-plugin | 82.1% | 0 | 1 | 2 |
| mcp-tool-shop-org/ledger-suite | 77.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/linux-dev-typer | 69.0% | 0 | 0 | 3 |
| mcp-tool-shop-org/mcp-app-builder | 88.0% | 0 | 1 | 2 |
| mcp-tool-shop-org/mcp-bouncer | 81.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/mcp-tool-registry | 80.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/mcp-voice-engine | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/mcp-voice-soundboard | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/mcpt | - | 0 | 1 | 1 |
| mcp-tool-shop-org/meta-content-system | 89.3% | 0 | 0 | 2 |
| mcp-tool-shop-org/MouseTrainer | 89.7% | 0 | 0 | 2 |
| mcp-tool-shop-org/NextLedger | 69.0% | 0 | 1 | 2 |
| mcp-tool-shop-org/nexus-attest | - | 0 | 1 | 1 |
| mcp-tool-shop-org/nexus-router | - | 0 | 1 | 1 |
| mcp-tool-shop-org/nexus-router-adapter-http | - | 0 | 1 | 1 |
| mcp-tool-shop-org/nexus-router-adapter-stdout | - | 0 | 1 | 1 |
| mcp-tool-shop-org/npm-launcher | 84.0% | 0 | 1 | 3 |
| mcp-tool-shop-org/nuget-signing-kit | 86.2% | 0 | 1 | 2 |
| mcp-tool-shop-org/nullout | - | 0 | 1 | 1 |
| mcp-tool-shop-org/pathway | - | 0 | 1 | 1 |
| mcp-tool-shop-org/pocket-ledger | 85.5% | 0 | 1 | 2 |
| mcp-tool-shop-org/polyglot-mcp | 88.0% | 0 | 1 | 3 |
| mcp-tool-shop-org/polyglot-vscode | 71.6% | 1 | 0 | 0 |
| mcp-tool-shop-org/prov-engine-js | 64.2% | 0 | 1 | 1 |
| mcp-tool-shop-org/py-polyglot | - | 0 | 1 | 1 |
| mcp-tool-shop-org/receipt-factory | 72.8% | 0 | 0 | 0 |
| mcp-tool-shop-org/registry-pulse | 60.5% | 0 | 1 | 1 |
| mcp-tool-shop-org/registry-sync | 85.0% | 0 | 1 | 3 |
| mcp-tool-shop-org/repo-crawler-mcp | 83.0% | 1 | 1 | 2 |
| mcp-tool-shop-org/runforge-desktop | 68.8% | 0 | 1 | 1 |
| mcp-tool-shop-org/ScalarScope-Desktop | 73.8% | 0 | 1 | 2 |
| mcp-tool-shop-org/shipcheck | 95.0% | 0 | 0 | 1 |
| mcp-tool-shop-org/sonic-core | 80.0% | 0 | 1 | 3 |
| mcp-tool-shop-org/sonic-runtime | 63.8% | 0 | 1 | 2 |
| mcp-tool-shop-org/soundboard-maui | 68.8% | 0 | 1 | 1 |
| mcp-tool-shop-org/soundboard-plugin | - | 0 | 1 | 1 |
| mcp-tool-shop-org/soundweave | 83.1% | 0 | 0 | 3 |
| mcp-tool-shop-org/sovereignty | - | 0 | 1 | 1 |
| mcp-tool-shop-org/stresskit-mcp | 84.6% | 0 | 1 | 2 |
| mcp-tool-shop-org/synthesis | 80.0% | 1 | 1 | 2 |
| mcp-tool-shop-org/ThrottleAI | 84.0% | 0 | 1 | 1 |
| mcp-tool-shop-org/tool-compass | - | 0 | 1 | 1 |
| mcp-tool-shop-org/tool-scan | - | 0 | 1 | 1 |
| mcp-tool-shop-org/ToolShopStudio | 75.0% | 1 | 2 | 2 |
| mcp-tool-shop-org/Trace | 85.7% | 0 | 1 | 2 |
| mcp-tool-shop-org/venvkit | 72.8% | 0 | 1 | 1 |
| mcp-tool-shop-org/voice-soundboard | - | 0 | 1 | 1 |
| mcp-tool-shop-org/vscode-voice-soundboard | 85.0% | 0 | 1 | 2 |
| mcp-tool-shop-org/websketch-cli | 89.0% | 0 | 1 | 2 |
| mcp-tool-shop-org/websketch-extension | 74.2% | 0 | 0 | 3 |
| mcp-tool-shop-org/websketch-ir | 81.5% | 1 | 0 | 2 |
| mcp-tool-shop-org/websketch-vscode | 81.5% | 0 | 1 | 2 |
| mcp-tool-shop-org/winget-pkgs | 90.3% | 0 | 1 | 1 |
| mcp-tool-shop-org/witness | - | 0 | 1 | 1 |
| mcp-tool-shop-org/world-forge | 89.0% | 0 | 0 | 2 |
| mcp-tool-shop-org/xrpl-camp | - | 0 | 1 | 1 |
| mcp-tool-shop-org/xrpl-lab | - | 0 | 1 | 1 |
| mcp-tool-shop-org/zip-meta-map | - | 0 | 1 | 1 |

## 9. Knowledge Layer Summary

- **Notes:** 668 across 352 repos with thesis/arch coverage
- **Relationships:** 408 mapped
- **Releases:** 324 tracked across 110 repos
- **Facts:** 620
- **Docs indexed:** 1363

**Most annotated repos:**

- mcp-tool-shop-org/a11y-lint: 10 notes
- mcp-tool-shop-org/claude-guardian: 9 notes
- mcp-tool-shop-org/glyphstudio: 8 notes
- mcp-tool-shop-org/aspire-ai: 8 notes
- mcp-tool-shop-org/nexus-router: 7 notes
- mcp-tool-shop-org/soundboard-plugin: 7 notes
- mcp-tool-shop-org/backpropagate: 7 notes
- mcp-tool-shop-org/registry-stats: 6 notes
- mcp-tool-shop-org/LeaseGate-Lite: 6 notes
- mcp-tool-shop-org/deltamind: 6 notes

## 10. Recommendations

1. **Address 70 needs-attention repos.** Prioritize by finding severity.
2. **Improve lowest-performing controls:** SUP-001, DEP-006, CIC-005, CIC-003, PRF-002. These have the lowest pass rates across the portfolio.
3. **Address recurring pattern "No SBOM"** which affects 109 repos.
