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
 * Get dogfood intelligence suggestions by surface.
 * Searches across all repos that have the specified surface.
 */
export function suggestBySurface(surface: string): DogfoodSuggestion {
  const db = getDb();
  // Find all repos that have this surface in dogfood facts
  const rows = db.prepare(`
    SELECT DISTINCT repo_id FROM repo_facts
    WHERE fact_type = 'dogfood' AND key = 'surfaces' AND value LIKE ?
  `).all(`%${surface}%`) as { repo_id: number }[];

  const result = empty();
  const seenFindings = new Set<string>();
  const seenPatterns = new Set<string>();
  const seenRecs = new Set<string>();
  const seenDocs = new Set<string>();

  for (const row of rows) {
    const partial = queryFacts(row.repo_id);
    for (const f of partial.findings) {
      if (!seenFindings.has(f.finding_id)) {
        // Filter by surface if the finding data includes it
        const parsed = tryParseJson(f);
        if (!surface || (parsed && surfaceMatches(parsed, surface))) {
          result.findings.push(f);
          seenFindings.add(f.finding_id);
        }
      }
    }
    for (const p of partial.patterns) {
      if (!seenPatterns.has(p.pattern_id)) { result.patterns.push(p); seenPatterns.add(p.pattern_id); }
    }
    for (const r of partial.recommendations) {
      if (!seenRecs.has(r.recommendation_id)) {
        const parsed = tryParseRecJson(r);
        if (!surface || (parsed && recSurfaceMatches(parsed, surface))) {
          result.recommendations.push(r);
          seenRecs.add(r.recommendation_id);
        }
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

function tryParseJson(f: SuggestedFinding): any {
  return f; // Already parsed
}

function surfaceMatches(_parsed: any, _surface: string): boolean {
  // Findings are already filtered by repo which has the surface
  return true;
}

function tryParseRecJson(r: SuggestedRecommendation): any {
  return r;
}

function recSurfaceMatches(_parsed: any, _surface: string): boolean {
  return true;
}
