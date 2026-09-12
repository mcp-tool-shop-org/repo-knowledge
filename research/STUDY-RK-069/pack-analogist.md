STUDY-RK-069 Q3 Analogist — tip `df55e34`
Six hold-with-limit; two fail-transfer. Soft folklore invent missing command: 0. STUDY-RK-081 invented: 0.

1. kubectl conventions: command itself should not have built-in aliases — Kubernetes SIG-CLI — ongoing — https://github.com/kubernetes/community/blob/main/contributors/devel/sig-cli/kubectl-conventions.md — Hold-with-limit: one canonical verb/noun; type aliases ≠ inventing a second top-level command. Limit: kubectl ≠ rk; rejects invent operational-runs.

2. CLI design: pick one canonical name; alias chaos forces three names — crouton-kit cli-design — ongoing — https://github.com/crouton-labs/crouton-kit/blob/main/plugins/authoring/skills/cli-design/SKILL.md — Hold-with-limit: document abbreviations of the canonical; do not treat synonyms as equals. Limit: skill doc ≠ Commander; same no-phantom rule.

3. gh run list canonical; gh run ls abbreviation — GitHub CLI — ongoing — https://cli.github.com/manual/gh_run_list — Hold-with-limit: short form abbreviates list, does not invent a different noun. Limit: Actions runs ≠ sync_runs; naming pattern holds.

4. AWS Batch ListJobs API vs operator CLI surface — AWS Batch API — ongoing — https://docs.aws.amazon.com/batch/latest/APIReference/API_ListJobs.html — Hold-with-limit: ledger exists under registered name; inventing parallel CLI verb from table name is Soft folklore. Limit: cloud API ≠ SQLite; tip rk runs already lists.

5. journalctl is the CLI; sd-journal is the library — systemd journalctl — ongoing — https://www.freedesktop.org/software/systemd/man/journalctl.html — Hold-with-limit: storage/API name ≠ required CLI rename. Limit: journald ≠ rk; rejects inventing CLI from table identifiers.

6. Airflow DagRun / K8s Job objects listed via existing verbs — kubectl quick-reference — ongoing — https://kubernetes.io/docs/reference/kubectl/quick-reference/ — Hold-with-limit: use established list/get verbs; do not invent second command from long object name. Limit: cluster jobs ≠ tip runs; KEEP rk runs.

7. Soft folklore invent missing command / invent rk operational-runs / invent table-name-as-CLI — Fail-transfer: Soft folklore: 0. KEEP rk runs; MCP ops_runs already paired. Concrete gap = no.

8. invent STUDY-RK-081 or treat short canonical verb as incomplete vs long phantom — Fail-transfer: do not invent STUDY-RK-081; STUDY-RK-041 stands.

Verifier: Analogist 1–6 HOLD · 7–8 FAIL-TRANSFER. Soft folklore: 0.

✅
