/**
 * Database initialization and access layer.
 */
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Resolve a SQL asset by name across all bundled layouts. import.meta.dirname
// varies by entry point:
//   - dev (tsx / vitest): src/db/      → SQL siblings live here
//   - prod cli bundle:    dist/        → SQL lives at dist/db/<name>
//   - prod mcp bundle:    dist/mcp/    → SQL lives at dist/db/<name> (one up + db/)
//   - any future deeper bundle target: keep probing parent dirs until found.
// We probe sibling → ./db/ → ../db/ → ../../db/ in order, capping depth at 3
// so a missing asset surfaces as a clear error instead of an infinite walk.
function resolveSql(name: string): string {
  const here = import.meta.dirname;
  const probed: string[] = [];
  const candidates = [
    join(here, name),
    join(here, 'db', name),
    join(here, '..', 'db', name),
    join(here, '..', '..', 'db', name),
  ];
  for (const candidate of candidates) {
    probed.push(candidate);
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`SQL asset not found: ${name} (probed: ${probed.join(', ')})`);
}

const SCHEMA_PATH = resolveSql('schema.sql');
const MIGRATION_002 = resolveSql('migration-002-audit.sql');
const MIGRATION_003 = resolveSql('migration-003-metrics-v2.sql');
const MIGRATION_004 = resolveSql('migration-004-findings-idempotent.sql');
const MIGRATION_005 = resolveSql('migration-005-fts-triggers.sql');
const MIGRATION_006 = resolveSql('migration-006-lifecycle-paths.sql');
const MIGRATION_007 = resolveSql('migration-007-publish-state.sql');
const MIGRATION_008 = resolveSql('migration-008-build-health.sql');
const MIGRATION_009 = resolveSql('migration-009-build-health-extensions.sql');
const MIGRATION_010 = resolveSql('migration-010-operational-runs.sql');
const MIGRATION_011 = resolveSql('migration-011-cross-tool-vocab.sql');

let _db: DatabaseType | null = null;
let _dbPath: string | null = null;

/**
 * Current schema head version. A fresh openDb runs the migration ladder
 * (002-011) and ends here. ts-A-008: this is the single source of truth
 * for the head version — the migration test suites import it instead of
 * hard-coding the literal in dozens of assertions, so a future migration
 * that bumps the head updates exactly one place.
 *
 * Keep in lockstep with the highest `schema_version` stamped by the
 * migration ladder below (currently migration-011 → '11').
 */
export const CURRENT_SCHEMA_VERSION = 11;

/**
 * Strip `ALTER TABLE <t> ADD COLUMN <col> ...;` statements whose column
 * already exists, so a partially-applied migration can be re-run without
 * the duplicate-column abort wiping out the rest of the script.
 *
 * SQLite has no native `ADD COLUMN IF NOT EXISTS`. We can't just swallow
 * the duplicate-column error at the exec level because better-sqlite3's
 * `.exec()` STOPS at the first error — the surviving statements (CREATE
 * TABLE, CREATE INDEX, the version bump) would never run. Guarding each
 * ADD COLUMN against PRAGMA table_info presence lets us remove only the
 * no-op ALTERs and keep every other statement intact.
 *
 * The matcher is conservative: it only neutralizes statements of the form
 * `ALTER TABLE <ident> ADD COLUMN <ident> ...` (optionally with the bare
 * `COLUMN` keyword omitted) where the column is already present on the
 * table. Anything it doesn't confidently recognize is left untouched and
 * runs verbatim.
 */
function stripAppliedAddColumns(db: DatabaseType, sql: string): string {
  const columnsOf = (table: string): Set<string> => {
    try {
      const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
      return new Set(rows.map(r => r.name));
    } catch {
      return new Set();
    }
  };
  // Match a full ALTER TABLE ... ADD [COLUMN] <col> ...; statement.
  const addColRe =
    /ALTER\s+TABLE\s+(?:"([^"]+)"|`([^`]+)`|(\w+))\s+ADD\s+(?:COLUMN\s+)?(?:"([^"]+)"|`([^`]+)`|(\w+))[^;]*;/gi;
  return sql.replace(addColRe, (stmt, t1, t2, t3, c1, c2, c3) => {
    const table = (t1 ?? t2 ?? t3) as string;
    const col = (c1 ?? c2 ?? c3) as string;
    if (table && col && columnsOf(table).has(col)) {
      // Column already present — replace with a comment so semicolon
      // accounting and line offsets stay sane.
      return `-- skipped (already applied): ADD COLUMN ${table}.${col};`;
    }
    return stmt;
  });
}

/**
 * Apply a migration script with idempotent ADD COLUMN tolerance.
 *
 * SQLite has no native `ADD COLUMN IF NOT EXISTS`, so re-running a
 * migration that already applied throws "duplicate column name". The
 * script is executed as one `exec` call (not split-by-semicolon) so
 * multi-statement triggers and CHECK constraints with embedded semicolons
 * survive verbatim.
 *
 * ATOMICITY (db-A-003): better-sqlite3's `.exec()` autocommits each
 * statement and STOPS at the first error. The old implementation caught a
 * "duplicate column name" abort and `return`ed early — which ABORTED the
 * rest of the script (the CREATE TABLE / CREATE INDEX / version-bump that
 * make up the bulk of the migration) before they ran. On a partially
 * applied schema (e.g. one ADD COLUMN landed from a prior crash, the rest
 * did not) that produced a permanent no-progress loop: every re-run hit
 * the same duplicate column, swallowed it, and never created the new
 * tables or bumped the version. The old comment claiming the later
 * statements were "independently idempotent" was FALSE — they simply
 * never executed.
 *
 * Fix (two layers):
 *   1. Pre-strip any ADD COLUMN whose column already exists, so a
 *      partial-apply re-run does not abort on a duplicate column.
 *   2. Run the (stripped) script inside a single `db.transaction()` so it
 *      is all-or-nothing — there is no half-applied state in which a new
 *      column exists but the table-creating / version-bumping tail did
 *      not run.
 */
function execMigrationIdempotent(db: DatabaseType, sql: string, label: string): void {
  const guarded = stripAppliedAddColumns(db, sql);
  try {
    const tx = db.transaction(() => db.exec(guarded));
    tx();
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    if (msg.includes('duplicate column name')) {
      // Belt-and-suspenders: stripAppliedAddColumns should have removed
      // every already-present ADD COLUMN, but if a column slipped through
      // (e.g. an ALTER form the matcher didn't recognize), treat it as a
      // fully-applied idempotent re-run. The transaction rolled back, so
      // the on-disk state is unchanged.
      //
      // PH-DB-005: surface the tolerated swallow on STDERR. This branch
      // should be unreachable now that stripAppliedAddColumns pre-strips
      // applied columns — if it fires, the matcher missed an ALTER form and
      // an operator should know rather than have it silently absorbed.
      // Infrastructure diagnostic → stderr (keeps STDOUT clean for MCP/JSON).
      console.error(`migration ${label}: tolerated already-applied column, continuing`);
      return;
    }
    throw new Error(`Migration ${label} failed: ${msg}`, { cause: e });
  }
}

/**
 * Strict migration runner — does NOT swallow "duplicate column name."
 *
 * Used for migrations that DROP+RECREATE a table (e.g. migration-011's
 * CHECK-constraint extension via the SQLite "create new → copy → rename"
 * pattern). The idempotent runner above tolerates partial state by
 * swallowing duplicate-column errors; a recreate-table migration must
 * either fully apply or fully reject — the migration is gated at the
 * call site by a meta marker so it is invoked only when needed.
 *
 * DURABILITY (db-A-001): the DROP→RENAME window in a recreate migration
 * is the most dangerous moment in the whole ladder — a crash there would
 * destroy the source table. better-sqlite3's `.exec()` is
 * autocommit-per-statement, so without a wrapping transaction a failure
 * after DROP but before RENAME would leave the DB with NO
 * repo_relationships table at all. We therefore run the entire body
 * inside `db.transaction()` so it is all-or-nothing: either the recreate
 * fully commits or the original table is rolled back intact.
 *
 * SQLite cannot toggle `PRAGMA foreign_keys` inside a transaction (it
 * silently no-ops there), and the recreate's DROP+RENAME must run with
 * FKs OFF, so we toggle FK enforcement OFF before opening the
 * transaction and restore it ON in a finally block afterwards.
 */
function execMigrationStrict(db: DatabaseType, sql: string, label: string): void {
  // FK toggle MUST be outside the transaction — see the doc comment.
  db.pragma('foreign_keys = OFF');
  try {
    const tx = db.transaction(() => db.exec(sql));
    tx();
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    throw new Error(`Migration ${label} failed: ${msg}`, { cause: e });
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

/**
 * PR-002: auto-snapshot the pre-migration DB before the migration ladder
 * runs.
 *
 * The migration ladder is the highest-blast-radius operation in the whole
 * system — it ALTERs / DROPs+RECREATEs tables in place. If a migration
 * corrupts data (or the process dies mid-recreate on a pre-fix binary), the
 * operator wants a byte-for-byte copy of the DB as it was the instant
 * BEFORE rk touched it. This takes exactly that copy.
 *
 * Snapshot mechanism: SQLite's `VACUUM INTO '<path>'` writes a clean,
 * consistent, fully-checkpointed copy of the live DB to a new file —
 * including data sitting in the WAL — without us having to coordinate file
 * copies around the WAL/SHM sidecars. It is synchronous and runs inside
 * better-sqlite3's single-threaded handle, so the snapshot is taken before
 * any migration statement executes.
 *
 * Destination: `<dir-of-dbPath>/backups/pre-migration-<from>-to-<head>-<ts>.db`.
 * Anchoring the backups dir to the DB file's own directory means the real
 * `data/knowledge.db` snapshots into `data/backups/`, while a test DB in a
 * temp dir snapshots into that temp dir's `backups/` — the real
 * `data/backups` is never touched by tests that point dbPath elsewhere.
 *
 * The ISO timestamp is made filesystem-safe by replacing every `:` (illegal
 * in Windows filenames) and `.` with `-`.
 *
 * Returns the snapshot file path for the caller to log. The decision of
 * WHETHER to snapshot (the three-condition guard) lives at the call site in
 * openDb; this helper unconditionally writes when called.
 */
function snapshotPreMigration(
  db: DatabaseType,
  dbPath: string,
  fromVersion: number
): string {
  const backupsDir = join(dirname(dbPath), 'backups');
  // Create the backups dir first — VACUUM INTO will not create parent dirs.
  mkdirSync(backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotPath = join(
    backupsDir,
    `pre-migration-${fromVersion}-to-${CURRENT_SCHEMA_VERSION}-${stamp}.db`
  );
  // VACUUM INTO takes a single-quoted string literal; the path is
  // machine-generated (no user input) and any single quote in it is
  // escaped by doubling per SQL string-literal rules, defensively.
  db.exec(`VACUUM INTO '${snapshotPath.replace(/'/g, "''")}'`);
  return snapshotPath;
}

/**
 * Open (or create) the knowledge database.
 * Returns a better-sqlite3 instance with WAL mode and foreign keys enabled.
 *
 * If openDb has already been called for a DIFFERENT path, this throws —
 * the singleton invariant exists so callers don't accidentally end up
 * pointing the module at two databases at once (the older code silently
 * returned the first instance and dropped the second path on the floor).
 */
