import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: '@mcptoolshop/repo-knowledge',
  description: 'Local-first repo knowledge system built on SQLite and FTS5 — catalogs repos with thesis notes, audit evidence, relationships, and full-text search via CLI and MCP server.',
  logoBadge: 'RK',
  brandName: 'repo-knowledge',
  repoUrl: 'https://github.com/mcp-tool-shop-org/repo-knowledge',
  npmUrl: 'https://www.npmjs.com/package/@mcptoolshop/repo-knowledge',
  footerText: 'MIT Licensed — built by <a href="https://mcp-tool-shop.github.io/" style="color:var(--color-muted);text-decoration:underline">MCP Tool Shop</a>',

  hero: {
    badge: 'Open source',
    headline: 'Your repos,',
    headlineAccent: 'fully cataloged.',
    description: 'A local-first knowledge system that catalogs every repo with thesis, architecture, audit evidence, relationships, and full-text search — then exposes it all via CLI and MCP server.',
    primaryCta: { href: '#usage', label: 'Get started' },
    secondaryCta: { href: 'handbook/', label: 'Read the Handbook' },
    previews: [
      { label: 'Install', code: 'npm install -g @mcptoolshop/repo-knowledge' },
      { label: 'Sync', code: 'rk sync --owners my-org' },
      { label: 'Search', code: 'rk find "authentication middleware"' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'Features',
      subtitle: 'Everything you need to understand your repo portfolio.',
      features: [
        { title: 'Knowledge Catalog', desc: 'Thesis, architecture, conventions, warnings, and relationships for every repo — structured and searchable.' },
        { title: 'Audit Evidence', desc: '80 controls across 19 domains. Submit findings, track posture, query portfolio-wide with a single command.' },
        { title: 'Full-Text Search', desc: 'FTS5-powered search across READMEs, changelogs, notes, and repo descriptions. Find anything instantly.' },
        { title: 'MCP Server', desc: '20 tools for AI-integrated workflows. Claude can query, annotate, and audit your repos conversationally.' },
      ],
    },
    {
      kind: 'code-cards',
      id: 'usage',
      title: 'Usage',
      cards: [
        { title: 'Install', code: 'npm install -g @mcptoolshop/repo-knowledge' },
        { title: 'Initialize', code: 'rk init\nrk sync --owners my-org' },
        { title: 'Explore', code: 'rk show my-org/my-repo\nrk find "auth middleware"\nrk related my-org/my-repo' },
        { title: 'Audit', code: 'rk audit seed-controls\nrk audit posture\nrk audit findings --severity critical' },
      ],
    },
  ],
};
