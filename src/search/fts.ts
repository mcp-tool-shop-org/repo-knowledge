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

  // FTS5 query: handle simple terms by adding * for prefix matching
  const ftsQuery = query
    .split(/\s+/)
    .map(term => term.includes(':') || term.includes('"') || term.includes('*')
      ? term
      : `"${term}"`)
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
  } catch (e) {
    // If FTS query syntax fails, try a simpler approach
    const simpleTerm = query.replace(/[^\w\s]/g, '');
    if (!simpleTerm.trim()) return [];

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
    `).all(`"${simpleTerm}"`, limit) as SearchResult[];
  }
}

/**
 * Search for repos matching a concept across all indexed content.
 * Returns unique repo slugs with match context.
 */
export function searchRepos(query: string, opts: SearchOptions = {}): RepoSearchResult[] {
  const results = search(query, { ...opts, limit: 50 });

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
    .slice(0, opts.limit || 20);
}
