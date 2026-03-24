-- Migration 004: Make audit findings idempotent
-- Canonical finding identity = (audit_run_id, domain, title, severity)
-- Prevents duplicate findings from inflating posture counts on re-import.

-- Step 1: Remove existing duplicates (keep lowest id per group)
DELETE FROM audit_findings WHERE id NOT IN (
  SELECT MIN(id) FROM audit_findings
  GROUP BY audit_run_id, domain, title, severity
);

-- Step 2: Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_findings_canonical
  ON audit_findings(audit_run_id, domain, title, severity);

-- Update schema version
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '4');
