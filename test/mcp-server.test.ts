/**
 * MCP server: isolation + import-safety + end-to-end JSON-RPC behavior.
 *
 * ts-A-001 / ts-A-002: the prior version of these tests set RK_DB_PATH in the
 * child env believing it isolated the server onto a temp DB. The server never
 * read that env var, so it always opened the REAL data/knowledge.db and
 * WAL-pragma'd it — the "fresh empty DB" comment was false and the stderr
 * assertion was gated behind an `if` that was never true. These tests now
 * isolate the same way cli-publish.test.ts does: spawn with cwd:tmpDir and an
 * isolated rk.config.json whose dbPath points at a temp DB. (server.ts also now
 * honors RK_DB_PATH as an explicit override, so both mechanisms work; we set
 * both and assert the server actually opened the temp DB.)
 *
 * ts-A-004: the prior file had zero behavioral coverage of the MCP handlers —
 * only an import smoke test, a SIGTERM spawn, and `node --check`. We now drive
 * the server end-to-end over stdio (newline-delimited JSON-RPC) and assert
 * get_repo / find_repos / search_repos / add_relationship (enum enforcement).
 *
 * The server module runs main() at module-load and speaks JSON-RPC over stdio,
 * so we always drive it via a child process — never import it directly (that
 * would hang the vitest worker).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertNote,
} from '../src/db/init.js';
import { seedControls } from '../src/audit/controls.js';
import { importAuditInline } from '../src/audit/import.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MCP = join(ROOT, 'dist', 'mcp', 'server.js');

let tmpDir: string;
let dbPath: string;
let configPath: string;

/** Build a single newline-delimited JSON-RPC line. */
function rpc(obj: Record<string, unknown>): string {
  return JSON.stringify(obj) + '\n';
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: number | string;
  result?: { content?: { type: string; text: string }[]; [k: string]: unknown };
  error?: { code: number; message: string };
}

interface ExchangeResult {
  status: number | null;
  stderr: string;
  responses: Map<number, JsonRpcResponse>;
}

/**
 * Spawn the MCP server against the isolated temp DB, send the initialize
 * handshake plus the supplied tools/call requests as newline-delimited
 * JSON-RPC on stdin, then collect and parse the responses. Synchronous via
 * spawnSync: the server reads stdin to EOF, flushes its responses, and exits
 * cleanly when the event loop drains.
 */
function exchange(
  calls: { id: number; name: string; args: Record<string, unknown> }[],
  env: Record<string, string> = {},
): ExchangeResult {
  const lines: string[] = [];
  lines.push(rpc({
    jsonrpc: '2.0', id: 0, method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'rk-test', version: '0.0.0' },
    },
  }));
  lines.push(rpc({ jsonrpc: '2.0', method: 'notifications/initialized' }));
  for (const c of calls) {
    lines.push(rpc({
      jsonrpc: '2.0', id: c.id, method: 'tools/call',
      params: { name: c.name, arguments: c.args },
    }));
  }

  const res = spawnSync('node', [MCP], {
    encoding: 'utf-8',
    timeout: 20000,
    cwd: tmpDir,
    input: lines.join(''),
    env: { ...process.env, ...env, NO_COLOR: '1' },
  });

  const responses = new Map<number, JsonRpcResponse>();
  for (const raw of (res.stdout || '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    try {
      const msg = JSON.parse(line) as JsonRpcResponse;
      if (typeof msg.id === 'number') responses.set(msg.id, msg);
    } catch { /* non-JSON log noise on stdout — ignore */ }
  }

  return { status: res.status, stderr: res.stderr || '', responses };
}

/** Pull the parsed JSON object out of a tool's text content block. */
function toolJson(resp: JsonRpcResponse | undefined): Record<string, unknown> {
  expect(resp).toBeDefined();
  expect(resp!.error).toBeUndefined();
  const text = resp!.result?.content?.[0]?.text;
  expect(typeof text).toBe('string');
  return JSON.parse(text as string) as Record<string, unknown>;
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(ROOT, '.tmp-mcp-'));
  dbPath = join(tmpDir, 'knowledge.db');
  configPath = join(tmpDir, 'rk.config.json');
  writeFileSync(
    configPath,
    JSON.stringify({ dbPath, owners: [], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') }, null, 2),
    'utf-8',
  );
});

