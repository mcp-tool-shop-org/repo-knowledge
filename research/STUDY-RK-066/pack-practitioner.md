STUDY-RK-066 Q2 (Practitioner)
Eight doc/API sources. NEW backup/restore test PR required: **no**. 🛑 do not merge #23.

1. Tip CLI paths | `src/cli.ts` | Finding: rk backup (VACUUM INTO) and rk restore [--yes] present on tip. PASS

2. Tip tests | `test/cli-publish.test.ts` CLI-PR-001 | Finding: No dedicated test/*backup* files. Yes CLI IT: backup→mutate→restore round-trip + restore refuses newer schema_version. migration-sequence covers pre-backup separately. PASS

3. Tip handbook stale | operations.md | Finding: Still cp recipe — docs drift (RK-037 target). PASS

4. PR #23 files | https://github.com/mcp-tool-shop-org/repo-knowledge/pull/23 | Finding: OPEN. Files only CHANGELOG + operations.md. Docs-only. Head `d56c5ed`. 🛑 do not merge. PASS

5. STUDY-RK-037 KEEP | grounding.md | Finding: Docs PR; optional CLI negative tests NOT required; backup-equals-publish do not invent. PASS

6. PR #23 vs tip test gap | Finding: #23 handbook only; tip already holds CLI IT; #23 does not duplicate tests. PASS

7. Residual NEW backup/restore test PR? | Finding: **no**. Residual = docs tracked by OPEN #23. PASS

8. Invent gates | STUDY-RK-081: 0 · backup=publish: 0 · mandatory-new-test-PR: 0. PASS

Verifier: Practitioner 8/8 PASS. NEW backup/restore test PR: no.

✅
