STUDY-RK-010 Q3 Analogist — tip `ee3ccb9` · consumer repo-knowledge

stop: publish-state vs npm (analogs). Do not publish.
prerequisite: STUDY-RK-009 done sha=`ee3ccb9`; tip `ee3ccb9`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: `src/sync/publish.ts` GETs npm/PyPI/GH Releases into `repo_published_versions` (source label `npm_view`); upserts local SoR only — never `npm publish` / cargo publish / release create.

1. npm packument GET / `npm view` vs `npm publish` PUT — npm Docs / registry — ongoing — https://docs.npmjs.com/cli/v12/commands/npm-view/ — Hold-with-limit: view/packument is read-only metadata mirror; publish mutates registry with tarball; limit: reading `time`/versions ≠ authority to PUT.

2. PyPI JSON API vs twine upload — PyPI Docs — ongoing — https://docs.pypi.org/api/json/ — Hold-with-limit: `/pypi/<name>/json` inventories releases read-only; upload is separate POST to upload.pypi.org; limit: JSON catalog ≠ write path.

3. `cargo search` / crates.io GET vs `cargo publish` PUT — Cargo Book — ongoing — https://doc.rust-lang.org/cargo/commands/cargo-search.html — Hold-with-limit: search/API lists crates; publish uploads `.crate`; limit: permanent publish vs ephemeral search.

4. GitHub Releases list (GET) vs create (POST) — GitHub REST — ongoing — https://docs.github.com/en/rest/releases/releases — Hold-with-limit: list releases is inventory; create needs contents:write; limit: rk mirrors list into DB, does not create releases.

5. SBOM / software inventory vs artifact publish — CISA/Docker SBOM practice — ongoing — https://www.cisa.gov/sites/default/files/2023-04/sbom-types-document-508c.pdf — Hold-with-limit: SBOM is read inventory of what shipped; publishing the artifact is a distinct mutate; limit: inventory sync ≠ releasing packages.

6. CMDB SAM software model catalog vs install/distribute — ServiceNow SAM — ongoing — https://github.com/ServiceNow/ServiceNowDocs/blob/australia/markdown/it-service-management/software-asset-management-foundation-plugin/t_AddASoftwareModelSAMF.md — Hold-with-limit: software model is catalog identity; install/catalog-request is separate action; limit: cataloging published versions locally ≠ pushing packages out.

7. publish-state sync may publish to npm — Fail-transfer: `syncNpmVersion` only GETs `registry.npmjs.org/<name>` and upserts rows; HARD no publish path in this module.

8. Soft folklore that registry read credentials imply publish rights — Fail-transfer: read packument needs no publish token; soft folklore: 0. Did not publish.

Soft folklore: 0. Publish-to-npm claimed: 0. Did not invent STUDY-RK-021.
✅
