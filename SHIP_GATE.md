# Ship Gate

> No repo is "done" until every applicable line is checked.
> Copy this into your repo root. Check items off per-release.

**Tags:** `[all]` every repo · `[npm]` `[pypi]` `[vsix]` `[desktop]` `[container]` published artifacts · `[mcp]` MCP servers · `[cli]` CLI tools

**Repo:** repo-knowledge · **Version:** 2.1.0 · **Verified:** 2026-06-20 (post dogfood-swarm health pass, 0 CRIT / 0 HIGH)

---

## A. Security Baseline

- [x] `[all]` SECURITY.md exists (report path, response timeline 72h ack / 14d fix, scope, security considerations — `SECURITY.md`)
- [x] `[all]` README includes threat model paragraph (`## Security Model` — data touched / NOT touched / permissions / no telemetry, README.md L37-45)
- [x] `[all]` No secrets, tokens, or credentials in source or diagnostics output (grep for hardcoded keys/tokens in src/ → none; `gh` CLI auth is inherited, never stored — SECURITY.md L30)
- [x] `[all]` No telemetry by default — stated explicitly ("No telemetry, no analytics, no phone-home." README.md L45)

### Default safety posture

- [x] `[cli|mcp|desktop]` Dangerous actions require explicit gate (CLI `delete`/`prune`/`restore` use confirm prompt or `--yes`/`--apply`; MCP `delete_repo` refuses unless `confirm: true` — server.ts L982; archive_repo is the reversible alternative)
- [x] `[cli|mcp|desktop]` File operations constrained to known directories (DB path + `data/backups/` from resolved config; `--local` scan prunes denylisted/dot dirs and won't descend into found repos)
- [x] `[mcp]` Network egress off by default (stdio transport only; the 11 new v2.1.0 tools are DB-only reads — "none triggers a network refresh", CHANGELOG L11; SECURITY.md "does not expose network endpoints")
- [x] `[mcp]` Stack traces never exposed — structured error results only (tool handlers return text content / SDK isError results; server never crashes on bad input — verified this swarm; ambiguous-slug + FTS metachar escaping hardened, CHANGELOG L25)

## B. Error Handling

- [x] `[all]` Errors follow the Structured Error Shape: `code`, `message`, `hint`, `cause?`, `retryable?` (`src/errors.ts` — `RkError` interface + `RepoKnowledgeError` class with `toJSON()`)
- [x] `[cli]` Exit codes: 0 ok · 1 user error · 2 runtime/usage error (consistent across cli.ts: not-found slugs → exit 1; bad flags / aborts / strict-fail → exit 2; global catch → exit 2)
- [x] `[cli]` No raw stack traces without `--debug` (global `parseAsync().catch` prints clean `Error: <message>` + exit 2; full `console.error(err)` only when `--debug` set — cli.ts L2742-2750)
- [x] `[mcp]` Tool errors return structured results — server never crashes on bad input (SDK isError results; resolver refuses ambiguous partial slug and echoes canonical slug — CHANGELOG L25; verified this swarm)
- [x] `[mcp]` State/config corruption degrades gracefully (legacy sync-export child crash degrades to one-line "sync-export skipped (…)" hint instead of stack dump — CHANGELOG L27; migrations transaction-wrapped + auto-snapshot before migration, recoverable stranded state — CHANGELOG L14, L22)
- [ ] `[desktop]` SKIP: not a desktop app (CLI + MCP server)
- [ ] `[vscode]` SKIP: not a VS Code extension

## C. Operator Docs

- [x] `[all]` README is current: what it does, install, usage, supported platforms + runtime versions (refreshed this swarm; Node 20+ requirement stated; logo + lang nav + badges in header)
- [x] `[all]` CHANGELOG.md (Keep a Changelog format; `[2.1.0] - 2026-06-20` entry present with Added/Fixed)
- [x] `[all]` LICENSE file present (MIT) and repo states support status (SECURITY.md supported scope; CHANGELOG release line)
- [x] `[cli]` `--help` output accurate for all commands and flags (commander-driven; every command/flag registered with descriptions — `--debug` global option declared L2737)
- [x] `[cli|mcp|desktop]` Logging levels: progress/diagnostics on stderr, structured data on stdout; `--debug` for stacks; secrets never logged (channel discipline fix keeps stdout clean for `--json` + MCP JSON-RPC frame — CHANGELOG L24; no secrets emitted)
- [x] `[mcp]` All tools documented with description + parameters (each `server.tool()` registration carries a prose description + Zod param descriptions; all 30 listed in README `### MCP Tools`)
- [x] `[complex]` HANDBOOK.md present (daily ops / operations doc; mirrored as Starlight handbook pages under `site/src/content/docs/handbook/` incl. operations.md, security.md, mcp-server.md)

## D. Shipping Hygiene

- [x] `[all]` `verify` script exists (package.json `verify` = typecheck + lint + test + test:scripts; `prepublishOnly` runs it)
- [x] `[all]` Version in manifest matches git tag (package.json `2.1.0`; tag `v2.1.0` created at release; 4 version-consistency tests guard semver/CHANGELOG/--version)
- [x] `[all]` Dependency scanning runs in CI (`.github/workflows/ci.yml` — named `npm audit --audit-level=moderate` step writing to Step Summary, advisory continue-on-error)
- [x] `[all]` Automated dependency update mechanism exists (`.github/dependabot.yml` — npm ecosystem, monthly, grouped `all-deps`, `open-pull-requests-limit: 3`)
- [x] `[npm]` `npm pack` includes dist/, README.md, CHANGELOG.md, LICENSE (package.json `files`: dist, data/control-registry.json, templates, README.md, CHANGELOG.md, LICENSE, SECURITY.md)
- [x] `[npm]` `engines.node` set (`>=20`)
- [x] `[npm]` Lockfile committed (`package-lock.json` present and tracked)
- [ ] `[pypi]` SKIP: not a Python project
- [ ] `[vsix]` SKIP: not a VS Code extension
- [ ] `[desktop]` SKIP: not a desktop app

## E. Identity (soft gate — does not block ship)

- [x] `[all]` Logo in README header (centered `<img>` from brand repo, README.md L5-7 — refreshed this swarm)
- [x] `[all]` Translations (7 locales present + English source = 8: README.{ja,zh,es,fr,hi,it,pt-BR}.md; lang nav bar in header)
- [x] `[org]` Landing page (`site/` — Astro `index.astro` + Starlight handbook; deployed via `pages.yml` to mcp-tool-shop-org.github.io/repo-knowledge/)
- [x] `[all]` GitHub repo metadata: description, homepage, topics (set separately on the org repo; package.json carries description/homepage/keywords as the source of truth)

---

## Gate Rules

**Hard gate (A–D):** Must pass before any version is tagged or published.
If a section doesn't apply, mark `SKIP:` with justification — don't leave it unchecked.

**Soft gate (E):** Should be done. Product ships without it, but isn't "whole."

**Checking off:**
```
- [x] `[all]` SECURITY.md exists (2026-02-27)
```

**Skipping:**
```
- [ ] `[pypi]` SKIP: not a Python project
```
