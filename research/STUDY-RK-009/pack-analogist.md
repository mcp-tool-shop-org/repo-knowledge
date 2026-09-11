STUDY-RK-009 Q3 Analogist — tip `2dd0bb5` · consumer repo-knowledge

stop: doctor / fsck / build-health (analogs).
prerequisite: STUDY-RK-008 done sha=`2dd0bb5`; tip `2dd0bb5`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: `src/health` — `doctor` (single-repo deep-dive), `fsck` (DB integrity + `db_health_runs` trail), `feed`/`table` (portfolio surfaces); env `rk doctor` preflight.

1. Homebrew `brew doctor` — Homebrew — ongoing — https://docs.brew.sh/rubydoc/Homebrew/Cmd/Doctor.html — Hold-with-limit: named diagnostic checks + nonzero exit / JSON findings for env preflight; limit: warns without mutating state—mirrors env `rk doctor`, not DB-mutating fsck.

2. Unix `fsck` / e2fsck integrity checker — Linux man pages — ongoing — https://man7.org/linux/man-pages/man8/fsck.8.html — Hold-with-limit: structured integrity pass over a store with exit codes; limit: classic fsck logs via journal, not an in-DB `db_health_runs` table—rk raises the bar by writing the trail itself.

3. Kubernetes doctor/diagnostics (kubectl-doctor / cluster dump) — community + K8s docs — ongoing — https://github.com/davidcollom/kubectl-doctor — Hold-with-limit: read-only anomaly scan over cluster catalog (orphans, NotReady, leftovers); limit: cluster API inventory ≠ SQLite catalog, same doctor UX pattern.

4. SRE CMDB / portfolio health table — ServiceNow CMDB health practice — ongoing — https://www.servicenow.com/docs/r/servicenow-platform/configuration-management-database-cmdb/c_CompsandProcessIDandReconcil.html — Hold-with-limit: portfolio feed/table over CIs for operators; limit: CMDB dashboards are multi-source; rk `health table/feed` is DB-only reads over build-health facts.

5. Compiler `-verify` diagnostic verification — Clang Internals — ongoing — https://clang.llvm.org/docs/InternalsManual.html — Hold-with-limit: expected vs actual diagnostics fail closed for correctness; limit: verifies compiler output, not a persistent ops run trail—still a structured health gate.

6. Medical “doctor” UX for ops (brew/kubectl metaphor) — Homebrew + kubectl-doctor READMEs — ongoing — Hold-with-limit: single “doctor” verb = deep structured report when operator decides to engage (Dowding/Beyer cited in `doctor.ts`); limit: UX metaphor ≠ clinical system; don’t invent healing writes.

7. fsck may omit audit-row writes when product writes `db_health_runs` — Fail-transfer: `runFsck` always `insertDbHealthRun` before return; omitting the trail contradicts the product contract.

8. Soft folklore that doctor/fsck/table are interchangeable one surface — Fail-transfer: three distinct intents (entity deep-dive / integrity+trail / portfolio feed); soft folklore: 0.

Soft folklore: 0. Omit-audit-row claimed: 0. Did not invent STUDY-RK-021.
✅
