# STUDY-RK-089 — pack-analogist

Tip `5dd98ea` · REAFFIRM 027/060 · #18 OPEN · consumer repo-knowledge

stop: publish-state inventory ≠ registry-publish docs stays open-PR debt; invent publish-mutator / tip-already-documented / risk-free merge / npm publish / STUDY-RK-101 = fail.
prerequisite: tip `5dd98ea` verified; #18 OPEN (docs only: handbook + README Publish-State say publish-state ≠ npm publish; `src/sync/publish.ts` GETs registries → upserts `repo_published_versions` only; MCP `repo_versions` DB-only). Tip `publish.ts` header already inventory-only; tip README Publish-State table lacks the explicit ≠-mutator warning #18 adds. No git. No execute. NEVER npm publish.
owner: Analogist

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. npm view / packument GET ≠ npm publish — https://docs.npmjs.com/cli/v12/commands/npm-view/ · https://docs.npmjs.com/cli/v12/commands/npm-publish/ — Hold-with-limit: view is read inventory; publish mutates the registry; rk publish-state mirrors view, not publish. Limit: CLI docs ≠ local SQLite upsert.

2. npm package-metadata / packument responses (GET inventory) — https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md — Hold-with-limit: packument lists published versions for consumers; does not authorize upload. Limit: cite GET metadata only (do not invent PUT-from-REGISTRY-API folklore).

3. PyPI JSON API ≠ Upload API — https://docs.pypi.org/api/json/ · https://docs.pypi.org/api/upload/ — Hold-with-limit: GET `/pypi/<name>/json` inventories releases; upload is a separate POST surface. Limit: Warehouse upload ≠ `repo_published_versions` rows.

4. GitHub Releases list (GET) ≠ create (POST) — https://docs.github.com/en/rest/releases/releases — Hold-with-limit: list/inventory needs read; create needs write scope — rk only lists. Limit: REST scopes ≠ handbook prose.

5. `cargo search` ≠ `cargo publish` — https://doc.rust-lang.org/cargo/commands/cargo-search.html — Hold-with-limit: search lists crates; publish uploads `.crate`; filename “publish” in rk is inventory sync, not crates.io mutate. Limit: crates.io permanence ≠ ephemeral DB upsert.

6. Open/stale docs PR ≠ tip (REAFFIRM 060) — https://github.com/github/gh-aw/blob/main/.github/workflows/stale-pr-cleanup.md — Hold-with-limit: #18 holds the explicit ≠-mutator docs; review ≠ tip-already-documented; open debt stays open. Limit: cleanup workflow ≠ merge recommendation.

7. Soft folklore invent publish-mutator / tip-already-documented / risk-free merge / npm publish — Fail-transfer: `publish.ts` does not publish packages; do not run npm publish; tip docs still lack #18’s explicit warning.

8. Invent STUDY-RK-101 / treat open #18 as tip authority — Fail-transfer: do not invent 101; tip beats PR heads; do not Analogist-fake Scholar/Practitioner.

Soft folklore: 0. Publish-to-registry claimed: 0. npm publish executed: 0. Did not invent STUDY-RK-101.
🛑 do not invent merge of #18; HARD never npm publish; filename≠mutator.
