/**
 * F-TS-FT3.5 (sync workers): exercises src/sync/build-health.ts with
 * mocked child_process so test runs don't depend on network or local
 * tool availability.
 *
 * Strategy: vi.mock 'child_process' so execFileSync calls return
 * canned bytes. Each test sets a mock implementation that matches the
 * function under test's argv shape (npm audit, gh run list, gh api,
 * node --version, etc.).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    execFileSync: vi.fn(),
  };
});

import { execFileSync } from 'child_process';
import {
  syncNpmAudit,
  scanWorkflowActions,
  syncCiStatus,
  scanWorkflowPermissions,
  observeToolchain,
} from '../src/sync/build-health.js';

const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;

let tmpDir: string;
let stderrSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-sync-bh-'));
  mockExecFileSync.mockReset();
  stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  stderrSpy.mockRestore();
});

// ─── syncNpmAudit ────────────────────────────────────────────────────────

describe('syncNpmAudit (per Pu 2026 NDSS / Latendresse 2022)', () => {
  it('captures CVE IDs from npm audit --json output', () => {
    // npm audit json — minimal shape with vulnerabilities map + metadata.
    const auditJson = JSON.stringify({
      vulnerabilities: {
        'some-pkg': {
          name: 'some-pkg',
          severity: 'critical',
          via: [
            { source: 12345, name: 'GHSA-aaaa-bbbb-cccc', url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc' },
            { source: 12346, name: 'CVE-2025-30066', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-30066' },
          ],
        },
        'other-pkg': {
          name: 'other-pkg',
          severity: 'high',
          via: [
            { source: 1, name: 'GHSA-dddd-eeee-ffff' },
          ],
        },
      },
      metadata: {
        vulnerabilities: { critical: 1, high: 1, moderate: 0, low: 0, info: 0, total: 2 },
      },
    });
    // npm exits 1 with findings; emulate by throwing with .stdout populated.
    mockExecFileSync.mockImplementation(() => {
      const err = new Error('npm audit found vulnerabilities') as Error & { stdout?: string };
      err.stdout = auditJson;
      throw err;
    });
    // Need a real local_path that exists with a package.json.
    writeFileSync(join(tmpDir, 'package.json'), '{"name":"x"}');
    const result = syncNpmAudit(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.critical).toBe(1);
    expect(result!.high).toBe(1);
    // CVE takes priority over GHSA when both present
    expect(result!.critical_cve_ids).toContain('CVE-2025-30066');
    expect(result!.high_cve_ids).toContain('GHSA-DDDD-EEEE-FFFF');
    expect(result!.audit_omit_dev).toBe(false);
  });

  it('threads opts.omitDev through to --omit=dev flag', () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({
      vulnerabilities: {},
      metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 } },
    }));
    writeFileSync(join(tmpDir, 'package.json'), '{"name":"x"}');
    syncNpmAudit(tmpDir, { omitDev: true });
    const firstCall = mockExecFileSync.mock.calls[0];
    expect(firstCall[0]).toBe('npm');
    expect(firstCall[1]).toEqual(['audit', '--json', '--omit=dev']);
  });

  it('returns null when local_path has no package.json', () => {
    // tmpDir has no package.json
    const result = syncNpmAudit(tmpDir);
    expect(result).toBeNull();
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('returns null on malformed JSON (network-graceful)', () => {
    writeFileSync(join(tmpDir, 'package.json'), '{"name":"x"}');
    mockExecFileSync.mockReturnValue('not-json');
    const result = syncNpmAudit(tmpDir);
    expect(result).toBeNull();
  });
});

// ─── scanWorkflowActions ─────────────────────────────────────────────────

describe('scanWorkflowActions (per CISA Mar 2025 / OpenSSF 2024)', () => {
  function seedWorkflow(content: string, filename = 'ci.yml'): void {
    const dir = join(tmpDir, '.github', 'workflows');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), content);
  }

  it('classifies pin_quality across the 5 tiers', () => {
    seedWorkflow([
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8',
      '      - uses: actions/setup-node@v4.2.0',
      '      - uses: actions/upload-artifact@v5',
      '      - uses: some/action@main',
    ].join('\n'));

    const refs = scanWorkflowActions(tmpDir);
    expect(refs.length).toBe(4);
    const byRef = Object.fromEntries(refs.map(r => [r.action_ref, r]));
    expect(byRef['actions/checkout'].pin_quality).toBe('sha');
    expect(byRef['actions/checkout'].resolved_sha).toBe('b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8');
    expect(byRef['actions/setup-node'].pin_quality).toBe('mutable-semver');
    expect(byRef['actions/upload-artifact'].pin_quality).toBe('major');
    expect(byRef['some/action'].pin_quality).toBe('branch');
  });

  it('skips local actions (./.github/...) and bare refs', () => {
    seedWorkflow([
      'jobs:',
      '  test:',
      '    steps:',
      '      - uses: ./.github/actions/local@x',
      '      - uses: noscope@main',
    ].join('\n'));
    const refs = scanWorkflowActions(tmpDir);
    expect(refs.length).toBe(0);
  });

  it('returns [] when no .github/workflows directory exists', () => {
    expect(scanWorkflowActions(tmpDir)).toEqual([]);
  });

  it('resolves SHA via gh api when opts.resolveShas is set', () => {
    seedWorkflow([
      'jobs:',
      '  test:',
      '    steps:',
      '      - uses: actions/checkout@v4',
    ].join('\n'));
    // First call: resolveActionSha → returns 40-char SHA. Second call:
    // probeImmutablePublisher → returns "true".
    mockExecFileSync
      .mockReturnValueOnce('abcdef0123456789abcdef0123456789abcdef01\n')
      .mockReturnValueOnce('true\n');
    const refs = scanWorkflowActions(tmpDir, { resolveShas: true });
    expect(refs.length).toBe(1);
    expect(refs[0].resolved_sha).toBe('abcdef0123456789abcdef0123456789abcdef01');
    expect(refs[0].immutable_publisher).toBe(true);
    // verify gh api was invoked
    const ghCall = mockExecFileSync.mock.calls.find(c => c[0] === 'gh');
    expect(ghCall).toBeDefined();
  });
});

// ─── syncCiStatus ────────────────────────────────────────────────────────

describe('syncCiStatus (per Memon 2017 / Rehman 2023 / DORA 2024)', () => {
  it('computes pass_rate + consecutive_failures from last 10 runs', () => {
    const runs = [
      { conclusion: 'failure', startedAt: '2026-05-21T10:00:00Z', url: 'u1' },
      { conclusion: 'failure', startedAt: '2026-05-21T09:00:00Z', url: 'u2' },
      { conclusion: 'success', startedAt: '2026-05-21T08:00:00Z', url: 'u3' },
      { conclusion: 'success', startedAt: '2026-05-21T07:00:00Z', url: 'u4' },
      { conclusion: 'cancelled', startedAt: '2026-05-21T06:00:00Z', url: 'u5' },
      { conclusion: 'success', startedAt: '2026-05-21T05:00:00Z', url: 'u6' },
    ];
    mockExecFileSync.mockReturnValue(JSON.stringify(runs));
    const result = syncCiStatus('o', 'r');
    // 5 decisive (filter out 1 cancelled) → 3 success / 5 = 0.6 pass rate.
    // Per Memon 2017: cancellations are operational, not signal.
    expect(result.pass_rate_last_10).toBeCloseTo(0.6, 2);
    // Most recent 2 consecutive are failures
    expect(result.consecutive_failures).toBe(2);
    // failing because most-recent decisive is failure AND consecutive >= 2
    expect(result.status).toBe('failing');
    expect(result.url).toBe('u1');
  });

  it('returns passing when latest is success', () => {
    const runs = [
      { conclusion: 'success', startedAt: '2026-05-21T10:00:00Z', url: 'u1' },
      { conclusion: 'success', startedAt: '2026-05-21T09:00:00Z', url: 'u2' },
    ];
    mockExecFileSync.mockReturnValue(JSON.stringify(runs));
    const result = syncCiStatus('o', 'r');
    expect(result.status).toBe('passing');
    expect(result.consecutive_failures).toBe(0);
  });

  it('returns unknown for single red (per Memon 2017: 84% flake)', () => {
    // Only one decisive failure → don't escalate, this is flake territory.
    const runs = [
      { conclusion: 'failure', startedAt: '2026-05-21T10:00:00Z', url: 'u1' },
      { conclusion: 'success', startedAt: '2026-05-21T09:00:00Z', url: 'u2' },
    ];
    mockExecFileSync.mockReturnValue(JSON.stringify(runs));
    const result = syncCiStatus('o', 'r');
    expect(result.status).toBe('unknown');
    expect(result.consecutive_failures).toBe(1);
  });

  it('returns no_workflow when run list is empty', () => {
    mockExecFileSync.mockReturnValue('[]');
    const result = syncCiStatus('o', 'r');
    expect(result.status).toBe('no_workflow');
  });

  it('returns unknown on gh failure', () => {
    mockExecFileSync.mockImplementation(() => {
      throw new Error('gh command not found');
    });
    const result = syncCiStatus('o', 'r');
    expect(result.status).toBe('unknown');
  });

  it('uses --limit 10 to bound the run list (per the kickoff spec)', () => {
    mockExecFileSync.mockReturnValue('[]');
    syncCiStatus('o', 'r');
    const args = mockExecFileSync.mock.calls[0][1];
    const limitIdx = args.indexOf('--limit');
    expect(limitIdx).toBeGreaterThan(-1);
    expect(args[limitIdx + 1]).toBe('10');
  });
});

// ─── scanWorkflowPermissions ─────────────────────────────────────────────

describe('scanWorkflowPermissions (per Beyer 2016 SRE Workbook)', () => {
  function seedWorkflow(content: string, filename = 'ci.yml'): void {
    const dir = join(tmpDir, '.github', 'workflows');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), content);
  }

  it('reports "default" when no permissions block at workflow root', () => {
    seedWorkflow([
      'name: CI',
      'on: push',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
    ].join('\n'));
    const result = scanWorkflowPermissions(tmpDir);
    expect(result.length).toBe(1);
    expect(result[0].permissions_json).toBe('default');
  });

  it('captures inline permissions: read-all as JSON', () => {
    seedWorkflow([
      'name: CI',
      'on: push',
      'permissions: read-all',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
    ].join('\n'));
    const result = scanWorkflowPermissions(tmpDir);
    expect(result.length).toBe(1);
    expect(JSON.parse(result[0].permissions_json)).toBe('read-all');
  });

  it('captures block-form permissions with specific scopes', () => {
    seedWorkflow([
      'name: Release',
      'permissions:',
      '  contents: read',
      '  id-token: write',
      'jobs:',
      '  publish:',
      '    runs-on: ubuntu-latest',
    ].join('\n'));
    const result = scanWorkflowPermissions(tmpDir);
    expect(result.length).toBe(1);
    expect(JSON.parse(result[0].permissions_json)).toEqual({
      contents: 'read',
      'id-token': 'write',
    });
  });
});

// ─── observeToolchain ────────────────────────────────────────────────────

describe('observeToolchain (per JetBrains 2025)', () => {
  it('captures node --version and rustc --version output', () => {
    mockExecFileSync.mockImplementation((cmd: string, _args: string[]) => {
      if (cmd === 'node') return 'v22.4.0\n';
      if (cmd === 'rustc') return 'rustc 1.78.0 (a1b2c3d 2026-01-01)\n';
      // tsc + python missing
      throw new Error(`${cmd} not found`);
    });
    const observations = observeToolchain(tmpDir, 'rig-A');
    const byTool = Object.fromEntries(observations.map(o => [o.tool, o.observed_version]));
    expect(byTool.node).toBe('22.4.0');
    expect(byTool.rust).toBe('1.78.0');
    // typescript + python skipped silently when missing
    expect(byTool.typescript).toBeUndefined();
  });

  it('returns [] when local_path does not exist', () => {
    expect(observeToolchain('/path/that/does/not/exist', 'rig-A')).toEqual([]);
  });
});