export function openDb(dbPath: string): DatabaseType {
  if (_db) {
    if (_dbPath !== null && _dbPath !== dbPath) {
      throw new Error(
        `openDb already opened with ${_dbPath}; close before reopening as ${dbPath}`
      );
    }
    return _db;
  }

  // PR-002: capture whether the DB FILE already existed BEFORE `new Database`
  // opens (and thereby CREATES) it. A brand-new/fresh DB has no data to
  // protect and must NOT trigger a pre-migration snapshot; only a
  // pre-existing file with real data is worth backing up. This MUST be read
  // before the `new Database()` line below — afterwards the file always
  // exists and the distinction is lost.
  const fileExistedAtEntry = existsSync(dbPath);

  _db = new Database(dbPath);
  _dbPath = dbPath;
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  // PH-DB-003: without an explicit busy_timeout better-sqlite3 installs a
  // 0ms busy handler, so a concurrent writer (rk CLI + the MCP server
  // sharing one DB) throws SQLITE_BUSY *instantly* on a locked WAL. Give
  // SQLite a 5s window to wait-and-retry internally before surfacing the
  // lock to the caller (retry-and-report rather than fail-fast).
  _db.pragma('busy_timeout = 5000');

  // PH-DB-001: forward-compat guard. The migration ladder below only
  // *lower-bound* gates (if version < N). A DB written by a NEWER rk build
  // (schema_version > CURRENT_SCHEMA_VERSION) would otherwise be opened and
  // silently treated as current — running this older code against a schema
  // shape it doesn't understand. Refuse loudly so the operator upgrades rk
  // instead of corrupting a forward-migrated DB. The meta table only exists
  // once schema.sql has been applied, so guard the read on its presence
  // (a brand-new file has no meta row yet and is handled by the fresh-DB
  // path below).
  const hasMeta = _db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='meta'"
  ).get();
  if (hasMeta) {
    const onDisk = (_db.prepare(
      "SELECT value FROM meta WHERE key = 'schema_version'"
    ).get() as { value: string } | undefined)?.value;
    if (onDisk !== undefined && parseInt(onDisk, 10) > CURRENT_SCHEMA_VERSION) {
      // Reset the singleton before throwing so the module is not left in a
      // half-open state — otherwise a retry would hit the `if (_db)`
      // early-return above and silently hand back the newer-schema DB we
      // just refused.
      _db.close();
      _db = null;
      _dbPath = null;
      throw new Error(
        `Database schema_version ${onDisk} is newer than this rk build ` +
        `(head ${CURRENT_SCHEMA_VERSION}). Upgrade rk before opening.`
      );
    }
  }

  // Check if schema exists
  const hasRepos = _db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='repos'"
  ).get();

  if (!hasRepos) {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    _db.exec(schema);
    // PH-DB-002: init/migration progress goes to STDERR. STDOUT is the
    // MCP JSON-RPC frame channel and the CLI --json payload channel;
    // infrastructure breadcrumbs there corrupt both. A human still sees
    // stderr in their terminal. Mirrors config.ts's stderr advisory tone.
    console.error('Database initialized with schema v1');
  }

  // PR-002: migration safety net. BEFORE the migration ladder mutates the
  // schema in place, take a synchronous byte-for-byte snapshot of the
  // pre-migration DB — but ONLY when all three conditions hold:
  //   (a) the DB FILE already existed at openDb entry (a fresh DB has no
  //       data to protect — captured as fileExistedAtEntry BEFORE
  //       `new Database`);
  //   (b) the on-disk schema_version is BELOW head, i.e. there are
  //       migrations to run (nothing to protect against if already at head);
  //   (c) RK_NO_MIGRATION_BACKUP is unset — an escape hatch for ephemeral
  //       and test DBs that never want the snapshot overhead.
  // The snapshot path is logged to STDERR (PH-DB-002: migration-progress
  // channel — STDOUT stays clean for MCP JSON-RPC / CLI --json).
  const preMigrationVersion = parseInt(
    (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1',
    10
  );
  if (
    fileExistedAtEntry &&
    preMigrationVersion < CURRENT_SCHEMA_VERSION &&
    !process.env.RK_NO_MIGRATION_BACKUP
  ) {
    const snapshotPath = snapshotPreMigration(_db, dbPath, preMigrationVersion);
    console.error(
      `Pre-migration snapshot written to ${snapshotPath} ` +
      `(schema v${preMigrationVersion} → v${CURRENT_SCHEMA_VERSION})`
    );
  }

  // Run migrations — each block compares the current schema_version and
  // applies the migration in a single exec() so multi-statement DDL
  // (triggers with embedded semicolons, CHECK constraints, etc.) is not
  // truncated by naive split-on-semicolon parsing.
  const version = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version) < 2) {
    const migration = readFileSync(MIGRATION_002, 'utf-8');
    execMigrationIdempotent(_db, migration, '002 (audit evidence layer)');
    console.error('Applied migration 002: audit evidence layer');
  }

  const version2 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version2) < 3) {
    const migration = readFileSync(MIGRATION_003, 'utf-8');
    execMigrationIdempotent(_db, migration, '003 (metrics v2)');
    console.error('Applied migration 003: metrics v2');
  }

  const version3 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version3) < 4) {
    const migration = readFileSync(MIGRATION_004, 'utf-8');
    execMigrationIdempotent(_db, migration, '004 (findings idempotency)');
    console.error('Applied migration 004: findings idempotency (UNIQUE constraint + dedup)');
  }

  // Migration 005 — FTS5 incremental triggers. This is additive over the
  // v4 head and intentionally does NOT bump schema_version (the
  // migration-sequence test pins head at '4'; the triggers are an
  // idempotent FTS-maintenance layer rather than a structural change).
  //
  // Guard against partial-schema fixtures: only apply if the source
  // tables (repos, repo_notes, repo_docs) and the FTS virtual table all
  // exist — a hand-written v1 schema test fixture may have only `repos`,
  // in which case the triggers would fail to attach. The FTS virtual
  // table is created by schema.sql, so this guard primarily protects
  // tests that build minimal schemas by hand.
  const requiredTables = ['repos', 'repo_notes', 'repo_docs', 'repo_search'];
  const presentTables = (_db.prepare(
    "SELECT name FROM sqlite_master WHERE type IN ('table', 'virtual') OR (type='table' AND name IN ('repo_search'))"
  ).all() as { name: string }[]).map(r => r.name);
  const presentSet = new Set(presentTables);
  const allPresent = requiredTables.every(t => presentSet.has(t));
  if (allPresent) {
    const migration = readFileSync(MIGRATION_005, 'utf-8');
    execMigrationIdempotent(_db, migration, '005 (FTS5 triggers)');
    // Quiet — migration 005 is additive and runs every openDb until
    // CREATE TRIGGER IF NOT EXISTS becomes a no-op.
  }

  // Migration 006 — lifecycle status + cross-rig paths. Gated on
  // schema_version: only runs if current version < 6. The migration is
  // additive (ALTER TABLE ADD COLUMN, CREATE TABLE/INDEX IF NOT EXISTS)
  // and bumps schema_version to '6' at the end.
  const version5 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version5) < 6) {
    const migration = readFileSync(MIGRATION_006, 'utf-8');
    execMigrationIdempotent(_db, migration, '006 (lifecycle + cross-rig paths)');

    // Backfill replaced_by_repo_id from existing 'supersedes'
    // relationships. Guarded on repo_relationships existing — minimal
    // v1 schema fixtures (e.g. migration-sequence test) may not have
    // it. The spec is: for each repo_relationships row with
    // relation_type='supersedes' (from A → B), set the source repo
    // A's replaced_by_repo_id to the target repo B's id.
    const hasRelTable = _db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_relationships'"
    ).get();
    if (hasRelTable) {
      _db.prepare(`
        UPDATE repos
           SET replaced_by_repo_id = (
             SELECT rr.to_repo_id
             FROM repo_relationships rr
             WHERE rr.from_repo_id = repos.id
               AND rr.relation_type = 'supersedes'
             LIMIT 1
           )
         WHERE replaced_by_repo_id IS NULL
           AND EXISTS (
             SELECT 1 FROM repo_relationships rr
             WHERE rr.from_repo_id = repos.id
               AND rr.relation_type = 'supersedes'
           )
      `).run();
    }

    console.error('Applied migration 006: lifecycle status + cross-rig paths');
  }

  // Migration 007 — publish state (npm/pypi package bindings + version
  // registry). Gated on schema_version: only runs if current version < 7.
  // Additive (ALTER TABLE ADD COLUMN, CREATE TABLE/INDEX IF NOT EXISTS)
  // and bumps schema_version to '7' at the end.
  const version6 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version6) < 7) {
    const migration = readFileSync(MIGRATION_007, 'utf-8');
    execMigrationIdempotent(_db, migration, '007 (publish state)');
    console.error('Applied migration 007: publish state (package bindings + version registry)');
  }

  // Migration 008 — build/dep/CI health (FT-3). Gated on schema_version:
  // only runs if current version < 8. Additive (ALTER TABLE ADD COLUMN,
  // CREATE TABLE/INDEX IF NOT EXISTS) and bumps schema_version to '8' at
  // the end.
  const version7 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version7) < 8) {
    const migration = readFileSync(MIGRATION_008, 'utf-8');
    execMigrationIdempotent(_db, migration, '008 (build/dep/CI health)');
    console.error('Applied migration 008: build/dep/CI health (toolchain + audit state + workflow actions)');
  }

  // Migration 009 — build/dep/CI health extensions (FT-3.5). Gated on
  // schema_version: only runs if current version < 9. Additive (ALTER
  // TABLE ADD COLUMN, CREATE TABLE/INDEX IF NOT EXISTS) and bumps
  // schema_version to '9' at the end.
  //
  // Adds: CVE-id columns + audit_omit_dev to repo_dep_audit_state;
  // repo_dep_audit_history snapshot table; SHA + pin-quality columns
  // to repo_workflow_actions; repo_workflow_permissions table for
  // GITHUB_TOKEN scoping; repo_observed_toolchain table for declared-vs-
  // observed drift detection per (repo, rig).
  //
  // Every column/table is sourced to specific research findings — see
  // the SQL header and the helpers below for citations.
  const version8 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version8) < 9) {
    const migration = readFileSync(MIGRATION_009, 'utf-8');
    execMigrationIdempotent(_db, migration, '009 (build health extensions)');
    console.error('Applied migration 009: build health extensions (CVE IDs + history + pin quality + workflow permissions + observed toolchain)');
  }

  // Migration 010 — operational hygiene run tables (FT-4). Gated on
  // schema_version: only runs if current version < 10. Additive
  // (CREATE TABLE / CREATE INDEX IF NOT EXISTS for the two new tables)
  // and bumps schema_version to '10' at the end.
  //
  // Adds: db_health_runs (audit trail of `rk fsck` invocations) +
  // sync_runs (observability for `rk sync` invocations — closes the
  // silent-failure regression that originated FT-4).
  const version9 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version9) < 10) {
    const migration = readFileSync(MIGRATION_010, 'utf-8');
    execMigrationIdempotent(_db, migration, '010 (operational runs)');
    console.error('Applied migration 010: operational runs (db_health_runs + sync_runs)');
  }

  // Migration 011 — cross-tool vocabulary (FT-5). Gated on schema_version:
  // only runs if current version < 11. Uses execMigrationStrict, which
  // wraps the CHECK-constraint extension (SQLite's "create new table →
  // INSERT...SELECT → DROP → RENAME" pattern) in a SINGLE transaction so
  // it either fully applies or fully rolls back — the DROP→RENAME window
  // can never strand the DB with no repo_relationships table (db-A-001).
  // A pre-fix binary could still have left such a stranded state on disk;
  // the recovery branch below detects and repairs it.
  //
  // Adds: two new relation_type values ('wraps',
  // 'collaborated_in_mission') extending the migration-001 CHECK enum;
  // repos.forge_vault_path column for game repos that point at their
  // forge-vault wing.
  //
  // Defensive guards:
  //   * check the cross_tool_vocab_added meta marker before running the
  //     SQL so a manual operator backfill that bumped schema_version
  //     directly without running the SQL doesn't double-apply.
  //   * detect minimal-v1 schema fixtures that lack repo_relationships
  //     (e.g. migration-sequence test). We apply only the additive
  //     forge_vault_path ADD COLUMN + version bump in that case; the
  //     CHECK-extension is a no-op when the table itself doesn't exist
  //     yet. Note on the fresh-DB path (db-A-002): a brand-new openDb
  //     loads schema.sql, which DOES already ship the extended 8-value
  //     relation_type enum and the forge_vault_path column directly, but
  //     schema.sql intentionally seeds schema_version='1' (NOT 11) so the
  //     table-creating migrations 002-010 still run on a fresh DB. That
  //     means migration-011 still runs on every fresh DB and re-creates
  //     repo_relationships even though schema.sql already shipped the new
  //     enum. Because the recreate is now transactional (db-A-001) this
  //     is durable; it can also be safely skipped when the table already
  //     accepts the extended enum (see the enum-probe below).
  //   * CRASH RECOVERY (db-A-001): if a prior run died mid-recreate it
  //     could leave repo_relationships_new present while repo_relationships
  //     is gone. execMigrationStrict now wraps the recreate in a
  //     transaction so this can no longer happen on a forward run, but a
  //     DB written by an OLDER (pre-fix) binary could already be in that
  //     state. We detect it explicitly and restore the stranded
  //     _new table rather than silently stamping version=11 with the
  //     relationships gone.
  const version10 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version10) < 11) {
    const marker = _db.prepare("SELECT value FROM meta WHERE key = 'cross_tool_vocab_added'").get() as { value: string } | undefined;
    if (!marker) {
      const hasRelTable = _db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_relationships'"
      ).get();
      const hasStrandedNew = _db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_relationships_new'"
      ).get();

      if (!hasRelTable && hasStrandedNew) {
        // Crash recovery: a pre-fix binary died after DROP but before
        // RENAME, stranding repo_relationships_new with the data inside
        // it. Complete the swap (rename _new into place, re-create its
        // indexes, finish the additive forge_vault_path column, and stamp
        // the version) inside one transaction so the table is restored
        // with the extended enum and its rows intact. Never stamp
        // version=11 with the relationships table missing.
        // Capture into a local const so TS keeps the non-null narrowing
        // inside the transaction closure (module-level _db widens to null
        // across the closure boundary).
        const db = _db;
        db.pragma('foreign_keys = OFF');
        try {
          const tx = db.transaction(() => {
            db.exec('ALTER TABLE repo_relationships_new RENAME TO repo_relationships');
            db.exec('CREATE INDEX IF NOT EXISTS idx_rel_from ON repo_relationships(from_repo_id)');
            db.exec('CREATE INDEX IF NOT EXISTS idx_rel_to ON repo_relationships(to_repo_id)');
            db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_rel_unique ON repo_relationships(from_repo_id, relation_type, to_repo_id)');
            // The forge_vault_path ADD COLUMN may or may not have landed
            // before the crash — tolerate duplicate-column on re-add.
            try {
              db.exec('ALTER TABLE repos ADD COLUMN forge_vault_path TEXT');
            } catch (e: unknown) {
              const msg = (e as Error)?.message ?? String(e);
              if (!msg.includes('duplicate column name')) throw e;
            }
            db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '11')").run();
            db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('cross_tool_vocab_added', datetime('now'))").run();
            // PH-DB-004: leave a durable breadcrumb IN THE SAME transaction
            // so a recovery is auditable after the fact (rk can surface "this
            // DB was repaired from a stranded _new table at <time>"). Writing
            // it inside the tx ties the breadcrumb to the restore atomically —
            // if the restore rolls back, so does the breadcrumb.
            db.prepare(
              "INSERT OR REPLACE INTO meta(key, value) VALUES ('migration_011_recovery', datetime('now') || ' restored from stranded _new')"
            ).run();
          });
          tx();
        } finally {
          db.pragma('foreign_keys = ON');
        }
        // PH-DB-002/004: recovery breadcrumb on STDERR (infrastructure
        // progress, not a command result) — keeps STDOUT clean for the MCP
        // JSON-RPC stream and CLI --json output.
        console.error('Recovered migration 011: restored stranded repo_relationships_new from an interrupted recreate');
      } else if (!hasRelTable && !hasStrandedNew) {
        // Distinguish two cases that both lack repo_relationships:
        //   (a) a legitimate minimal-v1 fixture that NEVER had the table
        //       (the migration-sequence test builds a DB with only `meta`
        //       + `repos`) — we only owe the additive forge_vault_path
        //       column + version bump.
        //   (b) a corrupt/half-migrated DB where repo_relationships was
        //       dropped and NOT replaced — refuse to stamp 11 and fail
        //       loudly (db-A-001).
        // Discriminator: schema.sql creates repo_relationships ALONGSIDE
        // a family of sibling tables (repo_tech, repo_docs, repo_notes,
        // ...) that NO migration creates. A DB that went through schema.sql
        // therefore has those siblings; a hand-built minimal-v1 fixture
        // does not. So if repo_relationships is gone while a schema.sql
        // sibling like repo_tech is present, the table was destroyed
        // post-creation — corruption. If repo_tech is also absent, this is
        // a minimal fixture that legitimately never had repo_relationships.
        const hasSchemaSibling = _db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_tech'"
        ).get();
        if (hasSchemaSibling) {
          throw new Error(
            'Migration 011 (cross-tool vocabulary): repo_relationships is missing on a DB built ' +
            'from schema.sql (repo_tech sibling present) and no repo_relationships_new exists to ' +
            'recover from. Refusing to stamp schema_version=11 with the relationships table gone — ' +
            'this DB is corrupt and needs manual restore from backup.'
          );
        }
        // Minimal-fixture path: no repo_relationships to extend, so
        // only the additive forge_vault_path column + version bump are
        // possible here. ADD COLUMN may collide with a pre-existing
        // column from a partial run; tolerate the duplicate.
        try {
          _db.exec("ALTER TABLE repos ADD COLUMN forge_vault_path TEXT");
        } catch (e: unknown) {
          const msg = (e as Error)?.message ?? String(e);
          if (!msg.includes('duplicate column name')) {
            throw new Error(`Migration 011 (cross-tool vocabulary, minimal fixture path) failed: ${msg}`, { cause: e });
          }
        }
        _db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '11')").run();
        _db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('cross_tool_vocab_added', datetime('now'))").run();
        console.error('Applied migration 011: cross-tool vocabulary (minimal-fixture path — forge_vault_path only)');
      } else {
        // The table exists. Probe its CREATE SQL: if the CHECK already
        // lists the extended enum (e.g. a fresh DB built from the current
        // schema.sql, which ships the 8-value enum), skip the destructive
        // DROP→RECREATE entirely — we only owe the additive
        // forge_vault_path column + version stamp. This avoids needlessly
        // rebuilding repo_relationships on every fresh openDb (db-A-002).
        const relSql = (_db.prepare(
          "SELECT sql FROM sqlite_master WHERE type='table' AND name='repo_relationships'"
        ).get() as { sql: string } | undefined)?.sql ?? '';
        const enumAlreadyExtended =
          relSql.includes("'wraps'") && relSql.includes("'collaborated_in_mission'");

        if (enumAlreadyExtended) {
          // Additive-only path: extend the schema bookkeeping without
          // touching the already-correct relationships table.
          try {
            _db.exec("ALTER TABLE repos ADD COLUMN forge_vault_path TEXT");
          } catch (e: unknown) {
            const msg = (e as Error)?.message ?? String(e);
            if (!msg.includes('duplicate column name')) {
              throw new Error(`Migration 011 (cross-tool vocabulary, enum-already-extended path) failed: ${msg}`, { cause: e });
            }
          }
          _db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '11')").run();
          _db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('cross_tool_vocab_added', datetime('now'))").run();
          console.error('Applied migration 011: cross-tool vocabulary (enum already extended — forge_vault_path only)');
        } else {
          const migration = readFileSync(MIGRATION_011, 'utf-8');
          execMigrationStrict(_db, migration, '011 (cross-tool vocabulary)');
          console.error('Applied migration 011: cross-tool vocabulary (relation types + forge_vault_path)');
        }
      }
    } else {
      // Meta marker present but version not yet stamped — bump version
      // and move on. This handles a hypothetical race where the SQL
      // partially ran (marker inserted before the version stamp).
      _db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '11')").run();
    }
  }

  return _db;
}

