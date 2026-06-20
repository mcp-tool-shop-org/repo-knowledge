/**
 * Dogfood intelligence retrieval — query synced intelligence facts.
 *
 * Answers: "What should this repo/surface inherit from dogfood learning?"
 * Reads from repo_facts (synced by syncDogfood), not from testing-os directly.
 */
import { getDb, getRepoIdBySlug } from '../db/init.js';

export interface DogfoodSuggestion {
  findings: SuggestedFinding[];
  patterns: SuggestedPattern[];
  recommendations: SuggestedRecommendation[];
  doctrine: SuggestedDoctrine[];
}

interface SuggestedFinding {
  finding_id: string;
  title: string;
  issue_kind: string;
  summary: string;
  repo: string;
}

interface SuggestedPattern {
  pattern_id: string;
  title: string;
  pattern_strength: string;
  summary: string;
}

interface SuggestedRecommendation {
  recommendation_id: string;
  title: string;
  recommendation_kind: string;
  confidence: string;
  action_details: string;
}

interface SuggestedDoctrine {
  doctrine_id: string;
  statement: string;
  strength: string;
}

/**
 * Get dogfood intelligence suggestions by repo slug.
 */
export function suggestByRepo(repoSlug: string): DogfoodSuggestion {
  const repoId = getRepoIdBySlug(repoSlug);
  if (!repoId) return empty();
  return queryFacts(repoId);
}

/**
 * Escape SQL LIKE metacharacters (`%`, `_`, and the escape char itself)
 * so operator free-text is matched literally rather than as a wildcard.
 * Pairs with an `ESCAPE '\'` clause on the LIKE.
 *
 * sync-A-007: without this, a `--surface` value like `mcp_server` treats
 * the `_` as "any single char" and `report%` matches everything after
 * `report`. The percent we wrap around the term for the CSV prefilter is
 * added AFTER escaping, so it stays a real wildcard.
 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Get dogfood intelligence suggestions by surface.
 * Searches across all repos that have the specified surface.
 *
 * The `surfaces` fact stores a comma-joined CSV of surface names
 * (see dogfood.ts: `surfaceNames.join(',')`). We narrow candidate repos
 * with an ESCAPE-clause LIKE prefilter, then confirm EXACT comma-split
 * membership in JS so a surface like `cli` does not substring-match a
 * repo whose only surface is `cli-docs`.
 */
export function suggestBySurface(surface: string): DogfoodSuggestion {
  const db = getDb();
  // sync-A-007: escape LIKE metachars + ESCAPE clause so `%`/`_` in the
  // operator-supplied surface are literal, not wildcards.
  const rows = db.prepare(`
    SELECT DISTINCT repo_id, value FROM repo_facts
    WHERE fact_type = 'dogfood' AND key = 'surfaces' AND value LIKE ? ESCAPE '\\'
  `).all(`%${escapeLike(surface)}%`) as { repo_id: number; value: string }[];

  const result = empty();
  const seenFindings = new Set<string>();
  const seenPatterns = new Set<string>();
  const seenRecs = new Set<string>();
  const seenDocs = new Set<string>();

  for (const row of rows) {
    // Exact CSV membership: the LIKE prefilter can substring-match
    // (`cli` inside `cli-docs`); confirm the surface is a whole element.
    const surfaceList = row.value.split(',').map((s) => s.trim());
    if (surface && !surfaceList.includes(surface)) continue;

    const partial = queryFacts(row.repo_id);
    for (const f of partial.findings) {
      if (!seenFindings.has(f.finding_id)) {
        result.findings.push(f);
        seenFindings.add(f.finding_id);
      }
    }
    for (const p of partial.patterns) {
      if (!seenPatterns.has(p.pattern_id)) { result.patterns.push(p); seenPatterns.add(p.pattern_id); }
    }
    for (const r of partial.recommendations) {
      if (!seenRecs.has(r.recommendation_id)) {
        result.recommendations.push(r);
        seenRecs.add(r.recommendation_id);
      }
    }
    for (const d of partial.doctrine) {
      if (!seenDocs.has(d.doctrine_id)) { result.doctrine.push(d); seenDocs.add(d.doctrine_id); }
    }
  }

  return result;
}

function queryFacts(repoId: number | bigint): DogfoodSuggestion {
  const db = getDb();
  const result = empty();

  const facts = db.prepare(`
    SELECT fact_type, key, value FROM repo_facts WHERE repo_id = ? AND fact_type LIKE 'dogfood.%'
  `).all(repoId) as { fact_type: string; key: string; value: string }[];

  // Also get the repo slug for findings
  const repoRow = db.prepare('SELECT slug FROM repos WHERE id = ?').get(repoId) as { slug: string } | undefined;
  const repoSlug = repoRow?.slug || '';

  for (const fact of facts) {
    try {
      const data = JSON.parse(fact.value);

      if (fact.fact_type === 'dogfood.finding') {
        result.findings.push({
          finding_id: fact.key,
          title: data.title || '',
          issue_kind: data.issue_kind || '',
          summary: data.summary || '',
          repo: repoSlug,
        });
      } else if (fact.fact_type === 'dogfood.pattern') {
        result.patterns.push({
          pattern_id: fact.key,
          title: data.title || '',
          pattern_strength: data.pattern_strength || '',
          summary: data.summary || '',
        });
      } else if (fact.fact_type === 'dogfood.recommendation') {
        result.recommendations.push({
          recommendation_id: fact.key,
          title: data.title || '',
          recommendation_kind: data.recommendation_kind || '',
          confidence: data.confidence || '',
          action_details: data.action_details || '',
        });
      } else if (fact.fact_type === 'dogfood.doctrine') {
        result.doctrine.push({
          doctrine_id: fact.key,
          statement: data.statement || '',
          strength: data.strength || '',
        });
      }
    } catch { /* skip unparseable facts */ }
  }

  return result;
}

function empty(): DogfoodSuggestion {
  return { findings: [], patterns: [], recommendations: [], doctrine: [] };
}
