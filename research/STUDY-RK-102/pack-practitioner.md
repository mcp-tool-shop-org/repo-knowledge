# STUDY-RK-102 Q2 · Practitioner pack
Tip: `d98ba99` · clone `/workspace/studio/repo-knowledge` · gh as mcp-tool-shop · docs/GH/API + local tip · no invent merge / invent STUDY-RK-131 · 🛑 do not merge #6 #8 #12–#26

Seven doc/API sources. I did not invent merge or STUDY-RK-131.

## Answer
Against tip `d98ba99` (full `d98ba992056b27e15fa5b261d93660361394c5f0` = origin/main), OPEN #12–#26 PRs touching `usage.md` and/or handbook paths and/or `src/mcp/server.ts` are **#12, #16, #17, #18, #19, #23, #24, #25**. Only **#17** touches `src/mcp/server.ts`. Root `HANDBOOK.md` untouched by #6 #8 #12–#26; collisions sit under `site/src/content/docs/handbook/`. #6 #8 and #13–#15/#20–#22/#26 touch none. Hotspots: `usage.md` + `mcp-server.md` (4 PRs each). NEW coding PR: **no**. 🛑 do not merge.

### Conflict table — path → OPEN PRs

| path | PRs |
|------|-----|
| `site/.../handbook/usage.md` | #12, #17, #18, #25 |
| `site/.../handbook/mcp-server.md` | #12, #16, #17, #18 |
| `site/.../handbook/index.md` | #12, #16 |
| `site/.../handbook/beginners.md` | #17, #19, #24 |
| `site/.../handbook/getting-started.md` | #19, #24 |
| `site/.../handbook/operations.md` | #19, #23 |
| `site/.../handbook/security.md` | #24 |
| `src/mcp/server.ts` | #17 |

### Pairwise overlap (interesting files)

| pair | shared paths |
|------|----------------|
| #12∩#16 | index.md, mcp-server.md |
| #12∩#17 | mcp-server.md, usage.md |
| #12∩#18 | mcp-server.md, usage.md |
| #12∩#25 | usage.md |
| #16∩#17 | mcp-server.md |
| #16∩#18 | mcp-server.md |
| #17∩#18 | mcp-server.md, usage.md |
| #17∩#19 | beginners.md |
| #17∩#24 | beginners.md |
| #17∩#25 | usage.md |
| #18∩#25 | usage.md |
| #19∩#23 | operations.md |
| #19∩#24 | beginners.md, getting-started.md |

Adjacency: #12→{16,17,18,25}; #16→{12,17,18}; #17→{12,16,18,19,24,25}; #18→{12,16,17,25}; #19→{17,23,24}; #23→{19}; #24→{17,19}; #25→{12,17,18}.

## Findings (8)

1. **Tip** — Title: stamp STUDY-RK-101. Org: mcp-tool-shop-org/repo-knowledge. Date: 2026-09-23. Path: tip `d98ba992056b27e15fa5b261d93660361394c5f0` = origin/main. Finding: Tip matches origin/main (`research: stamp STUDY-RK-101 flag-patch land line`).

2. **Path inventory (local tip)** — Title: tip handbook + server paths. Org: local tip. Date: tip `d98ba99`. Paths: `/workspace/studio/repo-knowledge/HANDBOOK.md`, `site/src/content/docs/handbook/`, `src/mcp/server.ts`. Finding: Site handbook tree is the collision surface; server equivalent is `src/mcp/server.ts`.

3. **#12 file set (GitHub API)** — Title: docs sync handbook CLI/MCP to cli.ts/server.ts. Org: mcp-tool-shop-org. Date: live `gh pr view 12`. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/12. Finding: OPEN MERGEABLE/BEHIND; hits index.md, mcp-server.md, usage.md — hub overlapping #16/#17/#18/#25.

4. **#16–#18 MCP/docs cluster (GitHub API)** — Title: STUDY-RK-025/026/027 handbook + getRelated/publish-state docs. Org: mcp-tool-shop-org. Date: live API. URLs: pulls/16, /17, /18. Finding: All OPEN MERGEABLE/BEHIND; shared mcp-server.md (#16/#17/#18) and usage.md (#17/#18); only #17 also edits `src/mcp/server.ts`.

5. **#19/#23/#24 ops/onboarding cluster (GitHub API)** — Title: STUDY-RK-028/037/054 dual-path install, backup/restore, getting-started. Org: mcp-tool-shop-org. Date: live API. URLs: pulls/19, /23, /24. Finding: OPEN MERGEABLE/BEHIND; #19∩#23 on operations.md; #19∩#24 on beginners.md + getting-started.md; #17∩#19/#24 on beginners.md.

6. **#25 usage leftover (GitHub API)** — Title: STUDY-RK-077 leftover usage.md. Org: mcp-tool-shop-org. Date: live API. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/25. Finding: OPEN MERGEABLE/BEHIND; sole file usage.md — collides with #12/#17/#18 on that path only.

7. **Non-touching holds (GitHub API)** — Title: #6 #8 and #13–#15/#20–#22/#26. Org: mcp-tool-shop-org. Date: 2026-09-23. Finding: #6 and #8 touch none of usage/handbook/server.ts; vitest/other holds likewise stay off this graph.

8. **Contracts + anti-invent (local tip)** — Title: KNOWLEDGE-CONTRACT + AUDIT-CONTRACT. Org: local tip. Date: tip `d98ba99`. Paths: `KNOWLEDGE-CONTRACT.md`, `AUDIT-CONTRACT.md`. Finding: Contracts support path-level PR collision inventory; inventing merge or STUDY-RK-131 fails. 🛑 do not merge #6 #8 #12–#26.

## Four fields
| Field | Value |
|-------|--------|
| PRs touching usage/handbook/server.ts | #12, #16, #17, #18, #19, #23, #24, #25 |
| server.ts only | #17 (`src/mcp/server.ts`) |
| hottest collisions | usage.md + mcp-server.md (4 PRs each) |
| NEW coding PR | no |

✅ · 🛑 · 🔧