/**
 * Close the database connection.
 */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
    _dbPath = null;
  }
}

/**
 * Get the current database instance (must call openDb first).
 */
export function getDb(): DatabaseType {
  if (!_db) throw new Error('Database not initialized — call openDb() first');
  return _db;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert undefined to null (SQLite can't bind undefined). */
function n<T>(v: T | undefined): T | null { return v === undefined ? null : v; }

// ─── Repo CRUD ───────────────────────────────────────────────────────────────

export interface RepoData {
  owner: string;
  name: string;
  github_url?: string | null;
  local_path?: string | null;
  description?: string | null;
  purpose?: string | null;
  category?: string | null;
  status?: string | null;
  stage?: string | null;
  visibility?: string | null;
  archived?: boolean | number | null;
  default_branch?: string | null;
  stars?: number | null;
  forks?: number | null;
  open_issues?: number | null;
  license?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  pushed_at?: string | null;
}

export function upsertRepo(data: RepoData): number | bigint {
  const db = getDb();
  const slug = `${data.owner}/${data.name}`;

  const existing = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE repos SET
        github_url = coalesce(?, github_url),
        local_path = coalesce(?, local_path),
        description = coalesce(?, description),
        purpose = coalesce(?, purpose),
        category = coalesce(?, category),
        status = coalesce(?, status),
        stage = coalesce(?, stage),
        visibility = coalesce(?, visibility),
        archived = coalesce(?, archived),
        default_branch = coalesce(?, default_branch),
        stars = coalesce(?, stars),
        forks = coalesce(?, forks),
        open_issues = coalesce(?, open_issues),
        license = coalesce(?, license),
        created_at = coalesce(?, created_at),
        updated_at = coalesce(?, updated_at),
        pushed_at = coalesce(?, pushed_at),
        synced_at = datetime('now')
      WHERE id = ?
    `).run(
      n(data.github_url), n(data.local_path), n(data.description), n(data.purpose),
      n(data.category), n(data.status), n(data.stage), n(data.visibility),
      data.archived != null ? (data.archived ? 1 : 0) : null,
      n(data.default_branch), n(data.stars), n(data.forks),
      n(data.open_issues), n(data.license), n(data.created_at), n(data.updated_at),
      n(data.pushed_at), existing.id
    );
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO repos (
      owner, name, slug, github_url, local_path, description, purpose,
      category, status, stage, visibility, archived, default_branch,
      stars, forks, open_issues, license,
      created_at, updated_at, pushed_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    data.owner, data.name, slug, n(data.github_url), n(data.local_path),
    n(data.description), n(data.purpose), n(data.category),
    data.status || 'unknown', n(data.stage), data.visibility || 'public',
    // db-A-008: mirror the UPDATE branch's null-preserving form. The old
    // `data.archived ? 1 : 0` collapsed an explicit null/undefined to 0,
    // losing the "unknown archived state" distinction (same class of bug
    // as the stars/forks ?? null idiom below). null here lets the schema
    // DEFAULT 0 apply for a truly-absent value while an explicit null
    // survives intact, consistent with UPDATE.
    data.archived != null ? (data.archived ? 1 : 0) : null,
    data.default_branch || 'main',
    // F-DB-012: preserve null vs 0 distinction — "unknown stars" is not
    // the same as "zero stars" and downstream queries can drift if they
    // pessimize a missing count to 0. The schema DEFAULT 0 still applies
    // for true `undefined`, but explicit null survives intact.
    data.stars ?? null, data.forks ?? null, data.open_issues ?? null,
    n(data.license),
    n(data.created_at), n(data.updated_at), n(data.pushed_at)
  );
  return result.lastInsertRowid;
}

export interface TechData {
  primary_language?: string | null;
  languages?: Record<string, unknown> | string[] | null;
  frameworks?: string[] | null;
  runtime?: string | null;
  platform_targets?: string[] | null;
  package_manager?: string | null;
  app_shape?: string | null;
  deployment_shape?: string | null;
}

export function upsertTech(repoId: number | bigint, data: TechData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_tech (
      repo_id, primary_language, languages, frameworks, runtime,
      platform_targets, package_manager, app_shape, deployment_shape
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(repo_id) DO UPDATE SET
      primary_language = coalesce(excluded.primary_language, primary_language),
      languages = coalesce(excluded.languages, languages),
      frameworks = coalesce(excluded.frameworks, frameworks),
      runtime = coalesce(excluded.runtime, runtime),
      platform_targets = coalesce(excluded.platform_targets, platform_targets),
      package_manager = coalesce(excluded.package_manager, package_manager),
      app_shape = coalesce(excluded.app_shape, app_shape),
      deployment_shape = coalesce(excluded.deployment_shape, deployment_shape)
  `).run(
    repoId,
    data.primary_language,
    data.languages ? JSON.stringify(data.languages) : null,
    data.frameworks ? JSON.stringify(data.frameworks) : null,
    data.runtime,
    data.platform_targets ? JSON.stringify(data.platform_targets) : null,
    data.package_manager,
    data.app_shape,
    data.deployment_shape
  );
}

export function setTopics(repoId: number | bigint, topics: string[], source: string = 'github'): void {
  const db = getDb();
  // F-DB-011: wrap the delete + bulk-insert in a single transaction so
  // an interrupted setTopics call cannot leave the row in the "deleted
  // old topics but didn't write new ones" state. Also 10-100x faster
  // for repos with many topics.
  const ins = db.prepare('INSERT OR IGNORE INTO repo_topics (repo_id, topic, source) VALUES (?, ?, ?)');
  const tx = db.transaction(() => {
    if (source === 'github') {
      db.prepare("DELETE FROM repo_topics WHERE repo_id = ? AND source = 'github'").run(repoId);
    }
    for (const t of topics) {
      ins.run(repoId, t, source);
    }
  });
  tx();
}

export function upsertFact(
  repoId: number | bigint,
  factType: string,
  key: string,
  value: string,
  confidence: string = 'detected',
  sourcePath: string | null = null
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_facts (repo_id, fact_type, key, value, confidence, source_path, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, fact_type, key) DO UPDATE SET
      value = excluded.value,
      confidence = excluded.confidence,
      source_path = excluded.source_path,
      updated_at = datetime('now')
  `).run(repoId, factType, key, value, confidence, sourcePath);
}

export function upsertDoc(
  repoId: number | bigint,
  path: string,
  docType: string,
  title: string,
  content: string,
  checksum: string
): number | bigint {
  const db = getDb();
  const existing = db.prepare(
    'SELECT id, checksum FROM repo_docs WHERE repo_id = ? AND path = ?'
  ).get(repoId, path) as { id: number; checksum: string } | undefined;

  if (existing && existing.checksum === checksum) return existing.id; // unchanged

  if (existing) {
    db.prepare(`
      UPDATE repo_docs SET
        doc_type = ?, title = ?, content = ?, checksum = ?, last_indexed_at = datetime('now')
      WHERE id = ?
    `).run(docType, title, content, checksum, existing.id);
    return existing.id;
  }

  const r = db.prepare(`
    INSERT INTO repo_docs (repo_id, path, doc_type, title, content, checksum)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(repoId, path, docType, title, content, checksum);
  return r.lastInsertRowid;
}

export function upsertNote(
  repoId: number | bigint,
  noteType: string,
  title: string,
  content: string,
  source: string = 'manual'
): number | bigint {
  const db = getDb();
  const existing = db.prepare(
    'SELECT id FROM repo_notes WHERE repo_id = ? AND note_type = ? AND title = ?'
  ).get(repoId, noteType, title) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE repo_notes SET content = ?, source = ?, updated_at = datetime('now') WHERE id = ?
    `).run(content, source, existing.id);
    return existing.id;
  }

  const r = db.prepare(`
    INSERT INTO repo_notes (repo_id, note_type, title, content, source)
    VALUES (?, ?, ?, ?, ?)
  `).run(repoId, noteType, title, content, source);
  return r.lastInsertRowid;
}

export interface ReleaseData {
  tag: string;
  title: string;
  body: string;
  prerelease: boolean;
  published_at: string;
}

export function upsertRelease(repoId: number | bigint, data: ReleaseData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_releases (repo_id, tag, title, body, prerelease, published_at, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, tag) DO UPDATE SET
      title = excluded.title,
      body = excluded.body,
      prerelease = excluded.prerelease,
      published_at = excluded.published_at,
      synced_at = datetime('now')
  `).run(repoId, data.tag, data.title, data.body, data.prerelease ? 1 : 0, data.published_at);
}

