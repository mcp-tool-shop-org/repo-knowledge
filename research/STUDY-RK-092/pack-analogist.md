STUDY-RK-092 Q3 Analogist — tip `05bd41c` · REAFFIRM STUDY-RK-035 / STUDY-RK-065 · #22 OPEN · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · keep #22 OPEN while tip ABSENT `test/cli-note-delete.test.ts`; invent tip-already-covered / silent-delete-default / risk-free merge #22 / duplicate-of-#22 / STUDY-RK-101 = fail.
prerequisite: tip `05bd41c` matches `origin/main`. #22 OPEN (“STUDY-RK-035 note --delete CLI integration tests”) — sole open PR adding `test/cli-note-delete.test.ts` (success / not-found exit 1 / misuse exit 2; mirrors `test/cli-publish.test.ts` cwd+temp DB). Tip: that path ABSENT. Tip `src/cli.ts` KEEP explicit `note --delete` (content required unless `--delete`); `classify` is set/clear only (no `--delete` on classify). Tip `test/db.test.ts` has unit `deleteNote`; tip `test/classify.test.ts` present. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: 🛑 Coordinator if invent gates fire.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. Named destroy path + optional confirm — kubectl delete — https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/ — Hold-with-limit: destroy is a named verb; `--interactive` gates bulk delete; `--force` is opt-in bypass, not the default of create/apply. Limit: k8s grace periods ≠ rk note rows; supports KEEP explicit `--delete`, not invent silent-delete-default on add.

2. Interactive remove vs force-never-prompt — GNU rm(1) — https://www.man7.org/linux/man-pages/man1/rm.1.html — Hold-with-limit: `-i`/`-I` prompt before removal; `-f` suppresses prompts — force is not the quiet default of write. Limit: filesystem unlink ≠ catalog notes; same anti-silent-delete discipline for CLI flags.

3. Unit API coverage ≠ CLI integration coverage — tip `test/db.test.ts` `deleteNote` suite (local path) — Hold-with-limit: library hard-delete tests pin DB behavior; they do not exercise Commander wiring, exit codes, or `--delete` misuse paths that #22 adds as IT. Limit: local tip file is authority for DB only; invent tip-already-covered = fail-transfer.

4. Path-disjoint open PR ≠ tip coverage — playsrc/pr-tracker-action — https://github.com/playsrc/pr-tracker-action/blob/main/README.md — Hold-with-limit: detect open PRs owning the same path before reinventing; tip absence of `test/cli-note-delete.test.ts` is expected debt while #22 stays OPEN. Limit: Action review comments ≠ invent risk-free merge of #22.

5. Pre-flight PR dedupe / no second suite on same path — github/gh-aw #28843 — https://github.com/github/gh-aw/pull/28843 — Hold-with-limit: search open PRs on the topic before opening another; #22 already owns `test/cli-note-delete.test.ts` — invent duplicate-of-#22 fails. Limit: Copilot agent workflow ≠ this swarm; same no-duplicate rule.

6. Classify set/clear suite ≠ note-delete IT — tip `test/classify.test.ts` (local) + REAFFIRM STUDY-RK-065 — Hold-with-limit: classify pins lifecycle setters only; do not invent `classify --delete` or treat classify coverage as a substitute for note `--delete` IT. Limit: tip classify file authority for set/clear only.

7. Soft folklore invent tip-already-covered / silent-delete-default / risk-free merge #22 / duplicate-of-#22 — Fail-transfer: tip ABSENT the IT file; KEEP explicit `--delete`; open #22 is review debt, not tip clearance (REAFFIRM 065). Soft folklore: 0.

8. Invent STUDY-RK-101 / treat #22 head as tip authority / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 101; tip `05bd41c` beats PR heads; Analogist stays adjacent-domain only.

Soft folklore tip-already-covered / silent-delete-default / risk-free merge #22 / duplicate-of-#22: 0. Did not invent STUDY-RK-101. Staged `/workspace/studio/outbox-STUDY-RK-092/pack-analogist.md`.
🛑 do not invent merge of #22; KEEP explicit `--delete`; classify set/clear only ≠ note-delete IT.

✅ · 🛑 · 🔧
