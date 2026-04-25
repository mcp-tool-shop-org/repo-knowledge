# Knowledge Enrichment Contract

**Purpose:** Populate the knowledge layer of repo-knowledge — notes, releases, and relationships — for every repo in the portfolio. This is the most important part of the database. Do not half-ass it.

**Database:** `F:\AI\repo-knowledge\data\knowledge.db`
**Worklist:** `F:\AI\repo-knowledge\KNOWLEDGE-WORKLIST.md`

---

## What you are populating

### 1. Notes (`add_repo_note` MCP tool)

Human-quality durable knowledge about each repo. Not scraped metadata — actual understanding.

Every repo MUST get at minimum:

- **thesis** — Why does this repo exist? What problem does it solve? What is its reason for being?
- **architecture** — How is it built? What are the key modules/layers/patterns? What is the technical shape?

Additionally, add any that apply:

- **warning** — Known footguns, gotchas, things that will bite you
- **next_step** — The single most important thing to do next on this repo
- **drift_risk** — Where this repo is likely to rot or diverge from intent
- **release_summary** — What shipped, what version, what matters about the release
- **convention** — Important conventions (naming, patterns, config) that must be preserved
- **pain_point** — Known friction, tech debt, things that slow you down
- **command** — Important commands for building, testing, running, deploying
- **general** — Anything else worth recording that doesn't fit the above

### Note quality rules

**Good notes:**
- "CLI tool that verifies npm package integrity by comparing published tarball contents against local build output. Exists because npm publish silently includes/excludes files and you can't tell without diffing."
- "Tauri v2 + React frontend. State lives in Rust backend, React renders via IPC commands. Canvas operations go through a Rust image processing layer. Key constraint: all pixel operations must be non-blocking."
- "WARNING: The `fix.mjs` script uses string interpolation for shell commands. Do not pass untrusted input to it."

**Bad notes:**
- "This is a Node.js project"
- "Has a README"
- "Seems fine"
- "JavaScript tool for doing stuff"

Notes must demonstrate that you actually read and understood the repo.

### 2. Releases (submit via database or note)

For repos that have GitHub releases or meaningful version tags, record what shipped:

- Tag/version
- What changed (not just "bug fixes" — actual substance)
- When it shipped

Use the `add_repo_note` tool with `note_type: "release_summary"` for this.

### 3. Relationships (`add_relationship` MCP tool)

Cross-repo edges. These matter because repos don't exist in isolation.

Relation types:
- **depends_on** — This repo imports/requires another repo in the org
- **related_to** — Same product area or concept, but not a direct dependency
- **supersedes** — This repo replaces an older one
- **shares_domain_with** — Same problem domain (e.g. all accessibility tools, all sound tools)
- **shares_package_with** — Published under the same npm scope or package ecosystem
- **companion_to** — Designed to work together (e.g. CLI + VS Code extension for the same tool)

### Relationship quality rules

**Good relationships:**
- `polyglot-mcp` depends_on `py-polyglot` — "MCP server wraps the Python translation library"
- `glyphstudio` supersedes `sprite-creator-studio` — "Product pivot, same domain, new architecture"
- `soundboard-plugin` companion_to `claude-sfx` — "VS Code extension uses sfx library"
- `websketch-cli` shares_domain_with `websketch-mcp` — "Both part of WebSketch product family"

**Bad relationships:**
- Everything `related_to` everything else
- Random connections with no explanation

---

## Per-repo workflow

For each repo:

1. **Read the repo.** Not just the README — look at the code, package files, docs, tests, CI config. Understand what it actually does.
2. **Check for existing memory files** at `F:\AI\memory\` — some repos have detailed memory files that contain thesis, architecture, and state information. Use these as input but verify against the actual repo.
3. **Write the thesis note.** One paragraph. Why does this exist?
4. **Write the architecture note.** Technical shape — languages, frameworks, key modules, how it fits together.
5. **Add warning/next_step/drift_risk/convention/pain_point/command notes** as appropriate. Not every repo needs all of these. Use judgment.
6. **Record releases** if the repo has shipped versions.
7. **Record relationships** to other repos in the org. Check package.json/Cargo.toml for direct dependencies. Check the domain for thematic connections.
8. **Mark done on the worklist.**

---

## MCP tools available

- `add_repo_note` — Add a knowledge note (slug, note_type, content, optional title)
- `add_relationship` — Add a cross-repo edge (from_slug, relation_type, to_slug, optional note)
- `get_repo` — Get existing repo info (tech stack, docs, facts, audit posture)
- `search_repos` — Full-text search across all indexed content
- `find_repos` — Filter by owner, language, framework, category, status
- `repo_summary` — Quick one-paragraph summary of current state

---

## Rules

- **One repo at a time.** Finish before claiming another.
- **Every repo gets thesis + architecture at minimum.** No exceptions.
- **Notes must demonstrate understanding.** If you can't tell what a repo does after reading it, say so honestly — don't fabricate.
- **Relationships must have a note explaining why.** No bare edges.
- **Do not invent information.** If you don't know the release history, don't guess.
- **Check memory files** at `F:\AI\memory\` — they contain authored truth about many repos.
- **Read the actual code.** README alone is not sufficient.