/**
 * Closed set of valid repo_relationships.relation_type values — the
 * DB-layer mirror of the repo_relationships CHECK constraint (schema.sql
 * + migration-011). src/index.ts re-exports its own RELATION_TYPES tuple
 * for the CLI/MCP enum; this lives in the DB layer (no circular import on
 * index.ts) so addRelationship can validate before the INSERT.
 *
 * Keep in lockstep with the CHECK constraint and src/index.ts's
 * RELATION_TYPES — relation-types.test.ts pins that they agree.
 */
export const DB_RELATION_TYPES = [
  'depends_on', 'related_to', 'supersedes',
  'shares_domain_with', 'shares_package_with', 'companion_to',
  // FT-5: cross-tool vocabulary
  'wraps', 'collaborated_in_mission',
] as const;
export type DbRelationType = typeof DB_RELATION_TYPES[number];

export function addRelationship(
  fromRepoId: number | bigint,
  relationType: string,
  toRepoId: number | bigint,
  note: string | null = null
): void {
  // ts-A-003: validate relation_type BEFORE the INSERT. The previous code
  // relied on `INSERT OR IGNORE` plus a comment claiming the IGNORE only
  // applied to UNIQUE-constraint violations while CHECK violations still
  // threw. That was FALSE — SQLite's OR IGNORE clause silently DROPS rows
  // that fail ANY constraint, including the relation_type CHECK. An
  // invalid relation_type therefore vanished with no error and no row
  // written. We now reject out-of-enum values loudly; OR IGNORE remains
  // ONLY to dedup the (from, relation_type, to) UNIQUE index for valid
  // values.
  if (!(DB_RELATION_TYPES as readonly string[]).includes(relationType)) {
    throw new Error(
      `Invalid relation_type: ${JSON.stringify(relationType)} — must be one of ${DB_RELATION_TYPES.join(', ')}`
    );
  }
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO repo_relationships (from_repo_id, relation_type, to_repo_id, note)
    VALUES (?, ?, ?, ?)
  `).run(fromRepoId, relationType, toRepoId, note);
}

// ─── Query helpers ───────────────────────────────────────────────────────────

export function getRepo(slug: string): Record<string, any> | null {
  const db = getDb();
  const repo = db.prepare('SELECT * FROM repos WHERE slug = ?').get(slug) as Record<string, any> | undefined;
  if (!repo) return null;

  repo.tech = db.prepare('SELECT * FROM repo_tech WHERE repo_id = ?').get(repo.id);
  repo.topics = (db.prepare('SELECT topic, source FROM repo_topics WHERE repo_id = ?').all(repo.id) as { topic: string }[])
    .map(r => r.topic);
  repo.notes = db.prepare('SELECT * FROM repo_notes WHERE repo_id = ? ORDER BY updated_at DESC').all(repo.id);
  repo.facts = db.prepare('SELECT * FROM repo_facts WHERE repo_id = ?').all(repo.id);
  repo.releases = db.prepare('SELECT * FROM repo_releases WHERE repo_id = ? ORDER BY published_at DESC LIMIT 5').all(repo.id);
  repo.relationships = db.prepare(`
    SELECT r.*, repos.slug AS target_slug
    FROM repo_relationships r
    JOIN repos ON repos.id = r.to_repo_id
    WHERE r.from_repo_id = ?
    UNION ALL
    SELECT r.*, repos.slug AS target_slug
    FROM repo_relationships r
    JOIN repos ON repos.id = r.from_repo_id
    WHERE r.to_repo_id = ?
  `).all(repo.id, repo.id);

  return repo;
}

export interface RepoFilters {
  owner?: string;
  status?: string;
  category?: string;
  archived?: boolean;
  language?: string;
  framework?: string;
  app_shape?: string;
  topic?: string;
}

export function findRepos(filters: RepoFilters = {}): Record<string, any>[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.owner) { conditions.push('r.owner = ?'); params.push(filters.owner); }
  if (filters.status) { conditions.push('r.status = ?'); params.push(filters.status); }
  if (filters.category) { conditions.push('r.category = ?'); params.push(filters.category); }
  // archived is nullable (NULL = unknown, treated as not-archived); COALESCE
  // so the false filter still matches never-archived rows inserted as NULL.
  if (filters.archived !== undefined) {
    if (filters.archived) { conditions.push('r.archived = 1'); }
    else { conditions.push('COALESCE(r.archived, 0) = 0'); }
  }
  if (filters.language) {
    conditions.push('t.primary_language = ?');
    params.push(filters.language);
  }
  if (filters.framework) {
    // db-A-006: t.frameworks is a JSON array (e.g. ["react","react-native"]).
    // The old `LIKE %react%` over-matched: it returned a repo whose only
    // framework was "react-native" when filtering for "react", and the
    // unescaped substring let LIKE metacharacters (%, _) in the filter
    // value match arbitrary text. Match each array ELEMENT for exact
    // equality via json_each instead.
    conditions.push(
      'EXISTS (SELECT 1 FROM json_each(t.frameworks) fw WHERE fw.value = ?)'
    );
    params.push(filters.framework);
  }
  if (filters.app_shape) {
    conditions.push('t.app_shape = ?');
    params.push(filters.app_shape);
  }
  if (filters.topic) {
    conditions.push('EXISTS (SELECT 1 FROM repo_topics tp WHERE tp.repo_id = r.id AND tp.topic = ?)');
    params.push(filters.topic);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  return db.prepare(`
    SELECT r.*, t.primary_language, t.app_shape, t.frameworks
    FROM repos r
    LEFT JOIN repo_tech t ON t.repo_id = r.id
    ${where}
    ORDER BY r.pushed_at DESC NULLS LAST
  `).all(...params) as Record<string, any>[];
}

export function getRelated(repoId: number | bigint): Record<string, any>[] {
  const db = getDb();
  return db.prepare(`
    SELECT r.relation_type, repos.slug, repos.description, r.note
    FROM repo_relationships r
    JOIN repos ON repos.id = r.to_repo_id
    WHERE r.from_repo_id = ?
    UNION ALL
    SELECT r.relation_type, repos.slug, repos.description, r.note
    FROM repo_relationships r
    JOIN repos ON repos.id = r.from_repo_id
    WHERE r.to_repo_id = ?
  `).all(repoId, repoId) as Record<string, any>[];
}

export function getRepoIdBySlug(slug: string): number | null {
  const db = getDb();
  const row = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  return row ? row.id : null;
}

export function getAllRepos(): Record<string, any>[] {
  const db = getDb();
  return db.prepare(`
    SELECT r.slug, r.description, r.status, r.category, r.stage,
           t.primary_language, t.app_shape
    FROM repos r
    LEFT JOIN repo_tech t ON t.repo_id = r.id
    ORDER BY r.owner, r.name
  `).all() as Record<string, any>[];
}

export interface DbStats {
  repos: number;
  notes: number;
  docs: number;
  facts: number;
  releases: number;
  relationships: number;
  audit_runs?: number;
  audit_controls?: number;
  audit_findings?: number;
  audited_repos?: number;
  /** True if audit tables are missing — schema needs migration. Never silently returns zeros. */
  audit_schema_missing?: boolean;
}

export function getStats(): DbStats {
  const db = getDb();
  const stats: DbStats = {
    repos: (db.prepare('SELECT COUNT(*) as count FROM repos').get() as { count: number }).count,
    notes: (db.prepare('SELECT COUNT(*) as count FROM repo_notes').get() as { count: number }).count,
    docs: (db.prepare('SELECT COUNT(*) as count FROM repo_docs').get() as { count: number }).count,
    facts: (db.prepare('SELECT COUNT(*) as count FROM repo_facts').get() as { count: number }).count,
    releases: (db.prepare('SELECT COUNT(*) as count FROM repo_releases').get() as { count: number }).count,
    relationships: (db.prepare('SELECT COUNT(*) as count FROM repo_relationships').get() as { count: number }).count,
  };

  // Audit stats — fail explicitly if tables are missing (schema drift)
  const hasAuditTables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='audit_runs'"
  ).get();
  if (hasAuditTables) {
    stats.audit_runs = (db.prepare('SELECT COUNT(*) as count FROM audit_runs').get() as { count: number }).count;
    stats.audit_controls = (db.prepare('SELECT COUNT(*) as count FROM audit_controls').get() as { count: number }).count;
    stats.audit_findings = (db.prepare('SELECT COUNT(*) as count FROM audit_findings').get() as { count: number }).count;
    stats.audited_repos = (db.prepare('SELECT COUNT(DISTINCT repo_id) as count FROM audit_runs').get() as { count: number }).count;
  } else {
    // Explicit: audit tables not present — schema needs migration
    stats.audit_runs = undefined;
    stats.audit_controls = undefined;
    stats.audit_findings = undefined;
    stats.audited_repos = undefined;
    stats.audit_schema_missing = true;
  }

  return stats;
}

// ─── FT-1: lifecycle + cross-rig paths ──────────────────────────────────────

/**
 * Closed enum of valid `lifecycle_status` values for repos.
 * Enforced at the application layer (SQLite ADD COLUMN can't include a
 * table-self-referential CHECK constraint via migration), so the helpers
 * below validate before writing.
 */
export const LIFECYCLE_STATUSES = [
  'active',
  'deprecated',
  'archived',
  'superseded',
  'marketing_wing',
  'prototype',
] as const;
export type LifecycleStatus = typeof LIFECYCLE_STATUSES[number];

export interface RigRow {
  rig_id: string;
  hostname: string | null;
  primary_root: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface RepoLocalPathRow {
  id: number;
  repo_id: number;
  rig_id: string;
  local_path: string;
  last_seen_at: string;
  created_at: string;
}

export interface RigData {
  rig_id: string;
  hostname?: string | null;
  primary_root?: string | null;
}

/**
 * Insert-or-update a rig registry row. `last_seen_at` is always refreshed
 * to the current time on call — `upsertRig` is "I just heard from this
 * rig" not "describe this rig statically."
 *
 * Hostname / primary_root use coalesce(?, existing) semantics: passing
 * undefined/null leaves the prior value intact, but passing a new string
 * overwrites it.
 */
export function upsertRig(data: RigData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO rigs (rig_id, hostname, primary_root, last_seen_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(rig_id) DO UPDATE SET
      hostname = coalesce(excluded.hostname, hostname),
      primary_root = coalesce(excluded.primary_root, primary_root),
      last_seen_at = datetime('now')
  `).run(data.rig_id, n(data.hostname), n(data.primary_root));
}

