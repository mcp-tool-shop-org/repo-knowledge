STUDY-RK-023 Q3 Analogist — tip `55fcc39` · consumer repo-knowledge coding

stop: adjacent analogs for dedicated tests of doctor vs feed vs table health surfaces (probe / change-feed / portfolio rollup); name analog + limit.
prerequisite: STUDY-RK-022 done sha=`53e8137` PR #13; tip `55fcc39`; extras STUDY-RK-009 + STUDY-RK-016.
owner: Analogist
fallback: soft folklore or invent coverage % → fail-transfer row; <6 findings → 🛑 Coordinator.

Six hold-with-limit; two fail-transfer. Context: `src/health/doctor.ts` (single-repo deep-dive) · `feed.ts` (portfolio change default) · `table.ts` (portfolio rollup). Shared `test/health-commands.test.ts` already names three describe blocks; STUDY-RK-016 still flags doctor/feed/table as via shared suite. Green vitest ≠ dedicated suite per module. Coverage % invented: 0.

1. Kubernetes liveness vs readiness vs startup probes — Kubernetes docs — ongoing — https://kubernetes.io/docs/concepts/workloads/pods/probes/ — Hold-with-limit: three probe kinds need distinct configs/tests; conflating them breaks the surface. Maps to doctor≠feed≠table. Limit: kubelet restart semantics ≠ rk DB reads.

2. Prometheus `promtool test rules` for alert vs recording rules — Prometheus docs — ongoing — https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/ — Hold-with-limit: dedicated YAML unit tests per rule class; green scrape ≠ rule-suite coverage. Limit: PromQL ≠ TypeScript builders.

3. `brew doctor` deep diagnostic — Homebrew manpage — ongoing — https://docs.brew.sh/Manpage — Hold-with-limit: single-system deep-dive with named checks; distinct from list/outdated portfolio views. Limit: Homebrew install health ≠ build-health CVE/CI grades.

4. SRE monitoring three output types (page / ticket / log) — Google SRE Book Ch.6 — ongoing — https://sre.google/sre-book/monitoring-distributed-systems/ — Hold-with-limit: feed≈page-worthy deltas, table≈overview, doctor≈decision deep-dive; each needs its own asserts. Limit: pager duty ≠ CLI health. [unverified — Verifier: page is tickets/email/pages, not page/ticket/log]

5. Grafana Synthetic Monitoring probes — Grafana Cloud docs — ongoing — https://grafana.com/docs/grafana-cloud/observe-and-act/testing/synthetic-monitoring/introduction/ — Hold-with-limit: probe checks are first-class tested surfaces, not implied by dashboard green. Limit: black-box HTTP ≠ SQLite health builders.

6. Grafana TestData: dashboard scenarios vs alert scenarios — Grafana docs — ongoing — https://grafana.com/docs/grafana/latest/datasources/testdata/alerting/ — Hold-with-limit: alert fixtures ≠ panel fixtures; same data-source family still needs dedicated tests per surface. Limit: Grafana UI ≠ rk text/JSON renderers.

7. green vitest = dedicated suite per module / invent coverage % — Fail-transfer: shared `health-commands.test.ts` can go green without proving per-module file ownership; inventing % forbidden.

8. Soft folklore: three describe() blocks in one file = three dedicated module suites — Fail-transfer: Soft folklore: 0. Describe titles ≠ `doctor.test.ts` / `feed.test.ts` / `table.test.ts` ownership.

Soft folklore: 0. Coverage % invented: 0. Did not invent STUDY-RK-051.
✅
