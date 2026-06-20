/**
 * Full-text search layer — builds and queries FTS5 index.
 */
import { getDb } from '../db/init.js';

export interface SearchResult {
  slug: string;
  source_type: string;
  source_id: string;
  title: string;
  snippet: string;
  rank: number;
}

export interface SearchOptions {
  limit?: number;
}

export interface RepoSearchResult {
  slug: string;
  matches: { source_type: string; title: string; snippet: string }[];
  best_rank: number;
}

/**
 * Rebuild the full-text search index from current data.
 */
export function rebuildIndex(): number {
  const db = getDb();

  // Clear existing index
  db.prepare("DELETE FROM repo_search").run();

  let indexed = 0;

  // Index repo descriptions and purposes
  const repos = db.prepare('SELECT id, slug, description, purpose FROM repos').all() as {
    id: number; slug: string; description: string | null; purpose: string | null;
  }[];
  const insSearch = db.prepare(
    "INSERT INTO repo_search (slug, source_type, source_id, title, content) VALUES (?, ?, ?, ?, ?)"
  );

  const tx = db.transaction(() => {
    for (const repo of repos) {
      const text = [repo.description, repo.purpose].filter(Boolean).join('\n');
      if (text) {
        insSearch.run(repo.slug, 'repo', String(repo.id), repo.slug, text);
        indexed++;
      }
    }

    // Index docs
    const docs = db.prepare(`
      SELECT d.id, d.repo_id, d.path, d.title, d.content, r.slug
      FROM repo_docs d
      JOIN repos r ON r.id = d.repo_id
      WHERE d.content IS NOT NULL
    `).all() as {
      id: number; repo_id: number; path: string; title: string | null; content: string; slug: string;
    }[];

    for (const doc of docs) {
      // Truncate very large docs for index (keep first 50K chars)
      const content = doc.content.length > 50000
        ? doc.content.slice(0, 50000)
        : doc.content;
      insSearch.run(doc.slug, 'doc', String(doc.id), doc.title || doc.path, content);
      indexed++;
    }

    // Index notes
    const notes = db.prepare(`
      SELECT n.id, n.repo_id, n.title, n.content, n.note_type, r.slug
      FROM repo_notes n
      JOIN repos r ON r.id = n.repo_id
    `).all() as {
      id: number; repo_id: number; title: string | null; content: string; note_type: string; slug: string;
    }[];

    for (const note of notes) {
      insSearch.run(
        note.slug, 'note', String(note.id),
        note.title || note.note_type,
        note.content
      );
      indexed++;
    }
  });

  tx();

  return indexed;
}

/**
 * Search the full-text index.
 * Returns matches with snippets and source info.
 */
export function search(query: string, opts: SearchOptions = {}): SearchResult[] {
  const db = getDb();
  const limit = opts.limit || 20;

  // FTS5 query: wrap EVERY whitespace-separated term in double quotes so the
  // input is always treated as literal phrases ANDed together. mcp-A-002: the
  // old code passed terms containing ':', '"', or '*' through verbatim, which
  // let a natural-language query with a colon or a URL be reinterpreted as
  // FTS5 syntax (column filters, prefix tokens) and either error or mis-match.
  // mcp-A-004: this layer does NOT do prefix matching — it never appends '*';
  // it quotes terms into literal phrases. (Embedded double quotes are doubled
  // per the FTS5 string-literal escaping rule so they don't terminate early.)
  const ftsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map(term => `"${term.replace(/"/g, '""')}"`)
    .join(' ');

  try {
    const results = db.prepare(`
      SELECT
        slug,
        source_type,
        source_id,
        title,
        snippet(repo_search, 4, '>>>', '<<<', '...', 40) AS snippet,
        rank
      FROM repo_search
      WHERE repo_search MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(ftsQuery, limit) as SearchResult[];

    return results;
  } catch {
    // If FTS query syntax fails, try a simpler approach.
    //
    // F-AG-007: `/[^\w\s]/g` is ASCII-only — `\w` matches [A-Za-z0-9_]
    // and nothing else, so non-ASCII letters (CJK, accented Latin,
    // Cyrillic, etc.) were silently stripped to the empty string and
    // the fallback returned []. Use the Unicode property escapes
    // \p{L} (letters of any script) + \p{N} (numbers) so non-ASCII
    // content survives and can drive a useful second-pass FTS query.
    const simpleTerm = query.replace(/[^\p{L}\p{N}\s]/gu, '');
    if (!simpleTerm.trim()) return [];

    // mcp-A-003: quote each surviving token individually and join with spaces
    // so the fallback preserves the primary path's per-term AND semantics. The
    // old code wrapped the WHOLE multi-word query in one set of quotes —
    // `"redis cache"` — which is an FTS5 phrase requiring the words to be
    // adjacent, silently narrowing results vs. the intended `"redis" "cache"`
    // (both terms present, any position).
    const fallbackQuery = simpleTerm
      .split(/\s+/)
      .filter(Boolean)
      .map(t => `"${t}"`)
      .join(' ');

    // mcp-PH-006: guard the FALLBACK query too. It runs inside the primary
    // catch but had no guard of its own, so if even the sanitized retry threw
    // (an exotic input the regex doesn't tame, or an FTS5/SQLite edge), the
    // whole search() call threw. A search degrading to "no matches" is correct
    // behavior; a crash is not. Return [] on any fallback failure.
    try {
      return db.prepare(`
        SELECT
          slug,
          source_type,
          source_id,
          title,
          snippet(repo_search, 4, '>>>', '<<<', '...', 40) AS snippet,
          rank
        FROM repo_search
        WHERE repo_search MATCH ?
        ORDER BY rank
        LIMIT ?
      `).all(fallbackQuery, limit) as SearchResult[];
    } catch {
      return [];
    }
  }
}

/**
 * Search for repos matching a concept across all indexed content.
 * Returns unique repo slugs with match context.
 */
export function searchRepos(query: string, opts: SearchOptions = {}): RepoSearchResult[] {
  // mcp-PH-005: clamp the caller's limit for non-MCP callers (the MCP Zod
  // schema already constrains it, but searchRepos is exported and called
  // directly by the CLI + library consumers). A negative limit would make the
  // final slice(0, negative) misbehave; an absurd one invites a huge scan.
  // Clamp to [1, 100] and default to 20 when unset/non-finite.
  const requested = opts.limit;
  const outLimit =
    typeof requested === 'number' && Number.isFinite(requested)
      ? Math.min(100, Math.max(1, Math.trunc(requested)))
      : 20;

  // cli-A-002: feed the caller's requested limit into the inner FTS query
  // instead of a hardcoded 50. Multiple matches can collapse onto one slug
  // during grouping, so a hardcoded inner cap of 50 silently under-delivered
  // whenever the caller asked for more than 50 repos (e.g. `--limit 80`). We
  // keep a floor of 50 rows so small-limit callers still see enough raw
  // matches to group well, then slice to outLimit below.
  const innerLimit = Math.max(50, outLimit);
  const results = search(query, { ...opts, limit: innerLimit });

  // Group by slug
  const bySlug = new Map<string, RepoSearchResult>();
  for (const r of results) {
    if (!bySlug.has(r.slug)) {
      bySlug.set(r.slug, {
        slug: r.slug,
        matches: [],
        best_rank: r.rank,
      });
    }
    bySlug.get(r.slug)!.matches.push({
      source_type: r.source_type,
      title: r.title,
      snippet: r.snippet,
    });
  }

  return [...bySlug.values()]
    .sort((a, b) => a.best_rank - b.best_rank)
    .slice(0, outLimit);
}
