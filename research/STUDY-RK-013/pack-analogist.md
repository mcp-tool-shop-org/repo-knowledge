STUDY-RK-013 Q3 Analogist — tip `cb1fed6` · consumer repo-knowledge

stop: operational-runs migration-010 (analogs).
prerequisite: STUDY-RK-012 done sha=`cb1fed6`; tip `cb1fed6`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: migration-010 adds append-only `db_health_runs` + `sync_runs` (start INSERT / finish UPDATE; NULL `finished_at` >24h → fsck.incompleteSyncRuns) to kill silent-zero `rk sync`.

1. GitHub Actions workflow runs / jobs (`conclusion` null while incomplete) — GitHub REST — ongoing — https://docs.github.com/en/rest/actions/workflow-jobs — Hold-with-limit: append-only run history; null conclusion/`completed_at` marks unfinished work; limit: hosted CI vs local SQLite sync_runs.

2. Apache Airflow DagRun `end_date` null while RUNNING — Airflow docs / models — ongoing — https://airflow.apache.org/docs/apache-airflow/stable/_api/airflow/models/dagrun/index.html — Hold-with-limit: unfinished runs keep null end timestamp until terminal state; limit: scheduler state machine vs rk 24h fsck heuristic.

3. ETL / pipeline_runs watermark tables (`finished_at` / `run_end` null) — Wicked Smart Data / ETL LLD practice — ongoing — https://www.wickedsmartdata.com/articles/building-a-pipeline-metadata-store-tracking-run-history-data-volumes-and-audit-trails-for-production-workflows — Hold-with-limit: append run rows with counts; incomplete = no finish stamp; limit: watermark advance ≠ rk owner/dir JSON fields.

4. Unix cron syslog CMD lines vs exit/output observability — Cronitor / cron manpages — ongoing — https://cronitor.io/guides/where-are-cron-logs-stored — Hold-with-limit: launch-only logs hide silent-zero/success-without-evidence; explicit start/finish trail is the fix; limit: syslog ≠ structured sync_runs schema.

5. ITIL / ITSM change records as operational audit trail — ITIL 4 change practice — ongoing — https://checkflow.io/blog/it-change-management-checklist — Hold-with-limit: every change leaves an append-only record through close/PIR; zero-impact still recorded; limit: CAB workflow ≠ fsck/sync CLI.

6. SQL Server Agent `sysjobhistory` run trail — Microsoft Docs — ongoing — https://learn.microsoft.com/en-us/sql/relational-databases/system-tables/dbo-sysjobhistory-transact-sql — Hold-with-limit: scheduled jobs leave history rows with status/duration; operators query incomplete/in-progress; limit: msdb vs SQLite SoR.

7. sync may omit sync_runs rows — Fail-transfer: FT-4 / `src/sync/index.ts` writes a sync_runs row at start and UPDATEs at completion; omitting the trail is the regression migration-010 closes.

8. Soft folklore that zero repos_added means no run row needed — Fail-transfer: counts default 0; a finished zero-work sync still gets finished_at + exit_code so silent-zero is observable. Soft folklore: 0.

Soft folklore: 0. Omit-sync_runs claimed: 0. Did not invent STUDY-RK-021.
✅
