STUDY-RK-027 Q3 Analogist — tip `db556c6` · consumer repo-knowledge coding

stop: adjacent analogs for inventory-of-published-versions vs publish mutators; name analog + limit.
prerequisite: STUDY-RK-026 done sha=`2534110` PR #17; tip `db556c6`; extras STUDY-RK-010.
owner: Analogist
fallback: soft folklore that sync/publish.ts publishes packages → fail-transfer; <6 findings → 🛑 Coordinator.

Six hold-with-limit; two fail-transfer. Context: `src/sync/publish.ts` GETs npm/PyPI/GH Releases → upserts `repo_published_versions` only. HARD: Do not publish. Filename “publish” ≠ mutator.

1. npm packument GET vs publish PUT — npm registry docs — ongoing — https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md — Hold-with-limit: GET `/{package}` inventories versions; PUT publishes with attachments. Limit: same URL path, opposite verbs — rk uses GET only.

2. PyPI JSON inventory vs Upload API — PyPI Docs — ongoing — https://docs.pypi.org/api/json/ — Hold-with-limit: `GET /pypi/<name>/json` lists releases; upload is separate POST to upload.pypi.org. Limit: JSON catalog ≠ twine mutate.

3. PyPI Upload / twine — PyPI Upload API — ongoing — https://docs.pypi.org/api/upload/ — Hold-with-limit: mutator surface is explicit POST multipart; not implied by JSON read. Limit: Warehouse upload ≠ local SQLite upsert.

4. GitHub Releases list (GET) vs create (POST) — GitHub REST — ongoing — https://docs.github.com/en/rest/releases/releases — Hold-with-limit: list is inventory; create needs write scope. Limit: `gh release list` mirror ≠ release create.

5. `cargo search` vs `cargo publish` — Cargo Book — ongoing — https://doc.rust-lang.org/cargo/commands/cargo-search.html — Hold-with-limit: search/API lists crates; publish uploads `.crate`. Limit: crates.io mutate permanence ≠ ephemeral inventory sync.

6. npm view (CLI read) vs npm publish — npm Docs — ongoing — https://docs.npmjs.com/cli/v10/commands/npm-view — Hold-with-limit: view/packument read-only; publish mutates registry. Limit: reading `time`/versions ≠ authority to publish.

7. soft folklore that `sync/publish.ts` publishes packages — Fail-transfer: module only GETs registries and upserts local rows; HARD no publish path; Do not publish.

8. Soft folklore that filename “publish.ts” implies registry write rights — Fail-transfer: Soft folklore: 0. Name is publish-state inventory, not mutator.

Soft folklore: 0. Publish-to-registry claimed: 0. Did not invent STUDY-RK-051. Did not publish.
✅

**Verifier flag (do not land as verified):** Analogist #1 PUT-publish clause — cited REGISTRY-API.md page shows GET inventory; PUT half not verified on that page. Soft folklore: 0. Publish-mutator: 0.
