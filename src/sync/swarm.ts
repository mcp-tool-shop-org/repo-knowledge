/**
 * Swarm control-plane sync — one-way read from the dogfood-labs swarm
 * control plane (swarms/control-plane.db) into repo_facts.
 *
 * The swarm control plane (dogfood-labs/tools/swarm) is the SQLite write
 * authority for swarm runs and their deduplicated findings. On rigs where
 * the YAML intelligence store (findings/, patterns/, doctrine/) was never
 * populated, this DB is the only dogfood intelligence source — without it
 * sync-dogfood reports zeros while hundreds of verified findings sit in
 * the control plane.
 *
 * Read model rules (same as dogfood.ts):
 *  - the control plane remains sole write authority; we open read-only
 *  - facts mirror the LATEST run per repo; re-sync replaces, never appends
 *  - raw swarm findings get their own fact namespace (dogfood.swarm.*) —
 *    they are unreviewed audit output, NOT the curated intelligence layer
 *    (dogfood.finding / dogfood.pattern / ...), which stays accepted-only
 */
import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { join } from 'path';
import { upsertFact, getRepoIdBySlug, getDb } from '../db/init.js';

const SOURCE_PATH = 'dogfood-labs/swarms/control-plane.db';

export interface SwarmSyncResult {
  runs: number;
  findings: number;
  open_findings: number;
  facts_upserted: number;
  skipped: string[];
}

interface SwarmRun {
  id: string;
  repo: string;
  status: string;
  commit_sha: string;
  created_at: string;
}

interface SwarmFinding {
  finding_id: string;
  severity: string;
  category: string;
  file_path: string | null;
  line_number: number | null;
  description: string;
  recommendation: string | null;
  status: string;
}

// 'deferred' is consciously postponed and 'rejected' is noise — neither is
// open work. Everything still awaiting a fix counts as open.
const OPEN_STATUSES = new Set(['new', 'recurring', 'approved']);
const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Sync swarm control-plane findings into repo_facts.
 *
 * Returns null when the local checkout has no control-plane DB (not every
 * dogfood-labs clone runs swarms) so the caller can skip the report line.
 */
