# repo-knowledge — Field Expansion Roadmap for Next Dogfood Swarm

> **Premise.** A 2026-05-01 working session against this DB surfaced concrete gaps in the schema, the sync pipeline, the CLI surface, and cross-tool coverage. This roadmap turns those gaps into a scoped agenda for the next 10-phase dogfood swarm. Every item below is motivated by an actual observed gap, not speculation.

> **Scope.** Schema *and* the surfaces that feed it. The DB is only as useful as the fields it captures and the pipelines that fill them.

---

## Evidence base (what we observed 2026-05-01)

- **199 repos indexed**, but several major active tools NOT in DB: `motif`, `forkctl`, `the-fractured-road`, `role-os`, `style-dataset-lab`, `npm-launcher`. Coverage list is incomplete.
- **162/199 entries had stale `F:\` Windows paths.** Refreshed via surgical UPDATE script — `rk sync` itself is additive-only and does not in-place update existing repos' `local_path`. Net result: 87 paths Mac-canonical, 112 NULLed (legitimately deprecated/moved/marketing-wing).
- **`mcp-tool-shop-org/npm-sovereignty`** still in DB despite being deleted from GitHub. No sync-time prune; required hand-rolled DELETE with FK cascade. No `rk delete` command exists.
- **`rk sync` exits 0 while crashing** (pre-v1.0.6) — root cause: CLI uses `program.parse()` not `parseAsync()`, so async-action rejections never propagate. Fixed in PR #6, but the fact that the bug shipped at all means there is no health/self-test surface.
- **`@mcptoolshop/sovereignty` on npm was at 1.4.8** while in-source wrapper said 1.4.0. The DB had no field for "current registry version" — discovery required a separate `npm view` call.
- **`actions/checkout@v4` etc. Node 20 deprecation** surfaced only via CI annotations on a PR. No DB field tracks workflow-action freshness.
- **TS 6.0.2 `baseUrl` deprecation** was latent in tsup's internal config; only surfaced when CI's `npm install` pulled fresh transitive deps. No DB field tracks dep-freshness or known TS-version drift.
- **3 moderate + 2 high audit vulns** were sitting in dev deps of repo-knowledge itself, only surfaced in CI. No portfolio-wide "outstanding `npm audit` findings" surface.

---

## Axis 1 — Schema fields to add

Each row: name, type, motivation (the gap that surfaces it), source (where it gets populated).

### Lifecycle + cross-rig

| Field | Type | Motivates | Source |
|---|---|---|---|
| `repos.lifecycle_status` | enum: `active`, `deprecated`, `archived`, `superseded`, `marketing_wing`, `prototype` | The 112-NULLed `local_path` set is a mix of all these. Today they're indistinguishable. | Manual curation + heuristic (GitHub `archived` flag, `superseded_by` relationship presence) |
| `repos.deprecated_at` | TEXT (ISO date) | Date `lifecycle_status` flipped — important for audit pruning | Manual + sync diff |
| `repos.replaced_by_repo_id` | INTEGER FK repos(id) | `forkable→forkctl`, `npm-sovereignty → npm-launcher/examples/sovereignty` — both happened, both invisible in DB | Manual (one-time during cleanup), or auto-promoted from `repo_relationships` where `relation_type='supersedes'` |
| `repo_local_paths` (NEW TABLE) | repo_id, rig_id, local_path, last_seen_at | Single `repos.local_path` column can't represent "this repo lives at `/Volumes/T9-Shared/AI/X` on Mac AND `F:\AI\X` on 5080". Cross-rig drift goes silent. | rk-bridge / `rk verify-local` per-rig run |
| `rigs` (NEW TABLE) | rig_id, hostname, primary_root, last_seen_at | Anchors the multi-rig path table. Currently we have `mac-m5max` + `windows-5080` codified in rig-bridge memory but not in DB | One-shot insert per rig; `rk init-rig` |

### Distribution / publish state

| Field | Type | Motivates | Source |
|---|---|---|---|
| `repos.npm_package_name` | TEXT | Sovereignty's npm package (`@mcptoolshop/sovereignty`) is named differently from the repo (`sovereignty`). Today there's no link. | Manual + `package.json` scan |
| `repos.pypi_package_name` | TEXT | Same — `sovereignty-game` on PyPI vs `sovereignty` on GitHub | `pyproject.toml` scan |
| `repo_published_versions` (NEW TABLE) | repo_id, channel (npm/pypi/github_release/vsce), version, published_at, source | "What's actually shipping on each channel?" had to be hand-queried 4× this session | Sync from `npm view`, `pip index`, `gh release`, marketplace API |
| `repos.publish_channels` | TEXT[] | `mcp-tool-shop-org/sovereignty` ships on PyPI + GitHub Release + npm wrapper; `motif` on none yet; `forkctl` on npm only — no portfolio view today | Derived from above |
| `repos.publisher_method` | enum: `pypi_trusted`, `pypi_token`, `npm_token`, `npm_trusted`, `github_release_only`, `none` | xrpl-lab v1.6.0 ship missed because we assumed `PYPI_TOKEN` when it was Trusted Publisher. Per `feedback_check_publish_stack_before_assuming.md`. | Manual + `.github/workflows/*` heuristic |

### Build / dependency health

| Field | Type | Motivates | Source |
|---|---|---|---|
| `repo_dep_audit_state` (NEW TABLE) | repo_id, severity_high, severity_moderate, severity_low, last_checked_at, last_clean_at | repo-knowledge itself had 5 unaudited vulns we only caught in CI | `npm audit --json` per repo |
| `repo_workflow_actions` (NEW TABLE) | repo_id, action_ref (e.g. `actions/checkout`), pinned_version, latest_known, last_checked_at | The Node 20 deprecation on `actions/checkout@v4` hit npm-launcher AND repo-knowledge in the same session — we caught both manually | YAML scan + dispatch table (latest known versions) |
| `repos.toolchain_pin` | JSON `{node, typescript, python, rust}` | TS 6.0.2 vs 5.9.3 drift between local and CI cost an extra CI cycle | `package.json` / `pyproject.toml` / `rust-toolchain.toml` scan |
| `repos.last_ci_status` + `last_ci_run_at` + `last_ci_url` | TEXT, TEXT, TEXT | Today: every status check is a `gh run list` round-trip. A daily sync would let `rk show` answer "is this repo green right now?" | `gh run list` per repo, 1×/day |

### Audit + posture freshness

| Field | Type | Motivates | Source |
|---|---|---|---|
| `audit_runs.domain_freshness` | JSON `{security_sast: ISO, secrets: ISO, ...}` | Today `Last audited` is one global timestamp — but a Sept secrets pass + a Mar SCA pass should be visibly differentiated | `audit_submit` payload extension |
| `repos.posture_trend` | enum: `improving`, `stable`, `regressing`, `n/a` | Compares last two audits' pass rates. Today `rk show` displays `Pass rate: 9200% (36/80)` (note the % bug — also a roadmap item). | Computed on `audit_submit` |
| Bug: pass-rate display | — | `Pass rate: 9200%` is `36/80 * 100 → 4500% bug?` Either way it's wrong. Caught in `rk show npm-sovereignty` 2026-05-01. | Fix the display formatter |

### Operational health

| Field | Type | Motivates | Source |
|---|---|---|---|
| `db_health_runs` (NEW TABLE) | run_id, run_at, repo_count, fts_entry_count, orphan_path_count, broken_relationship_count, exit_code | A future silent-failure should leave a trace — `rk fsck` populates this | New `rk fsck` command (see Axis 3) |
| `sync_runs` (NEW TABLE) | run_id, started_at, finished_at, owners, dirs_scanned, repos_added, repos_updated, repos_skipped, errors_json, exit_code | `rk sync` had no observability. A silent-failure version would have shown 0 added / 0 updated and we'd have known | Wrap `fullSync` to record |

---

## Axis 2 — Sync gaps + new sync sources

| Source | Currently | Should be |
|---|---|---|
| GitHub orgs | Manual `--owners` list passed to `rk sync` — easy to forget tools | A registered owners list in `rk.config.json`, swarm phase verifies coverage |
| Local trees | Single `--local <root>` passed; `motif`, `forkctl`, etc. live alongside but were never `rk scan`-ed | Recursive auto-scan from `--local` root; `rk sync --local /Volumes/T9-Shared/AI` should pick up everything that has a `.git` |
| Deletion | None — additive only | Sync should mark `lifecycle_status='archived'` (not delete) when GitHub returns 404 for an indexed repo. Hard delete remains opt-in via `rk prune` |
| npm registry | None | Per-repo `npm view <name> version time` for entries with `npm_package_name` set |
| PyPI | None | `pip index versions <name>` or PyPI JSON API for entries with `pypi_package_name` |
| GitHub Releases | `--releases` flag exists but underused | Always pull latest tag + asset names — feeds `repo_published_versions` |
| Marketplace (vsce) | None | `vsce show` for VS Code extensions |
| `npm audit` | None | Per-Node-repo `npm audit --json` 1×/day → `repo_dep_audit_state` |
| Workflow actions | None | YAML scan → `repo_workflow_actions`; cross-reference latest-known table |
| CI status | None | `gh run list --limit 1 --json` per repo 1×/day → `repos.last_ci_*` |
| dogfood-labs | `rk sync-dogfood` works but coverage is uneven | Same auto-discovery as local trees |

---

## Axis 3 — Missing CLI commands (motivated by 2026-05-01 evidence)

| Command | Replaces | Why |
|---|---|---|
| `rk delete <slug>` | Hand-rolled `sqlite3 ... DELETE FROM repos ...` with `PRAGMA foreign_keys=ON` | We did this hand-rolled for `npm-sovereignty`. Cascade-correct, with backup-first prompt. |
| `rk archive <slug>` | Same hand-roll, but flips `lifecycle_status='archived'` instead of deleting — preserves notes/findings | The 112 NULLed-path entries should mostly be archived, not deleted |
| `rk fsck` | None (we'd just stare at the DB and grep) | Reports: orphan rows (FK violations), broken relationships, NULL `local_path` for `lifecycle_status='active'`, stale `local_path` (path doesn't exist on this rig), FTS row-count mismatch, audit-run integrity |
| `rk verify-local [--rig <id>]` | Manual `for r in $(rk list --json) ; ls $r.local_path` | Validates every `local_path` exists on the current rig. Surfaces drift by rig. Updates `repo_local_paths`. |
| `rk diff <slug> --since <date>` | Manual `git log` | What changed in this repo's *DB entry* between two timestamps — useful for audit trails |
| `rk prune --dry-run / --apply` | Manual lookup of GitHub 404s | Marks repos archived when GitHub returns 404; with `--apply` deletes ones already archived for >N days |
| `rk versions <slug>` | `npm view`, `pip index`, `gh release` | Cross-channel published version dashboard for one repo |
| `rk drift <slug>` | None | Reports drift between source-of-truth and registry: source `package.json` vs `npm view`; source `pyproject.toml` vs PyPI; source `bin/<tool>.js` config version vs upstream `repo.tag` |
| `rk health` | None | Portfolio-wide green/yellow/red — combines `last_ci_status`, `repo_dep_audit_state`, `posture_trend`, `repo_workflow_actions` freshness |

---

## Axis 4 — Cross-tool integration

- **shipcheck** — already feeds audit evidence. Add: shipcheck CLI exposes a `--rk-emit` flag that writes a structured JSON receipt to `data/audit-receipts/<slug>/<timestamp>.json` automatically picked up by `rk audit import`.
- **npm-launcher** — wrappers under `npm-launcher/examples/<tool>/` are the canonical source post-`npm-<tool>` repo deletions. Add: a relationship type `wraps` so `@mcptoolshop/sovereignty` (wrapper) → `mcp-tool-shop-org/sovereignty` (source) shows in `rk related`.
- **forge-vault** — game design canon lives there. Add: `repos.forge_vault_path` for game repos so `rk show star-freight` surfaces canon location.
- **rig-bridge** — populates `rigs` table on first cross-rig handoff. Bridge envelope metadata becomes a `repo_facts` source (`bridge.last_handoff`, `bridge.envelope_count`).
- **role-os** — when a role-os mission touches multiple repos, write a `repo_relationships` edge with `relation_type='collaborated_in_mission'` and a fact pointing to the mission ID.

---

## Axis 5 — Concrete dogfood-swarm phase mapping

The swarm's 10-phase model: bug → proactive → humanize → feature × N → final-test → full-treatment.

| Phase | Agenda for next pass against repo-knowledge |
|---|---|
| **Bug** | Fix the `Pass rate: 9200%` display formatter. Add CI step: `rk fsck --strict` against the test fixtures DB. |
| **Proactive** | Add `sync_runs` + `db_health_runs` tables now; schema migration. Wrap `fullSync` to write `sync_runs` rows. Add unit tests for `resolveConfig` covering more variants (already 3 added in PR #6). |
| **Humanize** | Improve `rk show` output: surface `lifecycle_status`, `publish_channels`, `last_ci_status`, posture trend. Fix path display when `local_path IS NULL` (today renders as `Local:` followed by blank). |
| **Feature 1: Lifecycle + path tables** | Migration for `lifecycle_status`, `deprecated_at`, `replaced_by_repo_id`, `repo_local_paths`, `rigs`. Backfill script that uses existing `repo_relationships` (`supersedes` edges → `replaced_by_repo_id`) + GitHub `archived` flag. |
| **Feature 2: Distribution + publish state** | `repo_published_versions` table. Sync workers for npm + PyPI + GitHub Releases. New CLI: `rk versions`, `rk drift`. |
| **Feature 3: Build / dep health** | `repo_dep_audit_state`, `repo_workflow_actions`, `repos.toolchain_pin`, `last_ci_status`. Sync workers. New CLI: `rk health`. |
| **Feature 4: Operational CLI** | `rk delete`, `rk archive`, `rk fsck`, `rk verify-local`, `rk prune`, `rk diff`. All with `--dry-run` where destructive. |
| **Feature 5: Cross-tool relationship vocabulary** | Add `wraps` and `collaborated_in_mission` to the `relation_type` CHECK enum (schema migration with backfill). |
| **Final test** | Run swarm against the actual T9 workspace: confirm `motif`, `forkctl`, `the-fractured-road`, `role-os`, `style-dataset-lab`, `npm-launcher` all get indexed. Confirm `rk health` returns green for repos that ARE green and surfaces real issues for repos that aren't. |
| **Full treatment** | shipcheck → 1.0.6 → 1.1.0 (minor bump for new fields/commands) → README + handbook updates → translations → publish. |

---

## Acceptance criteria for "the swarm landed it"

When the next dogfood-swarm reports complete, this is what should be true:

1. `rk list --json | jq '[.[] | select(.lifecycle_status==null)] | length'` returns `0` — every repo classified.
2. `rk health` exits 0 against a clean fixture DB and exits non-zero against the seeded broken fixture.
3. `rk show sovereignty` displays: `Local:` (Mac path), `Replaced:` (no), `Lifecycle: active`, `Publish channels: pypi, github_release, npm`, `Latest: pypi 2.0.2 (2026-04-30), npm 2.0.2 (2026-05-01), github 2.0.2`, `CI: passing (5min ago)`, `Audit posture: healthy`, `Dep vulns: 0`.
4. `rk versions sovereignty` returns the 3-channel breakdown with timestamps.
5. `rk drift sovereignty` returns "no drift" — and would return drift if we manually edited `package.json` to claim a newer version than npm has.
6. `rk fsck` against the canonical DB completes and writes a `db_health_runs` row.
7. `rk delete <test-slug>` cascades all 11 child tables; `rk archive <test-slug>` flips `lifecycle_status` without deleting child rows.
8. CI workflow registers a daily `rk sync --health-checks` run that records a `sync_runs` row.
9. `motif`, `forkctl`, `the-fractured-road`, `role-os`, `style-dataset-lab`, `npm-launcher` all appear in `rk list`.
10. README + HANDBOOK updated to document the new commands + fields. CHANGELOG entry under 1.1.0.

---

## Out of scope (deliberately)

- **MCP server expansion** — adding 20 new MCP tools for the new fields. Fine to defer; CLI parity first, MCP catch-up next.
- **UI / web view** — "show me the portfolio dashboard" is appealing but the CLI + MCP surfaces should be the truth source first.
- **Cross-org coverage** (e.g. `dogfood-lab` org) — start with `mcp-tool-shop-org` + `mcp-tool-shop`. Expand once the schema settles.
- **Replacing `audit_runs` with the new domain-freshness shape** — additive migration; old shape stays valid.

---

## Companion docs

- Operational details: `/Users/michaelfrilot/.claude/projects/-Volumes-T9-Shared-AI/memory/repo-knowledge.md`
- Skill (auto-loaded): `~/.claude/skills/repo-knowledge/SKILL.md`
- Dogfood-swarm protocol: `/Users/michaelfrilot/.claude/projects/-Volumes-T9-Shared-AI/memory/dogfood-swarm.md`
- The "consult before assuming" rule: `/Users/michaelfrilot/.claude/projects/-Volumes-T9-Shared-AI/memory/feedback_consult_canonical_registry.md`
