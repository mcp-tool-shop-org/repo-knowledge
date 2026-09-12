STUDY-RK-068 Q3 Analogist — tip `385492b`
Six hold-with-limit; two fail-transfer. Soft folklore invent doctor-as-write-path / repair-as-side-effect: 0. STUDY-RK-081 invented: 0. Concrete gap: no.

1. brew doctor diagnoses; does not upgrade — Homebrew Manpage — ongoing — https://docs.brew.sh/Manpage — Hold-with-limit: check system, exit non-zero on problems; repair is separate. Limit: brew ≠ rk DB; same diagnose≠mutate.

2. Flyway info/validate vs migrate/repair — Redgate Flyway — ongoing — https://www.red-gate.com/hub/product-learning/flyway/flyways-validate-command-explained-simply/ — Hold-with-limit: validate/info report drift; migrate/repair write. Limit: Flyway ≠ rk meta; rejects doctor-as-write-path.

3. Prisma migrate status vs migrate deploy/dev — Prisma Docs — ongoing — https://www.prisma.io/docs/orm/prisma-migrate/workflows/troubleshooting — Hold-with-limit: status/troubleshoot reads; reset/deploy are explicit write paths. Limit: Prisma ≠ tip doctor; same split.

4. kubectl get reads; kubectl apply writes — Kubernetes kubectl reference — ongoing — https://kubernetes.io/docs/reference/kubectl/ — Hold-with-limit: get/list ≠ apply/create. Limit: cluster ≠ config JSON; maps to tip doctor vs --refresh.

5. MySQL CHECK TABLE ≠ REPAIR TABLE — MySQL 8.0 Ref — ongoing — https://dev.mysql.com/doc/refman/8.0/en/check-table.html — Hold-with-limit: check is diagnostic; repair is a different verb. Limit: InnoDB ≠ SQLite; Soft folklore diagnose=repair fails.

6. Pre-migration VACUUM INTO snapshot on open/migrate path — SQLite VACUUM — ongoing — https://sqlite.org/lang_vacuum.html — Hold-with-limit: tip snapshots before migration ladder in openDb, not as doctor side-effect. Limit: inventing VACUUM onto doctor is Soft folklore.

7. Soft folklore invent doctor-as-write-path / invent repair-as-side-effect / invent migration-must-run-on-doctor — Fail-transfer: Soft folklore: 0. KEEP default-read; --refresh opt-in; config FS-only; migration on openDb. Concrete gap = no.

8. invent STUDY-RK-081 or treat dual doctor names as a bug — Fail-transfer: do not invent STUDY-RK-081; STUDY-RK-039 KEEP dual doctor stands.

Verifier: Analogist 1–6 HOLD · 7–8 FAIL-TRANSFER. Soft folklore: 0.

✅
