STUDY-RK-065 Q3 Analogist — tip `f2629d5`
Six hold-with-limit; two fail-transfer. Soft folklore invent silent-delete-default / invent merge-#22: 0. STUDY-RK-081 invented: 0.

1. PR Tracker: detect open PRs touching the same files before reinventing — playsrc/pr-tracker-action — ongoing — https://github.com/playsrc/pr-tracker-action/blob/main/README.md — Hold-with-limit: tip gap ≠ license to open a second cli-note-delete suite while #22 owns that path. Limit: Action comment ≠ auto-merge #22.

2. Pre-flight PR deduplication / retry circuit-breaker — github/gh-aw #28843 — ongoing — https://github.com/github/gh-aw/pull/28843 — Hold-with-limit: search open/closed PRs on the topic before opening another; block duplicate agent lands. Limit: Copilot workflow ≠ this swarm; same no-duplicate rule.

3. kubectl delete requires explicit delete (+ optional --interactive) — Kubernetes Docs — ongoing — https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/ — Hold-with-limit: destroy path is named; confirmation gates exist; not a silent default of add. Limit: k8s grace/force ≠ rk note; supports KEEP explicit --delete.

4. MCP kubectl DestructiveHint / --allow-destructive opt-in — tamcore/kubectl-mcp — ongoing — https://github.com/tamcore/kubectl-mcp — Hold-with-limit: destructive ops are annotated and opt-in, not collapsed into ordinary writes. Limit: cluster MCP ≠ rk CLI; same explicit-delete discipline.

5. Classify set/clear suite on tip ≠ note-delete suite — tip `test/classify.test.ts` — ongoing — (local path) — Hold-with-limit: present classify tests pin set/clear only; they do not substitute for #22’s note --delete file; do not invent classify --delete. Limit: local tip file is authority for classify only.

6. Stale/open study PR: warn; never auto-merge — github/gh-aw stale-pr-cleanup — ongoing — https://github.com/github/gh-aw/blob/main/.github/workflows/stale-pr-cleanup.md — Hold-with-limit: #22 stays review-only one-page; tip absence of the test file is expected until land. Limit: 30-day bot ≠ invent merge-#22.

7. Soft folklore invent silent-delete-default / invent merge-#22 / invent parallel tip suite while #22 open — Fail-transfer: Soft folklore: 0. Explicit --delete only; 🛑 do not merge #22; do not duplicate the OPEN suite onto tip via a second PR.

8. invent STUDY-RK-081 or treat tip ABSENT file as coding bug requiring immediate new PR — Fail-transfer: do not invent STUDY-RK-081; tip vs PR authority — suite lives on #22; review ≠ merge.

Verifier: Analogist 1–6 HOLD · 7–8 FAIL-TRANSFER. Soft folklore: 0.

✅
