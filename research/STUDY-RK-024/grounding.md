# STUDY-RK-024 — Research grounding (verified — copy)

STUDY-RK-024 Research grounding · tip `5f74850`

Verifier: Scholar 6/8 (#1 Ribeiro · #6 Agrawal → unverified) · Practitioner 8/8 · Analogist 1–6 hold-with-limit; 7–8 fail-transfer. Invented gates: 0. Flag Scholar #1/#6.

Thesis (coding, not coverage %): HARD metadata-only — mock gh JSON / local repo_facts; never checkout GitHub source; never copy .swarm sqlite. Land dedicated vitest for src/sync/github.ts + src/sync/dogfood-suggest.ts (no module-named suites today; coverage split across sync-404-archived + dogfood-*). Lock: fetchGitHubRepos + malformed degrade; fetchReleases; syncGitHub(+pruneVanished); suggestByRepo/suggestBySurface(+escapeLike); thin: validateGhIdentifier, recommendations bucket, unparseable fact JSON skip. Floors remain thresholds only.

**Unverified / do not land as verified:** Scholar #1/#6; Analogist #7–#8 fail-transfer.

**Invented gates: 0** — Coverage % · STUDY-RK-051 · GitHub-source-fetch.

**HARD:** metadata-only; never copy `.swarm`; never checkout GitHub source.

stop: dedicated vitest for sync/github + dogfood-suggest. Do not merge. Do not invent STUDY-RK-051.