export function getRig(rig_id: string): RigRow | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM rigs WHERE rig_id = ?').get(rig_id) as RigRow | undefined;
  return row ?? null;
}

export function listRigs(): RigRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM rigs ORDER BY rig_id').all() as RigRow[];
}

export interface RepoLocalPathData {
  repo_id: number | bigint;
  rig_id: string;
  local_path: string;
}

/**
 * Insert-or-update a (repo_id, rig_id) → local_path row. `last_seen_at`
 * is always refreshed on call. The unique constraint on (repo_id, rig_id)
 * means a single rig holds at most one path per repo — re-registering
 * the same pair updates the path in place.
 */
export function upsertRepoLocalPath(data: RepoLocalPathData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_local_paths (repo_id, rig_id, local_path, last_seen_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, rig_id) DO UPDATE SET
      local_path = excluded.local_path,
      last_seen_at = datetime('now')
  `).run(data.repo_id, data.rig_id, data.local_path);
}

export function getRepoLocalPaths(repo_id: number | bigint): RepoLocalPathRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM repo_local_paths WHERE repo_id = ? ORDER BY rig_id'
  ).all(repo_id) as RepoLocalPathRow[];
}

/**
 * Hard-delete a repo by slug and report the count of cascaded child rows
 * across the FK chain. Returns { deleted: false, cascaded_rows: 0 } if
 * the slug doesn't exist.
 *
 * FK ON DELETE CASCADE handles the actual cleanup once the parent row is
 * removed; we count children BEFORE deleting so the caller can show a
 * meaningful confirmation message ("this will remove the repo + 47 rows
 * across notes/docs/facts/...").
 *
 * The count includes: repo_tech, repo_facts, repo_docs, repo_notes,
 * repo_releases, repo_topics, repo_audits, repo_relationships (BOTH
 * directions), audit_runs + their nested control_results / findings /
 * artifacts / metrics, audit_exceptions, and repo_local_paths.
 */
export function deleteRepoBySlug(
  slug: string
): { deleted: boolean; cascaded_rows: number } {
  const db = getDb();
  const repo = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (!repo) return { deleted: false, cascaded_rows: 0 };

  const repoId = repo.id;
  const tx = db.transaction(() => {
    // Count children across the cascade graph. We sum the counts so the
    // caller sees the total blast radius. The audit chain requires a
    // join via audit_runs(repo_id) → audit_{control_results, findings,
    // artifacts, metrics}(audit_run_id).
    const auditRunIds = (db.prepare(
      'SELECT id FROM audit_runs WHERE repo_id = ?'
    ).all(repoId) as { id: number }[]).map(r => r.id);

    let cascaded = 0;
    const count = (sql: string, ...params: unknown[]): number => {
      const r = db.prepare(sql).get(...params) as { c: number };
      return r.c;
    };

    cascaded += count('SELECT COUNT(*) AS c FROM repo_tech WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_facts WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_docs WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_notes WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_releases WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_topics WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_audits WHERE repo_id = ?', repoId);
    cascaded += count(
      'SELECT COUNT(*) AS c FROM repo_relationships WHERE from_repo_id = ? OR to_repo_id = ?',
      repoId, repoId
    );
    cascaded += count('SELECT COUNT(*) AS c FROM repo_local_paths WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM audit_runs WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM audit_findings WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM audit_exceptions WHERE repo_id = ?', repoId);

    if (auditRunIds.length > 0) {
      const placeholders = auditRunIds.map(() => '?').join(',');
      cascaded += count(
        `SELECT COUNT(*) AS c FROM audit_control_results WHERE audit_run_id IN (${placeholders})`,
        ...auditRunIds
      );
      cascaded += count(
        `SELECT COUNT(*) AS c FROM audit_artifacts WHERE audit_run_id IN (${placeholders})`,
        ...auditRunIds
      );
      cascaded += count(
        `SELECT COUNT(*) AS c FROM audit_metrics WHERE audit_run_id IN (${placeholders})`,
        ...auditRunIds
      );
    }

    // FK ON DELETE CASCADE handles the actual removal. PRAGMA
    // foreign_keys = ON is already set at openDb time.
    db.prepare('DELETE FROM repos WHERE id = ?').run(repoId);

    return cascaded;
  });

  const cascaded_rows = tx() as number;
  return { deleted: true, cascaded_rows };
}

type RepoDeleter = (slug: string) => { deleted: boolean; cascaded_rows: number };

/**
 * cli-A-004: delete a batch of repos all-or-nothing. Each deleteRepoBySlug
 * runs its own (here nested → savepoint) transaction, but `rk prune --apply`
 * needs the WHOLE batch atomic: a mid-batch throw must NOT leave the repos
 * deleted before the failure permanently gone while the rest survive (a
 * partial, unrecoverable prune). Wrapping the loop in one db.transaction means
 * any throw rolls the entire batch back — nothing is deleted unless everything
 * can be.
 *
 * The deleter is injectable (defaults to the real deleteRepoBySlug) ONLY so
 * the atomicity invariant is testable against THIS transaction: a test that
 * re-implements the wrapper locally is vacuous (it passes even if this wrapper
 * is removed). A test injects a deleter that throws mid-batch and asserts the
 * whole batch rolled back.
 */
export function pruneBatch(
  slugs: string[],
  deleter: RepoDeleter = deleteRepoBySlug
): { deletedCount: number; totalCascaded: number } {
  const db = getDb();
  let totalCascaded = 0;
  let deletedCount = 0;
  const runBatch = db.transaction(() => {
    for (const slug of slugs) {
      const result = deleter(slug);
      if (result.deleted) {
        deletedCount += 1;
        totalCascaded += result.cascaded_rows;
      }
    }
  });
  runBatch();
  return { deletedCount, totalCascaded };
}

/**
 * Mark a repo as archived. Sets `lifecycle_status = 'archived'` and
 * `deprecated_at = datetime('now')`. The `reason` option is reserved for
 * a future audit-trail use (currently unused by the DB — note tables
 * can capture archival rationale on the caller side).
 *
 * Returns { archived: false } if the slug doesn't exist; true if a row
 * was updated. Re-archiving an already-archived repo overwrites the
 * deprecated_at to the current time, which is intentional ("we
 * re-confirmed this is gone" is a meaningful event).
 */
export function archiveRepoBySlug(
  slug: string,
  _opts: { reason?: string } = {}
): { archived: boolean } {
  const db = getDb();
  const r = db.prepare(`
    UPDATE repos
       SET lifecycle_status = 'archived',
           deprecated_at = datetime('now')
     WHERE slug = ?
  `).run(slug);
  return { archived: r.changes > 0 };
}

/**
 * Set `replaced_by_repo_id` to point at the replacement repo by slug.
 * Also promotes lifecycle_status from 'active' to 'superseded' if the
 * source repo is currently active. Returns { updated: false } if either
 * slug doesn't exist or if the source repo was already non-active and
 * had the same replacement.
 *
 * The "active → superseded" promotion is conditional because a repo
 * that's already 'archived' or 'deprecated' shouldn't be silently
 * downgraded to 'superseded' — those terminal states are stronger and
 * more specific. Setting the FK is independent of status.
 */
export function setReplacedBy(
  slug: string,
  replacement_slug: string
): { updated: boolean } {
  const db = getDb();
  const replacement = db.prepare('SELECT id FROM repos WHERE slug = ?').get(replacement_slug) as { id: number } | undefined;
  if (!replacement) return { updated: false };

  const source = db.prepare('SELECT id, lifecycle_status FROM repos WHERE slug = ?').get(slug) as { id: number; lifecycle_status: string } | undefined;
  if (!source) return { updated: false };

  const tx = db.transaction(() => {
    db.prepare('UPDATE repos SET replaced_by_repo_id = ? WHERE id = ?').run(replacement.id, source.id);
    if (source.lifecycle_status === 'active') {
      db.prepare("UPDATE repos SET lifecycle_status = 'superseded' WHERE id = ?").run(source.id);
    }
  });
  tx();
  return { updated: true };
}

/**
 * Find repos that have been archived for more than N days. Used by
 * `rk prune --apply` to surface stale archived rows that may be
 * candidates for hard-delete.
 *
 * The threshold uses SQLite's date() function with a parameterized day
 * offset. `deprecated_at` is compared against `now - N days`; rows with
 * NULL deprecated_at are excluded (an "archived" row without a
 * timestamp is malformed and we prefer to surface it via separate
 * tooling rather than treat it as infinitely stale).
 */
export function findStaleArchived(days: number): Record<string, unknown>[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM repos
     WHERE lifecycle_status = 'archived'
       AND deprecated_at IS NOT NULL
       AND deprecated_at < date('now', '-' || ? || ' days')
     ORDER BY deprecated_at ASC
  `).all(days) as Record<string, unknown>[];
}

// ─── FT-2: publish state ────────────────────────────────────────────────────

/**
 * Closed enum of valid `publisher_method` values for repos. Enforced at
 * the application layer (the SQLite column has no CHECK constraint
 * because of the same ADD COLUMN limitation as lifecycle_status).
 *
 * Values:
 *   - 'pypi_trusted'        — PyPI trusted publisher (OIDC, no token)
 *   - 'pypi_token'          — legacy PyPI API token
 *   - 'npm_token'           — npm classic token
 *   - 'npm_trusted'         — npm trusted publisher (OIDC + provenance)
 *   - 'github_release_only' — releases via gh release create, no registry
 *   - 'none'                — nothing published anywhere
 */
export const PUBLISHER_METHODS = [
  'pypi_trusted',
  'pypi_token',
  'npm_token',
  'npm_trusted',
  'github_release_only',
  'none',
] as const;
export type PublisherMethod = typeof PUBLISHER_METHODS[number];

/**
 * Valid channel values for `repo_published_versions.channel`. Enforced at
 * the application layer when callers go through upsertPublishedVersion.
 * The DB does NOT constrain this — direct INSERTs from tests / sync code
 * can use other strings, but the type system steers normal use here.
 */