afterEach(() => {
  try { closeDb(); } catch { /* idempotent */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('MCP server isolation (ts-A-001)', () => {
  if (!existsSync(MCP)) {
    it.skip('dist/mcp/server.js not built — skip MCP isolation tests', () => {});
    return;
  }

  it('opens the isolated temp DB (cwd + rk.config.json), not the repo DB', () => {
    // Seed a repo that only exists in the temp DB. A marker unlikely to ever
    // appear in the real data/knowledge.db.
    const marker = 'iso-' + Math.random().toString(36).slice(2, 10);
    openDb(dbPath);
    upsertRepo({ owner: 'isolated', name: marker, description: 'temp-db-only repo' });
    closeDb();

    const { responses, status } = exchange([
      { id: 1, name: 'get_repo', args: { slug: `isolated/${marker}` } },
    ]);

    // The server must still be healthy (it exits 0 after stdin EOF).
    expect(status === 0 || status === null).toBe(true);

    const text = responses.get(1)?.result?.content?.[0]?.text ?? '';
    // If the server opened the TEMP db, it finds the seeded repo. If it opened
    // the real repo DB (the bug), the unique slug is absent and it returns the
    // notFound guidance message instead.
    expect(text).toContain(`isolated/${marker}`);
    expect(text).not.toMatch(/not found/i);
  });
});

describe('MCP server reports config errors on stderr, not as a silent crash (ts-A-002)', () => {
  if (!existsSync(MCP)) {
    it.skip('dist/mcp/server.js not built — skip', () => {});
    return;
  }

  it('exits non-zero AND writes to stderr when pointed at an unopenable DB path', () => {
    // openDb(config.dbPath) runs at module top-level in server.ts, so a DB
    // path that better-sqlite3 cannot open throws out of module evaluation —
    // node prints the error on stderr and exits non-zero. We force a genuinely
    // unopenable path: a file inside a directory that does not exist.
    const badPath = join(tmpDir, 'no', 'such', 'dir', 'x.db');
    // Point the isolated config at the bad path AND set RK_DB_PATH (the
    // explicit override) so isolation is real regardless of which the server
    // consults first.
    writeFileSync(
      configPath,
      JSON.stringify({ dbPath: badPath, owners: [], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') }, null, 2),
      'utf-8',
    );

    const res = spawnSync('node', [MCP], {
      encoding: 'utf-8',
      timeout: 20000,
      cwd: tmpDir,
      input: '',
      env: { ...process.env, RK_DB_PATH: badPath, NO_COLOR: '1' },
    });

    // Deterministic — no never-true guard. The bad path MUST surface as a
    // non-zero exit with a non-empty stderr (no silent crash).
    expect(res.status).not.toBe(0);
    expect(res.stderr).not.toBe('');
    expect(res.stderr).toMatch(/Error|unable to open|openDb|database/i);
  });
});

describe('MCP server end-to-end JSON-RPC behavior (ts-A-004)', () => {
  if (!existsSync(MCP)) {
    it.skip('dist/mcp/server.js not built — skip', () => {});
    return;
  }

  // Seed a small corpus into the isolated temp DB before each behavioral test.
  beforeEach(() => {
    openDb(dbPath);
    const a = upsertRepo({
      owner: 'acme', name: 'alpha',
      description: 'alpha service with quokka-token in the blurb',
      status: 'active', category: 'tool',
    }) as number;
    upsertRepo({
      owner: 'acme', name: 'beta',
      description: 'beta library',
      status: 'paused', category: 'library',
    });
    upsertNote(a, 'thesis', 'thesis', 'alpha holds the quokka-token concept');
    closeDb();
  });

  it('get_repo returns the seeded repo dump', () => {
    const { responses } = exchange([
      { id: 1, name: 'get_repo', args: { slug: 'acme/alpha' } },
    ]);
    const repo = toolJson(responses.get(1));
    expect(repo.slug).toBe('acme/alpha');
    // mcp-A-005: host paths are tucked under host_local, not spread at top.
    expect(repo).not.toHaveProperty('local_path');
  });

  it('find_repos filters by status', () => {
    const { responses } = exchange([
      { id: 1, name: 'find_repos', args: { status: 'paused' } },
    ]);
    const out = toolJson(responses.get(1)) as { count: number; repos: { slug: string }[] };
    expect(out.count).toBe(1);
    expect(out.repos[0].slug).toBe('acme/beta');
  });

  it('search_repos finds content across docs/notes/descriptions', () => {
    const { responses } = exchange([
      { id: 1, name: 'search_repos', args: { query: 'quokka-token' } },
    ]);
    const out = toolJson(responses.get(1)) as { count: number; results: { slug: string }[] };
    expect(out.count).toBeGreaterThan(0);
    expect(out.results.some(r => r.slug === 'acme/alpha')).toBe(true);
  });

  it('add_relationship enforces the relation_type enum (invalid value rejected)', () => {
    const { responses } = exchange([
      // Valid relation first — proves the happy path works.
      { id: 1, name: 'add_relationship', args: { from_slug: 'acme/alpha', relation_type: 'depends_on', to_slug: 'acme/beta' } },
      // Invalid enum value — the Zod enum must reject this with a JSON-RPC error.
      { id: 2, name: 'add_relationship', args: { from_slug: 'acme/alpha', relation_type: 'totally_made_up', to_slug: 'acme/beta' } },
    ]);

    // Happy path: structured success text, no error.
    const ok = responses.get(1);
    expect(ok?.error).toBeUndefined();
    expect(ok?.result?.content?.[0]?.text ?? '').toMatch(/Relationship added/i);

    // Enum enforcement: the SDK validates the z.enum BEFORE the handler runs
    // and returns the rejection as a graceful tool result (isError: true) with
    // the validation message in the content text — NOT a server crash and NOT
    // a top-level JSON-RPC error. Pins SHIP_GATE B (never crash on bad input).
    const bad = responses.get(2);
    expect(bad).toBeDefined();
    expect(bad?.result?.isError).toBe(true);
    expect(bad?.result?.content?.[0]?.text ?? '').toMatch(/Invalid|validation|relation_type/i);
  });

  it('add_repo_note refuses an ambiguous partial slug and mutates neither repo (resolveId ambiguity)', () => {
    // Two overlapping-prefix repos: a fragment that matches both must NOT
    // silently resolve to an arbitrary one (the MCP resolveId sibling of
    // cli-A-001). Seed them into the same isolated temp DB.
    openDb(dbPath);
    upsertRepo({ owner: 'acme', name: 'widget' });
    upsertRepo({ owner: 'acme', name: 'widget-pro' });
    closeDb();

    const { responses } = exchange([
      { id: 1, name: 'add_repo_note', args: { slug: 'widget', note_type: 'thesis', content: 'must not land anywhere' } },
    ]);

    const resp = responses.get(1);
    expect(resp).toBeDefined();
    // The mutating tool surfaces the candidates instead of picking row 0.
    expect(resp?.result?.content?.[0]?.text ?? '').toMatch(/ambiguous/i);
    expect(resp?.result?.content?.[0]?.text ?? '').toMatch(/widget-pro/);

    // Provenance integrity: NEITHER widget repo was mutated (the beforeEach
    // seeds an unrelated note on acme/alpha, so scope the check to the
    // ambiguous targets).
    openDb(dbPath);
    const widgetNotes = (getDb().prepare(
      "SELECT COUNT(*) AS c FROM repo_notes n JOIN repos r ON r.id = n.repo_id WHERE r.slug LIKE 'acme/widget%'"
    ).get() as { c: number }).c;
    closeDb();
    expect(widgetNotes).toBe(0);
  });

  it('add_repo_note on a UNIQUE partial slug echoes the canonical slug, not the fragment', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'acme', name: 'uniquely-named-thing' });
    closeDb();

    const { responses } = exchange([
      { id: 1, name: 'add_repo_note', args: { slug: 'uniquely-named', note_type: 'thesis', content: 'lands on the canonical repo' } },
    ]);
    const text = responses.get(1)?.result?.content?.[0]?.text ?? '';
    // Echoes the resolved canonical slug (provenance-on-display), not 'uniquely-named'.
    expect(text).toMatch(/Note added to acme\/uniquely-named-thing/);
  });

  // mcp-PH-002: every tool call must leave a server-side breadcrumb on STDERR
  // (the SDK only returns a throwing handler's error to the client, so an
  // operator otherwise has zero signal). The handler-boundary wrapper logs
  // `[mcp] tool=<name> args=...` on entry. STDERR is safe on the stdio server.
  it('logs the tool name on stderr at the handler boundary (mcp-PH-002)', () => {
    const { stderr } = exchange([
      { id: 1, name: 'get_repo', args: { slug: 'acme/alpha' } },
    ]);
    // The breadcrumb names the tool. Must be on stderr (stdout is the JSON-RPC
    // frame channel) — the exchange helper parses stdout as JSON-RPC, so a log
    // line there would have been ignored, not captured here.
    expect(stderr).toMatch(/\[mcp\] tool=get_repo/);
  });

  // mcp-PH-003: a sync surfaces partial-failure signals, not just stats. The
  // response must carry github_errors / local_errors counts and the vanished
  // list so a PARTIAL sync doesn't look clean to the calling LLM. With empty
  // owners + a temp dir the sync is a no-op but still returns the full shape.
  it('sync_repos response includes partial-sync signals (mcp-PH-003)', () => {
    const { responses } = exchange([
      { id: 1, name: 'sync_repos', args: { owners: '', local_dirs: '.' } },
    ]);
    const out = toolJson(responses.get(1));
    expect(out).toHaveProperty('stats');
    expect(out).toHaveProperty('github_errors');
    expect(out).toHaveProperty('local_errors');
    expect(out).toHaveProperty('vanished');
    expect(Array.isArray(out.vanished)).toBe(true);
    expect(typeof out.github_errors).toBe('number');
    expect(typeof out.local_errors).toBe('number');
  });

  // mcp-PH-005: a negative limit must be rejected by the Zod schema (it would
  // otherwise reach slice(0, negative) / a negative LIMIT). The SDK validates
  // the schema before the handler runs and returns isError:true — never a crash.
  it('search_repos rejects a negative limit (mcp-PH-005)', () => {
    const { responses } = exchange([
      { id: 1, name: 'search_repos', args: { query: 'quokka-token', limit: -5 } },
    ]);
    const bad = responses.get(1);
    expect(bad).toBeDefined();
    expect(bad?.result?.isError).toBe(true);
    expect(bad?.result?.content?.[0]?.text ?? '').toMatch(/Invalid|validation|limit|greater than or equal/i);
  });
});

// ─── Feature-pass Wave 1: MCP completeness tools ─────────────────────────────
// MCP-001 (health_*), MCP-002 (db_fsck / repo_diff / ops_runs), MCP-004
// (archive_repo / delete_repo), MCP-005 (repo_versions), MCP-006
// (suggest_dogfood / audit_failing). Drives the same exchange() JSON-RPC harness.

/**
 * tools/list helper: send the initialize handshake then a tools/list request
 * and return the registered tool names. Reuses the same spawn shape as
 * exchange() but speaks the list method rather than tools/call.
 */
function listTools(): { names: string[]; status: number | null } {
  const lines: string[] = [];
  lines.push(rpc({
    jsonrpc: '2.0', id: 0, method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'rk-test', version: '0.0.0' },
    },
  }));
  lines.push(rpc({ jsonrpc: '2.0', method: 'notifications/initialized' }));
  lines.push(rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }));

  const res = spawnSync('node', [MCP], {
    encoding: 'utf-8',
    timeout: 20000,
    cwd: tmpDir,
    input: lines.join(''),
    env: { ...process.env, NO_COLOR: '1' },
  });

  const names: string[] = [];
  for (const raw of (res.stdout || '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    try {
      const msg = JSON.parse(line) as JsonRpcResponse;
      if (msg.id === 1) {
        const tools = (msg.result?.tools ?? []) as { name: string }[];
        for (const t of tools) names.push(t.name);
      }
    } catch { /* non-JSON log noise — ignore */ }
  }
  return { names, status: res.status };
}

