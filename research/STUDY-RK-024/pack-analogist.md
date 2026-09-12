STUDY-RK-024 Q3 Analogist — tip `5f74850` · consumer repo-knowledge coding

stop: adjacent analogs for dedicated tests of metadata sync clients vs advisory suggestion layers; name analog + limit.
prerequisite: STUDY-RK-023 done sha=`6e34cc9` PR #14; tip `5f74850`; extras STUDY-RK-004 + STUDY-RK-007 + STUDY-RK-016.
owner: Analogist
fallback: soft folklore or invent coverage % or claim source-from-GH OK → fail-transfer; <6 findings → 🛑 Coordinator.

Six hold-with-limit; two fail-transfer. Context: `src/sync/github.ts` (gh metadata → SQLite) vs `src/sync/dogfood-suggest.ts` (advisory suggestions from synced facts). STUDY-RK-016 gap: sync/github+dogfood-suggest lack module-named suites. HARD: metadata-only; no .swarm; no source-from-GitHub transfer.

1. GitHub REST list/get repository metadata — GitHub Docs — ongoing — https://docs.github.com/en/rest/repos/repos — Hold-with-limit: forge inventory JSON without Contents/blob fetch; dedicated client tests assert list/metadata shapes. Limit: Contents API is a separate surface — rk stays metadata.

2. npm packument/metadata without tarball — npm registry docs — ongoing — https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md — Hold-with-limit: identity/versions via JSON; tarball is explicit. Limit: metadata catalog ≠ checkout.

3. Octokit fixtures / fetch-mock client unit tests — octokit/fixtures — ongoing — https://github.com/octokit/fixtures — Hold-with-limit: dedicated mocked HTTP suites for sync clients; green suite elsewhere ≠ client contract coverage. Limit: Octokit REST ≠ `gh` CLI argv, same mock-the-metadata-boundary idea.

4. Dependabot alerts vs remediation layers — GitHub Dependabot alerts REST — ongoing — https://docs.github.com/en/rest/dependabot/alerts — Hold-with-limit: alert inventory API ≠ suggestion/remediation layer; each needs its own tests. Limit: Dependabot security PRs ≠ dogfood fact queries.

5. BMC CMDB Sync Preview vs Review Suggested — BMC Helix Discovery — ongoing — https://docs.helixops.ai/bin/IT-Operations-Management/Discovery/BMC-Discovery/BMC-Helix-Discovery-25-2-On-Premises/Integrating/CMDB-synchronization/CMDB-Sync-Preview/ — Hold-with-limit: sync-preview models inventory writes; “review suggested” is a separate advisory gate. Limit: CMDB CI graph ≠ SQLite repo_facts.

6. API-client unit tests mock remote calls — Software Engineering SE — ongoing — https://softwareengineering.stackexchange.com/questions/252748/is-it-actually-worth-unit-testing-an-api-client — Hold-with-limit: client tests assert request construction + response parsing under mocks; recommendation/advisory logic is a separate suite. Limit: SOAP/REST clients ≠ `gh`+SQLite suggest.

7. claim source-from-GitHub OK / green vitest = dedicated suite / invent coverage % — Fail-transfer: Security Model + STUDY-RK-007 — no source from GitHub; `github.ts` is metadata via `gh`; inventing % or treating suite-green as module ownership forbidden.

8. Soft folklore: indirect sync/dogfood tests replace dedicated `github` + `dogfood-suggest` suites — Fail-transfer: Soft folklore: 0. No .swarm cited as coverage proof.

Soft folklore: 0. Coverage % invented: 0. Source-from-GH claimed OK: 0. .swarm cited: 0. Did not invent STUDY-RK-051.
✅