export const PUBLISHED_VERSION_CHANNELS = [
  'npm',
  'pypi',
  'github_release',
  'vsce',
] as const;
export type PublishedVersionChannel = typeof PUBLISHED_VERSION_CHANNELS[number];

export interface PublishedVersionRow {
  id: number;
  repo_id: number;
  channel: string;
  version: string;
  published_at: string | null;
  source: string | null;
  synced_at: string;
}

export interface PublishedVersionUpsert {
  repo_id: number | bigint;
  channel: string;
  version: string;
  published_at?: string | null;
  source?: string | null;
}

/**
 * Insert-or-update a (repo_id, channel, version) row. On conflict the
 * row keeps its existing `published_at` if the new value is null —
 * registries sometimes drop the timestamp on re-query, and we don't
 * want a re-sync to erase a known-good timestamp. `synced_at` always
 * refreshes to the current time (the whole point of the upsert is "we
 * just saw this version on this channel").
 *
 * `source` is overwritten when provided so a later, more authoritative
 * sync can replace an earlier ad-hoc source label.
 */
export function upsertPublishedVersion(args: PublishedVersionUpsert): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_published_versions
      (repo_id, channel, version, published_at, source, synced_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, channel, version) DO UPDATE SET
      published_at = coalesce(excluded.published_at, published_at),
      source       = coalesce(excluded.source, source),
      synced_at    = datetime('now')
  `).run(
    args.repo_id,
    args.channel,
    args.version,
    n(args.published_at),
    n(args.source)
  );
}

/**
 * Return the most-recently-synced version for a given (repo, channel).
 *
 * "Most recently synced" is usually the latest published version — npm /
 * pypi list versions newest-first, and a fresh sync overwrites
 * synced_at. We deliberately order by synced_at (not published_at)
 * because some channels report null published_at, and ordering by
 * published_at would push those rows to the tail unhelpfully.
 *
 * Returns null if no row exists.
 */
export function getLatestPublishedVersion(
  repo_id: number | bigint,
  channel: string
): PublishedVersionRow | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM repo_published_versions
     WHERE repo_id = ? AND channel = ?
     ORDER BY synced_at DESC
     LIMIT 1
  `).get(repo_id, channel) as PublishedVersionRow | undefined;
  return row ?? null;
}

/**
 * List every published-version row for a repo, across channels.
 * Sorted by (channel, synced_at DESC) so callers can group by channel
 * and see the most-recent entries first within each group.
 */
export function listPublishedVersions(
  repo_id: number | bigint
): PublishedVersionRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM repo_published_versions
     WHERE repo_id = ?
     ORDER BY channel ASC, synced_at DESC
  `).all(repo_id) as PublishedVersionRow[];
}

/**
 * Set package-name bindings and publisher_method on a repo by slug.
 *
 * All three fields are optional — pass only what you want to set.
 * undefined leaves the existing value intact; null explicitly clears it
 * (use `npm: null` to unbind a previously-set name). This mirrors the
 * coalesce(?, existing) pattern from upsertRepo but accepts an explicit
 * clear via null.
 *
 * Validates publisher_method against PUBLISHER_METHODS — throws on
 * out-of-enum values rather than silently writing garbage. Returns
 * { updated: false } if the slug doesn't exist.
 */
export function setRepoPackageNames(
  slug: string,
  names: {
    npm?: string | null;
    pypi?: string | null;
    publisher_method?: PublisherMethod | null;
  }
): { updated: boolean } {
  if (
    names.publisher_method !== undefined &&
    names.publisher_method !== null &&
    !PUBLISHER_METHODS.includes(names.publisher_method)
  ) {
    throw new Error(
      `Invalid publisher_method: ${JSON.stringify(names.publisher_method)} — must be one of ${PUBLISHER_METHODS.join(', ')}`
    );
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (!existing) return { updated: false };

  // Build the SET clause dynamically so undefined leaves columns intact.
  // null is treated as an explicit clear.
  const sets: string[] = [];
  const params: (string | null)[] = [];
  if (names.npm !== undefined) {
    sets.push('npm_package_name = ?');
    params.push(names.npm);
  }
  if (names.pypi !== undefined) {
    sets.push('pypi_package_name = ?');
    params.push(names.pypi);
  }
  if (names.publisher_method !== undefined) {
    sets.push('publisher_method = ?');
    params.push(names.publisher_method);
  }

  if (sets.length === 0) return { updated: false };

  params.push(slug);
  const r = db.prepare(
    `UPDATE repos SET ${sets.join(', ')} WHERE slug = ?`
  ).run(...params);
  return { updated: r.changes > 0 };
}

/**
 * Reverse lookup: every repo bound to a given npm package name. Most
 * registries have a one-to-one binding, but a monorepo migration can
 * temporarily yield two repos pointing at the same name, so the return
 * is always an array.
 *
 * Returns all columns from repos (Record<string, unknown> — same shape
 * as findRepos). Empty array when no match.
 */
export function getReposByNpmPackage(npm_name: string): Record<string, unknown>[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM repos WHERE npm_package_name = ? ORDER BY slug'
  ).all(npm_name) as Record<string, unknown>[];
}

// ─── FT-3: build / dep / CI health ──────────────────────────────────────────

/**
 * Closed enum of valid `last_ci_status` values for repos. Enforced at the
 * application layer (same reason as lifecycle_status + publisher_method —
 * SQLite ADD COLUMN can't include a self-referential CHECK constraint and
 * we want migrations idempotent).
 *
 *   - 'passing'     — most recent observed CI run succeeded
 *   - 'failing'     — most recent run failed / cancelled / timed_out
 *   - 'unknown'     — gh probe failed (auth missing, network, no runs yet)
 *   - 'no_workflow' — repo has no detectable CI workflow file
 */
export const CI_STATUSES = [
  'passing',
  'failing',
  'unknown',
  'no_workflow',
] as const;
export type CiStatus = typeof CI_STATUSES[number];

/**
 * JSON-shaped pin for toolchain versions. All fields optional — different
 * repos pin different subsets (a Python project may only set `python`).
 * Stored as JSON.stringify(this) in repos.toolchain_pin. Helpers below
 * handle the round-trip so callers never serialize by hand.
 */
export interface ToolchainPin {
  node?: string;
  typescript?: string;
  python?: string;
  rust?: string;
}

export interface DepAuditStateRow {
  repo_id: number;
  severity_critical: number;
  severity_high: number;
  severity_moderate: number;
  severity_low: number;
  last_checked_at: string;
  last_clean_at: string | null;
  tool: string;
  // Per Pu 2026 (NDSS, "Reachability Analysis of Vulnerabilities in
  // JavaScript Programs"): 68.28% of npm audit findings are
  // unreachable in production builds. Storing CVE IDs (not just
  // counts) lets downstream tools EPSS-join (Jacobs 2021, ROC AUC
  // 0.838) and KEV-intersect for the high-signal subset.
  critical_cve_ids: string | null;  // JSON array of CVE/GHSA ids
  high_cve_ids: string | null;       // JSON array of CVE/GHSA ids
  // Per Latendresse 2022 (arXiv:2207.14711): <1% of installed deps
  // reach production. audit_omit_dev tracks whether the run excluded
  // devDependencies — the difference between the two snapshots is the
  // "dev-only noise" portion.
  audit_omit_dev: number;            // 0 | 1
}

export interface DepAuditHistoryRow {
  id: number;
  repo_id: number;
  taken_at: string;
  severity_critical: number;
  severity_high: number;
  severity_moderate: number;
  severity_low: number;
  critical_cve_ids: string | null;
  high_cve_ids: string | null;
  audit_omit_dev: number;
  tool: string;
}

/**
 * Pin-quality enum at the application layer. Per OpenSSF 2024: SHA is
 * the only immutable reference. The migration cannot include a CHECK
 * constraint because of the same self-referential ALTER COLUMN
 * limitation as lifecycle_status / publisher_method, so we enforce
 * the closed set here.
 *
 *   'sha'              — 40-char hex commit SHA (CISA Mar 2025 immune
 *                        to tag-rewrite attacks like CVE-2025-30066)
 *   'immutable-semver' — vN.M.P AND publisher has Immutable Releases
 *                        enabled (GitHub Immutable Actions 2025: flips
 *                        risk profile for semver pins)
 *   'mutable-semver'   — vN.M.P with no immutable guarantee (the
 *                        default for most actions today)
 *   'major'            — vN (e.g. @v5) — follows latest within major
 *   'branch'           — main / master / any branch name (worst case)
 */
export const PIN_QUALITIES = [
  'sha',
  'immutable-semver',
  'mutable-semver',
  'major',
  'branch',
] as const;
export type PinQuality = typeof PIN_QUALITIES[number];

export interface WorkflowActionRow {
  id: number;
  repo_id: number;
  workflow_file: string;
  action_ref: string;
  pinned_version: string;
  latest_known: string | null;
  last_checked_at: string;
  // Per CISA Mar 2025 (CVE-2025-30066, tj-actions tag-rewrite attack):
  // resolved_sha lets downstream alerting detect tag rewrites.
  // Resolution is best-effort (gh api repos/<owner>/<name>/commits/<ref>),
  // NULL when probe failed or when the ref itself was already a SHA.
  resolved_sha: string | null;
  pin_quality: string | null;          // one of PIN_QUALITIES (or null pre-grade)
  immutable_publisher: number;          // 0 | 1
}

export interface WorkflowPermissionsRow {
  id: number;
  repo_id: number;
  workflow_file: string;
  // JSON of the permissions: block, or the literal string "default"
  // when the workflow root has no permissions: key (the most permissive
  // configuration — default token write to repo contents).
  permissions_json: string | null;
  last_checked_at: string;
}

export interface ObservedToolchainRow {
  id: number;
  repo_id: number;
  rig_id: string;
  tool: string;
  observed_version: string;
  observed_at: string;
}

export interface PortfolioHealthRow {
  slug: string;
  lifecycle_status: string | null;
  last_ci_status: string | null;
  severity_critical: number;
  severity_high: number;
  workflow_action_count: number;
  // Per Pu 2026 / Latendresse 2022: include CVE IDs + dev-scope so
  // the table renderer can drop critical-with-no-KEV-intersect noise
  // rather than alert on a count that may be 95% unreachable.
  critical_cve_ids: string | null;
  high_cve_ids: string | null;
  audit_omit_dev: number;
  last_ci_run_at: string | null;
  last_ci_url: string | null;
  toolchain_pin: string | null;
}

export interface DepAuditStateUpsert {
  repo_id: number | bigint;
  severity_critical: number;
  severity_high: number;
  severity_moderate: number;
  severity_low: number;
  tool: string;
  critical_cve_ids?: string[] | null;
  high_cve_ids?: string[] | null;
  audit_omit_dev?: boolean;
}

/**
 * Insert-or-replace the (one-and-only) audit-state row for a repo.
 * `last_checked_at` is always refreshed to datetime('now') — every call
 * is "I just ran the auditor again."
 *
 * `last_clean_at` is set to the current time IFF
 * (severity_critical + severity_high) == 0; otherwise the prior value is
 * preserved (a fresh dirty run shouldn't erase the timestamp of the last
 * known-clean state). Because we do this with INSERT OR REPLACE, we
 * read-then-write inside a transaction so we can carry the prior
 * last_clean_at across the replace.
 *
 * Per Pu 2026 (NDSS): we accept critical_cve_ids / high_cve_ids arrays
 * so the latest projection carries the actual CVE/GHSA IDs alongside
 * the counts. Per Latendresse 2022: audit_omit_dev distinguishes
 * prod-only runs from full-tree runs.
 */
export function upsertDepAuditState(args: DepAuditStateUpsert): void {
  const db = getDb();
  const isClean = (args.severity_critical + args.severity_high) === 0;
  // Serialize the CVE arrays for SQLite TEXT storage. undefined means
  // "don't touch" — defaults to null; explicit null clears.
  const criticalCves = args.critical_cve_ids === undefined
    ? null
    : args.critical_cve_ids === null
      ? null
      : JSON.stringify(args.critical_cve_ids);
  const highCves = args.high_cve_ids === undefined
    ? null
    : args.high_cve_ids === null
      ? null
      : JSON.stringify(args.high_cve_ids);
  const omitDev = args.audit_omit_dev ? 1 : 0;

  const tx = db.transaction(() => {
    const prior = db.prepare(
      'SELECT last_clean_at FROM repo_dep_audit_state WHERE repo_id = ?'
    ).get(args.repo_id) as { last_clean_at: string | null } | undefined;

    // If clean now → stamp now (use datetime('now') for format parity
    // with last_checked_at). If not clean → carry the prior value (so
    // "we haven't seen a clean run since X" stays valid). If no prior
    // row and not clean → leave NULL.
    if (isClean) {
      db.prepare(`
        INSERT OR REPLACE INTO repo_dep_audit_state
          (repo_id, severity_critical, severity_high, severity_moderate,
           severity_low, last_checked_at, last_clean_at, tool,
           critical_cve_ids, high_cve_ids, audit_omit_dev)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?, ?)
      `).run(
        args.repo_id,
        args.severity_critical,
        args.severity_high,
        args.severity_moderate,
        args.severity_low,
        args.tool,
        criticalCves,
        highCves,
        omitDev
      );
    } else {
      const lastCleanAt = prior?.last_clean_at ?? null;
      db.prepare(`
        INSERT OR REPLACE INTO repo_dep_audit_state
          (repo_id, severity_critical, severity_high, severity_moderate,
           severity_low, last_checked_at, last_clean_at, tool,
           critical_cve_ids, high_cve_ids, audit_omit_dev)
        VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)
      `).run(
        args.repo_id,
        args.severity_critical,
        args.severity_high,
        args.severity_moderate,
        args.severity_low,
        lastCleanAt,
        args.tool,
        criticalCves,
        highCves,
        omitDev
      );
    }
  });
  tx();
}

/**
 * Append a snapshot row to repo_dep_audit_history AND update the
 * "latest" projection row in repo_dep_audit_state.
 *
 * Per VulnCheck Q1 2025: 28.3% of exploited CVEs land within 24h of
 * disclosure → callers need deltas, not absolute counts. The history
 * table is the source for "critical: 0 -> 2" alerts; the state table
 * stays the fast-path projection for portfolio queries.
 *
 * Atomic: history insert + state upsert run inside one transaction so
 * a concurrent reader never sees the projection without its matching
 * history row (or vice versa).
 */
export function appendDepAuditHistory(args: DepAuditStateUpsert): void {
  const db = getDb();
  const criticalCves = args.critical_cve_ids === undefined
    ? null
    : args.critical_cve_ids === null
      ? null
      : JSON.stringify(args.critical_cve_ids);
  const highCves = args.high_cve_ids === undefined
    ? null
    : args.high_cve_ids === null
      ? null
      : JSON.stringify(args.high_cve_ids);
  const omitDev = args.audit_omit_dev ? 1 : 0;

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO repo_dep_audit_history
        (repo_id, taken_at, severity_critical, severity_high,
         severity_moderate, severity_low, critical_cve_ids,
         high_cve_ids, audit_omit_dev, tool)
      VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      args.repo_id,
      args.severity_critical,
      args.severity_high,
      args.severity_moderate,
      args.severity_low,
      criticalCves,
      highCves,
      omitDev,
      args.tool
    );
    // Also refresh the projection so single-row reads stay fast.
    // upsertDepAuditState handles the last_clean_at carry forward.
    upsertDepAuditState(args);
  });
  tx();
}

/**
 * Return the most-recent N snapshots for a repo, newest first. Used
 * by the feed renderer to compute deltas between the latest and the
 * prior snapshot. Default limit of 10 mirrors the CI run-list default
 * (and is plenty for "what changed in the last day or two").
 */
export function getDepAuditHistory(
  repo_id: number | bigint,
  limit: number = 10
): DepAuditHistoryRow[] {
  const db = getDb();
  // ORDER BY taken_at DESC, id DESC: SQLite's datetime('now') has
  // second-resolution, so multiple inserts in the same second tie at
  // the timestamp. id DESC breaks the tie in insertion order (newest
  // last-inserted wins), which is what callers expect from "newest
  // first."
  return db.prepare(`
    SELECT * FROM repo_dep_audit_history
     WHERE repo_id = ?
     ORDER BY taken_at DESC, id DESC
     LIMIT ?
  `).all(repo_id, limit) as DepAuditHistoryRow[];
}

export function getDepAuditState(repo_id: number | bigint): DepAuditStateRow | null {
  const db = getDb();
  const row = db.prepare(
    'SELECT * FROM repo_dep_audit_state WHERE repo_id = ?'
  ).get(repo_id) as DepAuditStateRow | undefined;
  return row ?? null;
}

export interface WorkflowActionUpsert {
  repo_id: number | bigint;
  workflow_file: string;
  action_ref: string;
  pinned_version: string;
  latest_known?: string | null;
  // Per CISA Mar 2025 (CVE-2025-30066, tj-actions tag-rewrite):
  // resolved_sha is the only immutable reference per OpenSSF 2024.
  // Best-effort populated by the scanner; undefined leaves it intact.
  resolved_sha?: string | null;
  // Per OpenSSF 2024 + Alvarez 2025: classify, grade, recommend —
  // don't auto-fail (only 7/100 OSS projects SHA-pin everything).
  pin_quality?: PinQuality | null;
  // Per GitHub Immutable Actions (2025): flips @v5 risk to OK when
  // publisher opts in. Best-effort probe.
  immutable_publisher?: boolean | null;
}

/**
 * Insert-or-update a (repo_id, workflow_file, action_ref) row.
 *
 * pinned_version is always overwritten with the latest scan (the YAML is
 * the source of truth for "what's pinned right now"). latest_known,
 * resolved_sha, pin_quality, and immutable_publisher are coalesced —
 * pass undefined to leave the existing value intact, pass an explicit
 * value (including null) to overwrite. This mirrors the read-then-write
 * cycle of a registry probe that doesn't always have every field.
 *
 * Validates pin_quality against PIN_QUALITIES when provided — throws
 * on out-of-enum values rather than silently writing garbage. Per
 * OpenSSF 2024 the closed set is load-bearing for the table renderer.
 *
 * `last_checked_at` is always refreshed to datetime('now') because every
 * call represents a fresh scan.
 */
export function upsertWorkflowAction(args: WorkflowActionUpsert): void {
  if (
    args.pin_quality !== undefined &&
    args.pin_quality !== null &&
    !PIN_QUALITIES.includes(args.pin_quality)
  ) {
    throw new Error(
      `Invalid pin_quality: ${JSON.stringify(args.pin_quality)} — must be one of ${PIN_QUALITIES.join(', ')}`
    );
  }
  const db = getDb();
  const immutablePublisher =
    args.immutable_publisher === undefined
      ? null
      : args.immutable_publisher
        ? 1
        : 0;
  db.prepare(`
    INSERT INTO repo_workflow_actions
      (repo_id, workflow_file, action_ref, pinned_version,
       latest_known, last_checked_at,
       resolved_sha, pin_quality, immutable_publisher)
    VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, coalesce(?, 0))
    ON CONFLICT(repo_id, workflow_file, action_ref) DO UPDATE SET
      pinned_version      = excluded.pinned_version,
      latest_known        = coalesce(excluded.latest_known, latest_known),
      resolved_sha        = coalesce(excluded.resolved_sha, resolved_sha),
      pin_quality         = coalesce(excluded.pin_quality, pin_quality),
      immutable_publisher = coalesce(?, immutable_publisher),
      last_checked_at     = datetime('now')
  `).run(
    args.repo_id,
    args.workflow_file,
    args.action_ref,
    args.pinned_version,
    n(args.latest_known),
    n(args.resolved_sha),
    n(args.pin_quality ?? null),
    immutablePublisher,
    immutablePublisher
  );
}

export function listWorkflowActions(repo_id: number | bigint): WorkflowActionRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM repo_workflow_actions WHERE repo_id = ? ORDER BY workflow_file, action_ref'
  ).all(repo_id) as WorkflowActionRow[];
}

export interface WorkflowPermissionsUpsert {
  repo_id: number | bigint;
  workflow_file: string;
  // Pass the literal string "default" when no permissions: block was
  // found at the workflow root (the most-permissive case per Beyer 2016
  // SRE Workbook Ch.5). Pass a JSON stringified object for an explicit
  // block. null clears.
  permissions_json: string | null;
}

/**
 * Insert-or-update a (repo_id, workflow_file) permissions row. Updates
 * `last_checked_at` on every call.
 *
 * Per Beyer 2016 (SRE Workbook Ch.5): permissions: blocks limit blast
 * radius — a repo with all SHA pins but no permissions: block is still
 * exposed if any action gets compromised. We capture the block so
 * compound risk scoring can fold workflow scope into the pin grade.
 */
export function upsertWorkflowPermissions(args: WorkflowPermissionsUpsert): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_workflow_permissions
      (repo_id, workflow_file, permissions_json, last_checked_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, workflow_file) DO UPDATE SET
      permissions_json = excluded.permissions_json,
      last_checked_at  = datetime('now')
  `).run(args.repo_id, args.workflow_file, n(args.permissions_json));
}

