/**
 * Canonical audit control catalog — v2.
 *
 * 19 domains, 80 controls. Fixed IDs. Stable across all repos.
 * Never rename or reuse IDs. Only append new ones.
 */
import type { Database as DatabaseType } from 'better-sqlite3';

export type Domain =
  | 'inventory' | 'code_quality' | 'security_sast' | 'dependencies_sca'
  | 'licenses' | 'secrets' | 'config_iac' | 'containers' | 'runtime'
  | 'performance' | 'observability' | 'testing' | 'cicd' | 'deployment'
  | 'backup_dr' | 'monitoring' | 'compliance_privacy' | 'supply_chain'
  | 'integrations';

export interface Control {
  id: string;
  domain: Domain;
  title: string;
  description?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  applicable_to?: string[];
  automated: number;
  tool_hint?: string;
}

export const DOMAINS: Domain[] = [
  'inventory', 'code_quality', 'security_sast', 'dependencies_sca',
  'licenses', 'secrets', 'config_iac', 'containers', 'runtime',
  'performance', 'observability', 'testing', 'cicd', 'deployment',
  'backup_dr', 'monitoring', 'compliance_privacy', 'supply_chain',
  'integrations'
];

export const CONTROLS: Control[] = [
  // ─── 1. INVENTORY ──────────────────────────────────────────────────────────
  { id: 'INV-001', domain: 'inventory', title: 'README present and materially current', severity: 'medium', automated: 1, tool_hint: 'filesystem' },
  { id: 'INV-002', domain: 'inventory', title: 'Manifests/build files/runtime entrypoints identified', severity: 'high', automated: 1, tool_hint: 'filesystem' },
  { id: 'INV-003', domain: 'inventory', title: 'Maintainer/owner/operational responsibility identifiable', severity: 'medium', automated: 0 },
  { id: 'INV-004', domain: 'inventory', title: 'External services, deploy targets, and sensitive touchpoints inventoried', severity: 'medium', automated: 0 },

  // ─── 2. CODE QUALITY ───────────────────────────────────────────────────────
  { id: 'QUA-001', domain: 'code_quality', title: 'Primary build/lint commands run successfully', severity: 'high', automated: 1, tool_hint: 'eslint/pylint/clippy' },
  { id: 'QUA-002', domain: 'code_quality', title: 'Formatting/style enforcement present and passing', severity: 'medium', automated: 1, tool_hint: 'prettier/black/rustfmt' },
  { id: 'QUA-003', domain: 'code_quality', title: 'Major complexity/duplication hotspots identified and bounded', severity: 'low', automated: 1, tool_hint: 'sonarqube/jscpd' },
  { id: 'QUA-004', domain: 'code_quality', title: 'Dead code, stale TODOs, and abandoned paths reviewed', severity: 'low', automated: 1, tool_hint: 'grep' },
  { id: 'QUA-005', domain: 'code_quality', title: 'Module boundaries/cohesion are understandable and non-chaotic', severity: 'medium', automated: 0 },

  // ─── 3. SECURITY / SAST ───────────────────────────────────────────────────
  { id: 'SEC-001', domain: 'security_sast', title: 'SAST executed for all applicable languages', severity: 'high', automated: 1, tool_hint: 'semgrep/codeql/bandit' },
  { id: 'SEC-002', domain: 'security_sast', title: 'No critical injection/deserialization/RCE-class patterns', severity: 'critical', automated: 1, tool_hint: 'semgrep' },
  { id: 'SEC-003', domain: 'security_sast', title: 'Authn/authz checks exist where privileged actions exist', severity: 'high', automated: 0 },
  { id: 'SEC-004', domain: 'security_sast', title: 'Input validation and output encoding are adequate', severity: 'high', automated: 0 },
  { id: 'SEC-005', domain: 'security_sast', title: 'Crypto/session/secret handling uses safe APIs and patterns', severity: 'high', automated: 0 },
  { id: 'SEC-006', domain: 'security_sast', title: 'Security-relevant warnings are triaged or justified', severity: 'medium', automated: 0 },

  // ─── 4. DEPENDENCIES / SCA ────────────────────────────────────────────────
  { id: 'DEP-001', domain: 'dependencies_sca', title: 'Dependency inventory generated successfully', severity: 'high', automated: 1, tool_hint: 'npm-audit/pip-audit/cargo-audit' },
  { id: 'DEP-002', domain: 'dependencies_sca', title: 'No unresolved critical dependency vulnerabilities', severity: 'critical', automated: 1, tool_hint: 'npm-audit/snyk' },
  { id: 'DEP-003', domain: 'dependencies_sca', title: 'No unresolved high dependency vulnerabilities without exception', severity: 'high', automated: 1, tool_hint: 'npm-audit/snyk' },
  { id: 'DEP-004', domain: 'dependencies_sca', title: 'Lockfiles/version pins are present and valid where expected', severity: 'medium', automated: 1, tool_hint: 'filesystem' },
  { id: 'DEP-005', domain: 'dependencies_sca', title: 'Stale/EOL dependencies identified', severity: 'medium', automated: 1, tool_hint: 'npm-outdated' },
  { id: 'DEP-006', domain: 'dependencies_sca', title: 'Update path exists: Dependabot/Renovate/manual cadence documented', severity: 'low', automated: 0 },

  // ─── 5. LICENSES ──────────────────────────────────────────────────────────
  { id: 'LIC-001', domain: 'licenses', title: 'Third-party licenses inventoried', severity: 'medium', automated: 1, tool_hint: 'license-checker/scancode' },
  { id: 'LIC-002', domain: 'licenses', title: 'No prohibited or policy-conflicting licenses', severity: 'high', automated: 1, tool_hint: 'license-checker' },
  { id: 'LIC-003', domain: 'licenses', title: 'Attribution/license-file obligations satisfied', severity: 'medium', automated: 0 },
  { id: 'LIC-004', domain: 'licenses', title: 'Unknown or ambiguous licenses triaged', severity: 'medium', automated: 0 },

  // ─── 6. SECRETS & CREDENTIALS ─────────────────────────────────────────────
  { id: 'SCR-001', domain: 'secrets', title: 'Secrets scan executed against repo contents', severity: 'high', automated: 1, tool_hint: 'gitleaks/trufflehog' },
  { id: 'SCR-002', domain: 'secrets', title: 'No active hardcoded secrets, tokens, credentials, or keys', severity: 'critical', automated: 1, tool_hint: 'gitleaks' },
  { id: 'SCR-003', domain: 'secrets', title: 'Examples/config templates do not expose live secrets', severity: 'high', automated: 1, tool_hint: 'gitleaks' },
  { id: 'SCR-004', domain: 'secrets', title: 'Secret storage and rotation path documented', severity: 'medium', automated: 0 },

  // ─── 7. CONFIGURATION & IaC ───────────────────────────────────────────────
  { id: 'CFG-001', domain: 'config_iac', title: 'Config/IaC artifacts identified', severity: 'medium', automated: 1, tool_hint: 'filesystem' },
  { id: 'CFG-002', domain: 'config_iac', title: 'IaC/config scan executed where applicable', severity: 'high', automated: 1, tool_hint: 'checkov/trivy-config' },
  { id: 'CFG-003', domain: 'config_iac', title: 'No critical misconfigurations in infra/config', severity: 'critical', automated: 1, tool_hint: 'checkov' },
  { id: 'CFG-004', domain: 'config_iac', title: 'Least-privilege/network/TLS/resource controls are set or explicitly N/A', severity: 'high', automated: 0 },
  { id: 'CFG-005', domain: 'config_iac', title: 'Required environment variables and secrets are documented', severity: 'medium', automated: 0 },

  // ─── 8. CONTAINERS ────────────────────────────────────────────────────────
  { id: 'CON-001', domain: 'containers', title: 'Container assets scanned where applicable', severity: 'high', automated: 1, tool_hint: 'trivy/grype' },
  { id: 'CON-002', domain: 'containers', title: 'Base images are current, minimal, and pinned', severity: 'medium', automated: 1, tool_hint: 'trivy' },
  { id: 'CON-003', domain: 'containers', title: 'Containers do not run as root without formal exception', severity: 'high', automated: 1, tool_hint: 'hadolint' },
  { id: 'CON-004', domain: 'containers', title: 'Container hardening is present or gap explicitly recorded', severity: 'medium', automated: 0 },

  // ─── 9. RUNTIME ───────────────────────────────────────────────────────────
  { id: 'RUN-001', domain: 'runtime', title: 'Runtime entrypoints and privilege model reviewed', severity: 'medium', automated: 0 },
  { id: 'RUN-002', domain: 'runtime', title: 'Crash/data-loss/error paths identified', severity: 'medium', automated: 0 },
  { id: 'RUN-003', domain: 'runtime', title: 'Timeouts/retries/resource boundaries are reasonable', severity: 'medium', automated: 0 },
  { id: 'RUN-004', domain: 'runtime', title: 'Dangerous debug/dev modes are not enabled by default', severity: 'high', automated: 1, tool_hint: 'grep' },

  // ─── 10. PERFORMANCE ──────────────────────────────────────────────────────
  { id: 'PRF-001', domain: 'performance', title: 'Performance-sensitive paths identified', severity: 'medium', automated: 0 },
  { id: 'PRF-002', domain: 'performance', title: 'Benchmarks/load tests/profiling exist or gap is recorded', severity: 'low', automated: 0 },
  { id: 'PRF-003', domain: 'performance', title: 'No obvious pathological loops/N+1/unbounded work', severity: 'medium', automated: 0 },
  { id: 'PRF-004', domain: 'performance', title: 'Scaling, memory, CPU, and I/O risks documented', severity: 'low', automated: 0 },

  // ─── 11. OBSERVABILITY ────────────────────────────────────────────────────
  { id: 'OBS-001', domain: 'observability', title: 'Structured logging/error reporting is present where appropriate', severity: 'medium', automated: 0 },
  { id: 'OBS-002', domain: 'observability', title: 'Logs do not expose secrets or sensitive data', severity: 'high', automated: 1, tool_hint: 'semgrep/grep' },
  { id: 'OBS-003', domain: 'observability', title: 'Failure diagnostics are actionable', severity: 'medium', automated: 0 },
  { id: 'OBS-004', domain: 'observability', title: 'Metrics/tracing hooks exist or explicit absence is recorded', severity: 'low', automated: 0 },

  // ─── 12. TESTING ──────────────────────────────────────────────────────────
  { id: 'TST-001', domain: 'testing', title: 'Test suite executes successfully where present', severity: 'high', automated: 1, tool_hint: 'npm-test/pytest/cargo-test' },
  { id: 'TST-002', domain: 'testing', title: 'Unit coverage exists for critical logic', severity: 'medium', automated: 0 },
  { id: 'TST-003', domain: 'testing', title: 'Integration/e2e coverage exists where architecture requires it', severity: 'medium', automated: 0 },
  { id: 'TST-004', domain: 'testing', title: 'Regression/security edge cases are tested or gap is logged', severity: 'medium', automated: 0 },
  { id: 'TST-005', domain: 'testing', title: 'Coverage/reporting captured or explicitly unavailable', severity: 'low', automated: 1, tool_hint: 'coverage' },

  // ─── 13. CI/CD ────────────────────────────────────────────────────────────
  { id: 'CIC-001', domain: 'cicd', title: 'CI configuration exists for active repo or explicit N/A recorded', severity: 'high', automated: 1, tool_hint: 'gh/filesystem' },
  { id: 'CIC-002', domain: 'cicd', title: 'CI runs build/lint/test', severity: 'high', automated: 1, tool_hint: 'workflow-files' },
  { id: 'CIC-003', domain: 'cicd', title: 'CI runs security/dependency/secret scans or explicit gap recorded', severity: 'high', automated: 1, tool_hint: 'workflow-files' },
  { id: 'CIC-004', domain: 'cicd', title: 'CI secrets handled securely', severity: 'high', automated: 0 },
  { id: 'CIC-005', domain: 'cicd', title: 'Branch protection/checks/release gating documented', severity: 'medium', automated: 0 },

  // ─── 14. DEPLOYMENT ───────────────────────────────────────────────────────
  { id: 'DPL-001', domain: 'deployment', title: 'Deployment scripts/manifests/path reviewed', severity: 'medium', automated: 0 },
  { id: 'DPL-002', domain: 'deployment', title: 'Safe rollout/rollback support exists or gap is recorded', severity: 'medium', automated: 0 },
  { id: 'DPL-003', domain: 'deployment', title: 'Production and development settings are separated', severity: 'high', automated: 0 },
  { id: 'DPL-004', domain: 'deployment', title: 'Exposed services/endpoints/auth surfaces inventoried', severity: 'medium', automated: 0 },

  // ─── 15. BACKUP & RECOVERY ────────────────────────────────────────────────
  { id: 'BDR-001', domain: 'backup_dr', title: 'Critical state/data and recovery surface identified', severity: 'medium', automated: 0 },
  { id: 'BDR-002', domain: 'backup_dr', title: 'Backup/restore strategy documented or explicit gap recorded', severity: 'medium', automated: 0 },
  { id: 'BDR-003', domain: 'backup_dr', title: 'Disaster-recovery/manual recovery steps documented or explicit gap recorded', severity: 'medium', automated: 0 },

  // ─── 16. MONITORING ───────────────────────────────────────────────────────
  { id: 'MON-001', domain: 'monitoring', title: 'Health/readiness/liveness/heartbeat checks exist where applicable', severity: 'medium', automated: 0 },
  { id: 'MON-002', domain: 'monitoring', title: 'Alerting/monitoring ownership and thresholds documented or explicit gap recorded', severity: 'low', automated: 0 },

  // ─── 17. COMPLIANCE & PRIVACY ─────────────────────────────────────────────
  { id: 'CPR-001', domain: 'compliance_privacy', title: 'Data classes handled by repo are identified', severity: 'medium', automated: 0 },
  { id: 'CPR-002', domain: 'compliance_privacy', title: 'Encryption requirements in transit/at rest are satisfied or gap recorded', severity: 'high', automated: 0 },
  { id: 'CPR-003', domain: 'compliance_privacy', title: 'Retention/deletion/privacy obligations documented where applicable', severity: 'medium', automated: 0 },
  { id: 'CPR-004', domain: 'compliance_privacy', title: 'Audit logging/access control for compliance-relevant actions exists or gap recorded', severity: 'medium', automated: 0 },

  // ─── 18. SUPPLY CHAIN ─────────────────────────────────────────────────────
  { id: 'SUP-001', domain: 'supply_chain', title: 'SBOM generated or explicit gap recorded', severity: 'low', automated: 1, tool_hint: 'syft/cyclonedx' },
  { id: 'SUP-002', domain: 'supply_chain', title: 'Provenance/pinning for dependencies and artifacts verified', severity: 'medium', automated: 1, tool_hint: 'filesystem' },
  { id: 'SUP-003', domain: 'supply_chain', title: 'Release artifacts/images/packages are signed or explicit gap recorded', severity: 'low', automated: 0 },
  { id: 'SUP-004', domain: 'supply_chain', title: 'Build/release flow resists tampering and uses trusted sources', severity: 'medium', automated: 0 },

  // ─── 19. INTEGRATIONS ─────────────────────────────────────────────────────
  { id: 'INT-001', domain: 'integrations', title: 'Third-party services and scopes inventoried', severity: 'medium', automated: 0 },
  { id: 'INT-002', domain: 'integrations', title: 'External credentials/OAuth/webhook permissions use least privilege', severity: 'high', automated: 0 },
  { id: 'INT-003', domain: 'integrations', title: 'Webhook signatures, callback validation, and idempotency enforced where applicable', severity: 'high', automated: 0 },
];

/**
 * Seed the audit_controls table with the canonical catalog.
 */
export function seedControls(db: DatabaseType): number {
  const ins = db.prepare(`
    INSERT OR REPLACE INTO audit_controls
      (id, domain, title, description, severity, applicable_to, automated, tool_hint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const c of CONTROLS) {
      ins.run(
        c.id, c.domain, c.title, c.description || null, c.severity,
        c.applicable_to ? JSON.stringify(c.applicable_to) : null,
        c.automated, c.tool_hint || null
      );
    }
  });

  tx();
  return CONTROLS.length;
}

/**
 * Get controls applicable to a given app shape.
 */
export function getApplicableControls(db: DatabaseType, appShape: string): Record<string, any>[] {
  const all = db.prepare('SELECT * FROM audit_controls ORDER BY id').all() as Record<string, any>[];
  return all.filter(c => {
    if (!c.applicable_to) return true;
    const shapes = JSON.parse(c.applicable_to);
    return shapes.includes(appShape);
  });
}