describe('MCP completeness tools — registration (MCP-001/002/004/005/006)', () => {
  if (!existsSync(MCP)) {
    it.skip('dist/mcp/server.js not built — skip', () => {});
    return;
  }

  it('registers every new tool in tools/list', () => {
    const { names } = listTools();
    const expected = [
      // MCP-001
      'health_feed', 'health_doctor', 'health_portfolio',
      // MCP-002
      'db_fsck', 'repo_diff', 'ops_runs',
      // MCP-004
      'archive_repo', 'delete_repo',
      // MCP-005
      'repo_versions',
      // MCP-006
      'suggest_dogfood', 'audit_failing',
    ];
    for (const name of expected) {
      expect(names, `tool "${name}" should be registered`).toContain(name);
    }
  });
});

describe('MCP completeness tools — behavior', () => {
  if (!existsSync(MCP)) {
    it.skip('dist/mcp/server.js not built — skip', () => {});
    return;
  }

  // Seed a corpus into the isolated temp DB before each behavioral test.
  beforeEach(() => {
    openDb(dbPath);
    upsertRepo({
      owner: 'acme', name: 'alpha',
      description: 'alpha service', status: 'active', category: 'tool',
    });
    upsertRepo({
      owner: 'acme', name: 'beta',
      description: 'beta library', status: 'active', category: 'library',
    });
    closeDb();
  });

  // ── MCP-001: health_doctor over a real repo ──
  it('health_doctor returns a structured single-repo report for the canonical slug', () => {
    const { responses } = exchange([
      { id: 1, name: 'health_doctor', args: { slug: 'acme/alpha' } },
    ]);
    const out = toolJson(responses.get(1));
    expect(out.slug).toBe('acme/alpha');
    // The doctor report shape: ci / toolchain / dep_audit / workflow_* sections.
    expect(out).toHaveProperty('ci');
    expect(out).toHaveProperty('dep_audit');
    expect(out).toHaveProperty('workflow_actions');
  });

  it('health_doctor on an unknown slug returns the not-found guidance', () => {
    const { responses } = exchange([
      { id: 1, name: 'health_doctor', args: { slug: 'no-such-repo-xyz' } },
    ]);
    const text = responses.get(1)?.result?.content?.[0]?.text ?? '';
    expect(text).toMatch(/not found/i);
  });

  // ── MCP-002: db_fsck writes a db_health_runs row and returns the report ──
  it('db_fsck runs the integrity checks, returns run_id, and persists a db_health_runs row', () => {
    const { responses } = exchange([
      { id: 1, name: 'db_fsck', args: {} },
    ]);
    const out = toolJson(responses.get(1));
    expect(out).toHaveProperty('checks');
    expect(out).toHaveProperty('exit_code');
    expect(typeof out.run_id).toBe('number');
    expect(out.run_id as number).toBeGreaterThan(0);

    // Named side effect: a db_health_runs row was written by the handler.
    openDb(dbPath);
    const count = (getDb().prepare('SELECT COUNT(*) AS c FROM db_health_runs').get() as { c: number }).c;
    closeDb();
    expect(count).toBeGreaterThan(0);
  });

  // ── MCP-004: archive_repo archives + echoes canonical slug + records reason ──
  it('archive_repo flips lifecycle_status, echoes the canonical slug, and records the reason note', () => {
    const { responses } = exchange([
      // Partial fragment "alpha" resolves uniquely to acme/alpha.
      { id: 1, name: 'archive_repo', args: { slug: 'alpha', reason: 'superseded by beta' } },
    ]);
    const text = responses.get(1)?.result?.content?.[0]?.text ?? '';
    // Echoes the canonical slug, not the fragment.
    expect(text).toMatch(/Archived: acme\/alpha/);

    openDb(dbPath);
    const row = getDb().prepare(
      'SELECT lifecycle_status, deprecated_at FROM repos WHERE slug = ?'
    ).get('acme/alpha') as { lifecycle_status: string | null; deprecated_at: string | null };
    // The reason is persisted as a warning note (archiveRepoBySlug ignores it).
    const noteCount = (getDb().prepare(
      "SELECT COUNT(*) AS c FROM repo_notes n JOIN repos r ON r.id = n.repo_id " +
      "WHERE r.slug = 'acme/alpha' AND n.note_type = 'warning'"
    ).get() as { c: number }).c;
    closeDb();
    expect(row.lifecycle_status).toBe('archived');
    expect(row.deprecated_at).not.toBeNull();
    expect(noteCount).toBeGreaterThan(0);
  });

  it('delete_repo refuses without confirm=true and does NOT delete', () => {
    const { responses } = exchange([
      { id: 1, name: 'delete_repo', args: { slug: 'acme/beta', confirm: false } },
    ]);
    const text = responses.get(1)?.result?.content?.[0]?.text ?? '';
    expect(text).toMatch(/Refused|confirm/i);

    openDb(dbPath);
    const stillThere = getDb().prepare('SELECT 1 FROM repos WHERE slug = ?').get('acme/beta');
    closeDb();
    expect(stillThere).toBeDefined();
  });

  it('delete_repo with confirm=true deletes and echoes canonical slug + cascaded_rows', () => {
    const { responses } = exchange([
      { id: 1, name: 'delete_repo', args: { slug: 'acme/beta', confirm: true } },
    ]);
    const out = toolJson(responses.get(1)) as { deleted: boolean; slug: string; cascaded_rows: number };
    expect(out.deleted).toBe(true);
    expect(out.slug).toBe('acme/beta');
    expect(typeof out.cascaded_rows).toBe('number');

    openDb(dbPath);
    const gone = getDb().prepare('SELECT 1 FROM repos WHERE slug = ?').get('acme/beta');
    closeDb();
    expect(gone).toBeUndefined();
  });

  // ── MCP-005: repo_versions read (no network refresh) ──
  it('repo_versions returns recorded published versions for the canonical slug, filtered by channel', () => {
    // Seed two published-version rows on different channels.
    openDb(dbPath);
    const repoId = getDb().prepare('SELECT id FROM repos WHERE slug = ?').get('acme/alpha') as { id: number };
    const insert = getDb().prepare(`
      INSERT INTO repo_published_versions (repo_id, channel, version, published_at, synced_at, source)
      VALUES (?, ?, ?, ?, datetime('now'), 'test')
    `);
    insert.run(repoId.id, 'npm', '1.2.3', '2026-06-01');
    insert.run(repoId.id, 'pypi', '0.9.0', '2026-05-01');
    closeDb();

    const { responses } = exchange([
      { id: 1, name: 'repo_versions', args: { slug: 'acme/alpha' } },
      { id: 2, name: 'repo_versions', args: { slug: 'acme/alpha', channel: 'npm' } },
    ]);

    const all = toolJson(responses.get(1)) as { slug: string; count: number; versions: { channel: string }[] };
    expect(all.slug).toBe('acme/alpha');
    expect(all.count).toBe(2);

    const npmOnly = toolJson(responses.get(2)) as { channel: string; count: number; versions: { channel: string }[] };
    expect(npmOnly.channel).toBe('npm');
    expect(npmOnly.count).toBe(1);
    expect(npmOnly.versions.every(v => v.channel === 'npm')).toBe(true);
  });

  // ── MCP-006: audit_failing over a seeded failing control ──
  it('audit_failing lists repos with failing controls in the given domain', () => {
    // Seed the canonical control catalog + an audit run with a FAILING secrets
    // control on acme/alpha, so the domain_failing query has a row to return.
    openDb(dbPath);
    seedControls(getDb());
    importAuditInline({
      run: {
        slug: 'acme/alpha',
        overall_status: 'fail',
        overall_posture: 'critical',
        summary: 'seeded failing audit',
      },
      controls: [
        { control_id: 'SCR-002', result: 'fail', notes: 'token found' },
      ],
      findings: [
        { domain: 'secrets', title: 'Live token', severity: 'critical', status: 'open' },
      ],
    });
    closeDb();

    const { responses } = exchange([
      { id: 1, name: 'audit_failing', args: { domain: 'secrets' } },
    ]);
    const out = toolJson(responses.get(1)) as { domain: string; count: number; failing: { slug: string }[] };
    expect(out.domain).toBe('secrets');
    expect(out.count).toBeGreaterThan(0);
    expect(out.failing.some(f => f.slug === 'acme/alpha')).toBe(true);
  });

  it('audit_failing rejects an out-of-enum domain (Zod enum enforcement)', () => {
    const { responses } = exchange([
      { id: 1, name: 'audit_failing', args: { domain: 'totally_made_up_domain' } },
    ]);
    const bad = responses.get(1);
    expect(bad?.result?.isError).toBe(true);
    expect(bad?.result?.content?.[0]?.text ?? '').toMatch(/Invalid|validation|domain/i);
  });

  // ── MCP-006: suggest_dogfood mutual-exclusion guard ──
  it('suggest_dogfood rejects both repo and surface set, and rejects neither set', () => {
    const { responses } = exchange([
      { id: 1, name: 'suggest_dogfood', args: { repo: 'acme/alpha', surface: 'cli' } },
      { id: 2, name: 'suggest_dogfood', args: {} },
    ]);
    expect(responses.get(1)?.result?.content?.[0]?.text ?? '').toMatch(/only one of repo or surface/i);
    expect(responses.get(2)?.result?.content?.[0]?.text ?? '').toMatch(/specify repo .* or surface/i);
  });

  it('suggest_dogfood with only surface set returns a structured result (happy path)', () => {
    const out = toolJson((exchange([{ id: 1, name: 'suggest_dogfood', args: { surface: 'cli' } }]).responses).get(1));
    // Empty suggestions are fine on a corpus with no dogfood facts — the
    // contract is a parseable structured result, not a thrown error.
    expect(out).toBeTypeOf('object');
  });

  // ── MCP-001/002 registration-only tools: behavioral shape assertions ──
  it('health_portfolio returns {count, rows} over the seeded catalog', () => {
    const out = toolJson((exchange([{ id: 1, name: 'health_portfolio', args: {} }]).responses).get(1)) as { count: number; rows: unknown[] };
    expect(typeof out.count).toBe('number');
    expect(Array.isArray(out.rows)).toBe(true);
  });

  it('repo_diff returns a structured diff for a seeded slug', () => {
    const out = toolJson((exchange([{ id: 1, name: 'repo_diff', args: { slug: 'acme/alpha' } }]).responses).get(1));
    expect(out).toBeTypeOf('object');
  });

  it('ops_runs returns a structured runs payload', () => {
    const out = toolJson((exchange([{ id: 1, name: 'ops_runs', args: {} }]).responses).get(1));
    expect(out).toBeTypeOf('object');
  });
});

describe('MCP server module is well-formed (smoke)', () => {
  if (!existsSync(MCP)) {
    it.skip('dist/mcp/server.js not built — skip', () => {});
    return;
  }

  it('node --check parses the module without executing it', () => {
    // Catches syntax / import-resolution failures without booting the server.
    const res = spawnSync('node', ['--check', MCP], {
      encoding: 'utf-8',
      timeout: 5000,
    });
    expect(res.status).toBe(0);
    expect(res.stderr).toBe('');
  });
});