export function listWorkflowPermissions(
  repo_id: number | bigint
): WorkflowPermissionsRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM repo_workflow_permissions WHERE repo_id = ? ORDER BY workflow_file'
  ).all(repo_id) as WorkflowPermissionsRow[];
}

export interface ObservedToolchainUpsert {
  repo_id: number | bigint;
  rig_id: string;
  tool: string;
  observed_version: string;
}

/**
 * Insert-or-update an observed (repo, rig, tool) → version row.
 *
 * Per JetBrains 2025 drift report: drift = declared (repos.toolchain_pin
 * from migration-008) - observed (this table — what's actually
 * installed on each rig). UNIQUE(repo_id, rig_id, tool) keeps one row
 * per tool per rig; re-running the observer overwrites observed_version
 * + observed_at.
 */
export function upsertObservedToolchain(args: ObservedToolchainUpsert): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_observed_toolchain
      (repo_id, rig_id, tool, observed_version, observed_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, rig_id, tool) DO UPDATE SET
      observed_version = excluded.observed_version,
      observed_at      = datetime('now')
  `).run(args.repo_id, args.rig_id, args.tool, args.observed_version);
}

export function listObservedToolchain(
  repo_id: number | bigint
): ObservedToolchainRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM repo_observed_toolchain WHERE repo_id = ? ORDER BY rig_id, tool'
  ).all(repo_id) as ObservedToolchainRow[];
}

export interface ToolchainDriftRow {
  repo_id: number;
  rig_id: string;
  tool: string;
  declared_version: string | null;
  observed_version: string;
  observed_at: string;
}

/**
 * Return (declared, observed) pairs for a repo where declared ≠
 * observed. Declared comes from repos.toolchain_pin (parsed JSON);
 * observed from repo_observed_toolchain.
 *
 * Per JetBrains 2025: drift is the actionable signal — the absolute
 * versions matter less than the gap. NULL declared (no pin) is NOT
 * drift (the repo opted out of pinning); only mismatched values are.
 */
export function getToolchainDrift(repo_id: number | bigint): ToolchainDriftRow[] {
  const db = getDb();
  const repo = db.prepare(
    'SELECT toolchain_pin FROM repos WHERE id = ?'
  ).get(repo_id) as { toolchain_pin: string | null } | undefined;
  if (!repo || !repo.toolchain_pin) return [];

  let declared: Record<string, string>;
  try {
    declared = JSON.parse(repo.toolchain_pin) as Record<string, string>;
  } catch {
    return [];
  }

  const observed = listObservedToolchain(repo_id);
  const drift: ToolchainDriftRow[] = [];
  for (const o of observed) {
    const dv = declared[o.tool] ?? null;
    // Drift requires (a) a declared value AND (b) it doesn't match observed.
    // No-pin (dv null) is opt-out, not drift.
    if (dv !== null && dv !== o.observed_version) {
      drift.push({
        repo_id: o.repo_id,
        rig_id: o.rig_id,
        tool: o.tool,
        declared_version: dv,
        observed_version: o.observed_version,
        observed_at: o.observed_at,
      });
    }
  }
  return drift;
}

/**
 * Update the three CI-status columns on repos. Validates the enum at the
 * application layer (the migration doesn't have a CHECK constraint).
 * undefined values leave the existing column intact; explicit null
 * clears. status MUST be one of CI_STATUSES — out-of-enum throws.
 *
 * Returns { updated: false } if the repo_id doesn't exist.
 */
export function setRepoCiStatus(
  repo_id: number | bigint,
  args: { status: CiStatus; run_at?: string | null; url?: string | null }
): { updated: boolean } {
  if (!CI_STATUSES.includes(args.status)) {
    throw new Error(
      `Invalid CI status: ${JSON.stringify(args.status)} — must be one of ${CI_STATUSES.join(', ')}`
    );
  }
  const db = getDb();
  // Build dynamic SET so undefined leaves columns alone; we always write
  // last_ci_status because it's the load-bearing field.
  const sets: string[] = ['last_ci_status = ?'];
  const params: (string | number | bigint | null)[] = [args.status];
  if (args.run_at !== undefined) {
    sets.push('last_ci_run_at = ?');
    params.push(args.run_at);
  }
  if (args.url !== undefined) {
    sets.push('last_ci_url = ?');
    params.push(args.url);
  }
  params.push(repo_id);
  const r = db.prepare(
    `UPDATE repos SET ${sets.join(', ')} WHERE id = ?`
  ).run(...params);
  return { updated: r.changes > 0 };
}

/**
 * Persist a toolchain-pin JSON object onto repos.toolchain_pin. We
 * JSON.stringify here so callers can pass the structured shape directly
 * without thinking about serialization. Pass an empty object `{}` to
 * explicitly clear vs. an unset state — both result in the same DB
 * representation, but `null` (via the explicit clear path) is more
 * conventional.
 *
 * Returns { updated: false } if repo_id doesn't exist.
 */
export function setRepoToolchainPin(
  repo_id: number | bigint,
  pin: ToolchainPin | null
): { updated: boolean } {
  const db = getDb();
  const value = pin === null ? null : JSON.stringify(pin);
  const r = db.prepare(
    'UPDATE repos SET toolchain_pin = ? WHERE id = ?'
  ).run(value, repo_id);
  return { updated: r.changes > 0 };
}

/**
 * Portfolio-health rollup — one row per repo with lifecycle + CI status
 * + worst-tier audit counts + workflow-action count + CVE IDs + CI
 * timestamp/url + toolchain pin.
 *
 * Per Pu 2026 (NDSS) / Latendresse 2022 (arXiv:2207.14711): we expose
 * critical_cve_ids + high_cve_ids + audit_omit_dev so the table
 * renderer can drop unreachable-noise findings and surface only the
 * KEV-intersected subset (CISA KEV: 0.004% of CVEs actually exploited).
 *
 * LEFT JOIN against repo_dep_audit_state and a subquery COUNT so repos
 * that have never been scanned still appear (with zeros). Sorted by
 * severity_critical DESC, severity_high DESC, then slug — riskiest first
 * for the dashboard. The composite index added by migration-008
 * (idx_dep_audit_severity) covers the JOIN-side sort.
 */
export function getPortfolioHealth(): PortfolioHealthRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      r.slug                                    AS slug,
      r.lifecycle_status                        AS lifecycle_status,
      r.last_ci_status                          AS last_ci_status,
      r.last_ci_run_at                          AS last_ci_run_at,
      r.last_ci_url                             AS last_ci_url,
      r.toolchain_pin                           AS toolchain_pin,
      coalesce(d.severity_critical, 0)          AS severity_critical,
      coalesce(d.severity_high, 0)              AS severity_high,
      d.critical_cve_ids                        AS critical_cve_ids,
      d.high_cve_ids                            AS high_cve_ids,
      coalesce(d.audit_omit_dev, 0)             AS audit_omit_dev,
      coalesce(wa.action_count, 0)              AS workflow_action_count
    FROM repos r
    LEFT JOIN repo_dep_audit_state d ON d.repo_id = r.id
    LEFT JOIN (
      SELECT repo_id, COUNT(*) AS action_count
      FROM repo_workflow_actions
      GROUP BY repo_id
    ) wa ON wa.repo_id = r.id
    ORDER BY
      coalesce(d.severity_critical, 0) DESC,
      coalesce(d.severity_high, 0) DESC,
      r.slug ASC
  `).all() as PortfolioHealthRow[];
}

