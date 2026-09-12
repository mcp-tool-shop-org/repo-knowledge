STUDY-RK-066 Q3 Analogist — tip `7a8871a`
Six hold-with-limit; two fail-transfer. Soft folklore invent backup=publish / invent merge-#23: 0. STUDY-RK-081 invented: 0.

1. SQLite VACUUM INTO as live backup snapshot — SQLite VACUUM — ongoing — https://sqlite.org/lang_vacuum.html — Hold-with-limit: tip backup path matches vendor primitive; docs PR only teaches it. Limit: INTO output must not pre-exist; not a registry publish.

2. Verify-before-replace + refuse unsafe rename while live — SQLite howtocorrupt — ongoing — https://www.sqlite.org/howtocorrupt.html — Hold-with-limit: tip restore probes backup then confirm-gates swap; tests optional, discipline already in CLI. Limit: corruption essay ≠ vitest suite requirement on docs PR.

3. Docs-only contributions need content checks, not new product test suites — GitHub Docs contributing — ongoing — https://docs.github.com/en/contributing/collaborating-on-github-docs/about-contributing-to-github-docs — Hold-with-limit: handbook fix PRs are reviewable without inventing CLI negative tests. Limit: github/docs CI ≠ rk; still rejects invent tests-on-#23.

4. kubectl delete --interactive / confirm before destroy — Kubernetes Docs — ongoing — https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/ — Hold-with-limit: confirm-gated restore mirrors explicit consent; --yes is opt-out of prompt, not silent default. Limit: cluster delete ≠ DB restore; same gate shape.

5. etcd/pg style stage+verify restore — etcd recovery — ongoing — https://etcd.io/docs/latest/op-guide/recovery/ — Hold-with-limit: restore is staged validation then cutover, not publish. Limit: etcd member recovery ≠ SQLite file swap; rejects backup=publish.

6. Stale/open docs PR: warn; never auto-merge — github/gh-aw stale-pr-cleanup — ongoing — https://github.com/github/gh-aw/blob/main/.github/workflows/stale-pr-cleanup.md — Hold-with-limit: #23 stays one-page review; tip cp docs debt held until land. Limit: 30-day bot ≠ invent merge-#23.

7. Soft folklore invent backup=publish / invent merge-#23 / invent docs-PR-must-add-tests — Fail-transfer: Soft folklore: 0. STUDY-RK-037: optional CLI negative tests not required on docs PR. 🛑 do not merge #23.

8. invent STUDY-RK-081 or treat tip CLI backup as missing because handbook still says cp — Fail-transfer: do not invent STUDY-RK-081; tip CLI authority holds; docs drift ≠ coding gap; review ≠ merge.

Verifier: Analogist 1–6 HOLD · 7–8 FAIL-TRANSFER. Soft folklore: 0.

✅
