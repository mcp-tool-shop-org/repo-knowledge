-- migration 003: Add revised metric columns and control result fields
-- Matches the full audit standard v2 metrics spec

PRAGMA foreign_keys = ON;

-- Add missing metrics columns (SQLite ADD COLUMN is safe — no-ops if exists)
ALTER TABLE audit_metrics ADD COLUMN controls_na INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN controls_not_run INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN findings_open_critical INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN findings_open_high INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN findings_open_medium INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN findings_open_low INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN findings_open_info INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN domains_checked_count INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN dependency_count INTEGER;
ALTER TABLE audit_metrics ADD COLUMN ci_present INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN tests_present INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN container_present INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN iac_present INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN deploy_present INTEGER DEFAULT 0;
ALTER TABLE audit_metrics ADD COLUMN integrations_count INTEGER;

-- Add evidence array field to control results
ALTER TABLE audit_control_results ADD COLUMN evidence TEXT;
-- Add summary field (distinct from notes) to control results
ALTER TABLE audit_control_results ADD COLUMN summary TEXT;
-- Add domain to control results for faster queries
ALTER TABLE audit_control_results ADD COLUMN domain TEXT;

-- Add evidence array to findings
ALTER TABLE audit_findings ADD COLUMN evidence TEXT;

-- Add repo_url to audit_runs
ALTER TABLE audit_runs ADD COLUMN repo_url TEXT;

-- Update schema version
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '3');