// ─── FT-4: operational hygiene run tables ───────────────────────────────────

export interface DbHealthRunRow {
  id: number;
  run_at: string;
  repo_count: number | null;
  fts_entry_count: number | null;
  orphan_path_count: number | null;
  broken_relationship_count: number | null;
  null_local_path_active_count: number | null;
  stale_local_path_count: number | null;
  exit_code: number;
}

export interface DbHealthRunInsert {
  run_at?: string;
  repo_count?: number | null;
  fts_entry_count?: number | null;
  orphan_path_count?: number | null;
  broken_relationship_count?: number | null;
  null_local_path_active_count?: number | null;
  stale_local_path_count?: number | null;
  exit_code: number;
}

/**
 * Insert a single audit-trail row for a `rk fsck` run.
 *
 * `run_at` defaults to datetime('now') if not provided. The exit_code is
 * required (0 = clean / non-strict, 1 = --strict and any check non-zero);
 * counts are individually nullable so a caller that opts out of a check
 * (e.g. stale_local_path is rig-dependent and informational) can pass
 * undefined.
 *
 * Returns the inserted row id as a plain number — better-sqlite3 returns
 * bigint for INTEGER PRIMARY KEY AUTOINCREMENT, but the row IDs here
 * stay well within Number.MAX_SAFE_INTEGER and Number() keeps the
 * downstream type ergonomic.
 */
export function insertDbHealthRun(args: DbHealthRunInsert): number {
  const db = getDb();
  const r = db.prepare(`
    INSERT INTO db_health_runs (
      run_at, repo_count, fts_entry_count, orphan_path_count,
      broken_relationship_count, null_local_path_active_count,
      stale_local_path_count, exit_code
    ) VALUES (
      coalesce(?, datetime('now')), ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    n(args.run_at),
    n(args.repo_count),
    n(args.fts_entry_count),
    n(args.orphan_path_count),
    n(args.broken_relationship_count),
    n(args.null_local_path_active_count),
    n(args.stale_local_path_count),
    args.exit_code
  );
  return Number(r.lastInsertRowid);
}

/**
 * Most-recent N db_health_runs rows, newest first. Default of 20 matches
 * the `rk runs` operator surface. Ordered by run_at DESC, id DESC so
 * multiple inserts inside the same second tie-break in insertion order.
 */
export function listDbHealthRuns(limit: number = 20): DbHealthRunRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM db_health_runs
     ORDER BY run_at DESC, id DESC
     LIMIT ?
  `).all(limit) as DbHealthRunRow[];
}

/**
 * Convenience accessor for the most recent fsck run, or null if none
 * have been recorded yet. Used by `rk runs` summary line.
 */
export function getLatestDbHealthRun(): DbHealthRunRow | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM db_health_runs
     ORDER BY run_at DESC, id DESC
     LIMIT 1
  `).get() as DbHealthRunRow | undefined;
  return row ?? null;
}

export interface SyncRunRow {
  id: number;
  started_at: string;
  finished_at: string | null;
  owners_json: string | null;
  dirs_scanned_json: string | null;
  repos_added: number;
  repos_updated: number;
  repos_skipped: number;
  errors_json: string | null;
  exit_code: number;
}

export interface SyncRunInsert {
  started_at?: string;
  owners_json?: string | null;
  dirs_scanned_json?: string | null;
  exit_code?: number;
}

export interface SyncRunComplete {
  finished_at?: string;
  repos_added?: number;
  repos_updated?: number;
  repos_skipped?: number;
  errors_json?: string | null;
  exit_code: number;
}

/**
 * Insert a sync_runs row at the START of a sync invocation. Returns the
 * row id so the caller can pass it to completeSyncRun() at the
 * end-of-sync (normal completion or thrown error path).
 *
 * `started_at` defaults to datetime('now'); owners_json + dirs_scanned_json
 * are JSON-serialized strings that the caller produces (the helper does
 * NOT JSON.stringify on the caller's behalf — passing an empty-string,
 * "[]", or a partial scan record is up to the caller and we don't want
 * to silently rewrite "null" vs an empty array). exit_code defaults to 0
 * so an in-progress row registers as "no error yet."
 */
export function insertSyncRun(args: SyncRunInsert): number {
  const db = getDb();
  const r = db.prepare(`
    INSERT INTO sync_runs (
      started_at, owners_json, dirs_scanned_json, exit_code
    ) VALUES (
      coalesce(?, datetime('now')), ?, ?, coalesce(?, 0)
    )
  `).run(
    n(args.started_at),
    n(args.owners_json),
    n(args.dirs_scanned_json),
    n(args.exit_code)
  );
  return Number(r.lastInsertRowid);
}

/**
 * Update an existing sync_runs row at end-of-sync (normal completion or
 * thrown error). `finished_at` defaults to datetime('now') if not
 * provided. `exit_code` is required — the caller knows whether they're
 * recording a clean exit (0) or a thrown error (1).
 *
 * undefined counts default to 0 (the in-progress row already has 0 from
 * insertSyncRun's INSERT DEFAULTs; passing undefined here re-writes 0,
 * which is a no-op semantically). errors_json defaults to null on a
 * clean exit; on a thrown error path the caller passes a JSON string.
 */
export function completeSyncRun(id: number | bigint, args: SyncRunComplete): void {
  const db = getDb();
  db.prepare(`
    UPDATE sync_runs SET
      finished_at   = coalesce(?, datetime('now')),
      repos_added   = coalesce(?, repos_added),
      repos_updated = coalesce(?, repos_updated),
      repos_skipped = coalesce(?, repos_skipped),
      errors_json   = ?,
      exit_code     = ?
    WHERE id = ?
  `).run(
    n(args.finished_at),
    n(args.repos_added),
    n(args.repos_updated),
    n(args.repos_skipped),
    n(args.errors_json),
    args.exit_code,
    id
  );
}

/**
 * Most-recent N sync_runs rows, newest first. Default of 20 matches the
 * `rk runs --sync` operator surface. Ordered by started_at DESC, id DESC
 * so multiple inserts inside the same second tie-break in insertion
 * order.
 */
export function listSyncRuns(limit: number = 20): SyncRunRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM sync_runs
     ORDER BY started_at DESC, id DESC
     LIMIT ?
  `).all(limit) as SyncRunRow[];
}

// ─── FT-5: cross-tool vocabulary + forge-vault path ─────────────────────────

/**
 * Set the `forge_vault_path` on a repo by slug. Game repos point at their
 * forge-vault wing (offline narrative / asset registry that lives outside
 * the repo itself); non-game repos leave it NULL.
 *
 * Pass null to explicitly clear a previously-set path. Returns
 * { updated: false } if the slug doesn't exist.
 *
 * The column is plain TEXT — we do not validate that the path actually
 * exists on the rig running the call (forge-vaults can be on shared
 * storage that only one rig mounts).
 */
export function setRepoForgeVaultPath(
  slug: string,
  forgeVaultPath: string | null
): { updated: boolean } {
  const db = getDb();
  const r = db.prepare(
    'UPDATE repos SET forge_vault_path = ? WHERE slug = ?'
  ).run(forgeVaultPath, slug);
  return { updated: r.changes > 0 };
}

/**
 * Get the forge_vault_path for a repo by slug. Returns null if the slug
 * doesn't exist OR if the column is NULL. Callers that need to
 * distinguish those two cases should use getRepo() instead — getRepo's
 * full row includes the column verbatim.
 */
export function getRepoForgeVaultPath(slug: string): string | null {
  const db = getDb();
  const row = db.prepare(
    'SELECT forge_vault_path FROM repos WHERE slug = ?'
  ).get(slug) as { forge_vault_path: string | null } | undefined;
  return row?.forge_vault_path ?? null;
}
