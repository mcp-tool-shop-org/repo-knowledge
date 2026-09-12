STUDY-RK-037 Q2 (Practitioner)

stop: docs/source inventory — rk backup/restore vs handbook ops manual cp drift; residual coding or docs PR.
prerequisite: tip `092e841`; STUDY-RK-036 done sha=`83a2514`; STUDY-RK-010 extras.
owner: Practitioner
fallback: inventing backup-equals-publish / npm publish → 🛑.

Eight doc/API sources. All Verifier PASS. Do not invent STUDY-RK-051. No npm publish.

1. CHANGELOG v2.1.0 | Finding: rk backup/restore VACUUM INTO + confirm/atomic. PASS
2. README | Finding: backup/restore commands documented. PASS
3. cli backup | Finding: VACUUM INTO local snapshot. PASS
4. cli restore | Finding: schema verify, confirm-gated, WAL clear, atomic swap. PASS
5. pre-migration auto-snapshot | Finding: openDb snapshots before migrations. PASS
6. CLI-PR-001 | Finding: round-trip + newer-schema refuse tests. PASS
7. local-only | Finding: backup/restore are local DB ops, not registry publish. PASS
8. Residual handbook ops cp drift | path: site/src/content/docs/handbook/operations.md | Finding: still shows manual `cp` — held for docs PR. PASS

Invented backup-equals-publish: 0. Soft folklore: 0.

✅