export function syncSwarmControlPlane(localPath: string): SwarmSyncResult | null {
  const dbPath = join(localPath, 'swarms', 'control-plane.db');
  if (!existsSync(dbPath)) return null;

  const swarmDb = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    // Latest run per repo — older runs describe a repo state that has since
    // been re-audited. Mirrors the latest-by-repo.json semantics of the
    // main dogfood sync.
    //
    // ts-A-005: ORDER BY created_at ALONE is NOT a deterministic tie-break.
    // When two runs share a created_at, SQLite is free to return them in
    // any order, so the Map-overwrite "winner" was undefined run-to-run.
    // We add `id` as a secondary key: created_at ASC, id ASC means the
    // greatest id among same-timestamp runs is iterated LAST and wins the
    // Map overwrite — a stable, reproducible choice.
    const allRuns = swarmDb.prepare(
      'SELECT id, repo, status, commit_sha, created_at FROM runs ORDER BY created_at ASC, id ASC',
    ).all() as SwarmRun[];
    const latestByRepo = new Map<string, SwarmRun>();
    for (const run of allRuns) latestByRepo.set(run.repo, run);

    const findingsForRun = swarmDb.prepare(`
      SELECT finding_id, severity, category, file_path, line_number,
             description, recommendation, status
      FROM findings WHERE run_id = ?
    `);

    const db = getDb();
    const skipped: string[] = [];
    let runCount = 0;
    let findingCount = 0;
    let openCount = 0;
    let factsUpserted = 0;

    for (const run of latestByRepo.values()) {
      const repoId = getRepoIdBySlug(run.repo);
      if (!repoId) {
        skipped.push(`${run.repo} — not in repo-knowledge DB (run \`rk sync\` to ingest)`);
        continue;
      }

      const findings = findingsForRun.all(run.id) as SwarmFinding[];

      // SYNC-PH-05 (Stage-C verify): fold per-run deltas into LOCAL vars inside
      // the tx and only add them to the outer counters AFTER tx() commits —
      // a JS variable mutation is NOT rolled back when the DB transaction is,
      // so mutating the outer counters inside the closure would inflate them
      // on a rollback. Mirrors the dogfood.ts fold-only-on-commit pattern.
      const tx = db.transaction((): { facts: number; findings: number; open: number } => {
        let localFacts = 0;
        // SYNC-PH-05: capture the pre-DELETE finding-fact count so we can log
        // a one-line delta — a DELETE-then-reinsert with no delta record
        // leaves the operator blind to whether a re-audit shrank, grew, or
        // churned the finding set. We count BEFORE the DELETE; the post count
        // is the number of findings we actually upsert below.
        const priorFindingCount = (db.prepare(
          "SELECT COUNT(*) AS n FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm.finding'",
        ).get(repoId) as { n: number }).n;

        // Replace, don't accumulate: a re-audit produces a new run with new
        // finding ids, and stale facts from the previous run would otherwise
        // linger beside the fresh ones.
        db.prepare(
          "DELETE FROM repo_facts WHERE repo_id = ? AND fact_type IN ('dogfood.swarm', 'dogfood.swarm.finding')",
        ).run(repoId);

        const openBySeverity = new Map<string, number>();
        let open = 0;
        let fixed = 0;
        let upsertedFindings = 0;

        for (const f of findings) {
          // SYNC-PH-05: finding_id is the fact KEY and severity drives the
          // open-by-severity rollup; an empty/blank value for either would
          // upsert a keyless or unbucketed fact. Skip-with-warn instead so a
          // drifted control-plane row doesn't silently corrupt the rollup.
          if (typeof f.finding_id !== 'string' || f.finding_id.trim() === '' ||
              typeof f.severity !== 'string' || f.severity.trim() === '') {
            skipped.push(`${run.repo} — swarm finding skipped: empty finding_id or severity`);
            console.error(
              `[swarm-sync] ${run.repo}: skipping swarm finding with empty finding_id or severity`,
            );
            continue;
          }

          upsertFact(repoId, 'dogfood.swarm.finding', f.finding_id, JSON.stringify({
            severity: f.severity,
            category: f.category,
            file_path: f.file_path,
            line_number: f.line_number,
            description: f.description,
            recommendation: f.recommendation,
            status: f.status,
            run_id: run.id,
          }), 'detected', SOURCE_PATH);
          localFacts++;
          upsertedFindings++;

          if (OPEN_STATUSES.has(f.status)) {
            open++;
            openBySeverity.set(f.severity, (openBySeverity.get(f.severity) ?? 0) + 1);
          } else if (f.status === 'fixed') {
            fixed++;
          }
        }

        // SYNC-PH-05: one-line delta to stderr (progress/diagnostic channel).
        console.error(
          `[swarm-sync] ${run.repo}: ${priorFindingCount} -> ${upsertedFindings} swarm findings`,
        );

        const severityRollup = SEVERITY_ORDER
          .map((s) => `${s}=${openBySeverity.get(s) ?? 0}`)
          .join(',');

        const rollups: [string, string][] = [
          ['run:id', run.id],
          ['run:status', run.status],
          ['run:created_at', run.created_at],
          ['run:commit_sha', run.commit_sha],
          // SYNC-PH-05: total reflects findings actually upserted, not the
          // raw row count — skipped (empty finding_id/severity) rows are not
          // synced facts and would otherwise inflate the rollup.
          ['findings:total', String(upsertedFindings)],
          ['findings:open', String(open)],
          ['findings:fixed', String(fixed)],
          ['findings:open_by_severity', severityRollup],
        ];
        for (const [key, value] of rollups) {
          upsertFact(repoId, 'dogfood.swarm', key, value, 'detected', SOURCE_PATH);
          localFacts++;
        }

        return { facts: localFacts, findings: upsertedFindings, open };
      });

      // Per-run resilience (Stage-C verify): one drifted swarm run must not
      // abort the sync for every remaining repo. Fold the deltas only after
      // tx() commits; on failure, skip-and-continue (mirrors dogfood.ts).
      try {
        const delta = tx();
        runCount++;
        factsUpserted += delta.facts;
        findingCount += delta.findings;
        openCount += delta.open;
      } catch (e: unknown) {
        skipped.push(`${run.repo} — swarm sync failed (rolled back): ${(e as Error).message}`);
        console.error(`[swarm-sync] ${run.repo}: sync failed, skipped — ${(e as Error).message}`);
      }
    }

    return {
      runs: runCount,
      findings: findingCount,
      open_findings: openCount,
      facts_upserted: factsUpserted,
      skipped,
    };
  } finally {
    swarmDb.close();
  }
}
