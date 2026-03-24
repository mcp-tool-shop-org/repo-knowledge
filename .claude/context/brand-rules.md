# Brand Rules — @mcptoolshop/repo-knowledge

## Tone

Honest catalog. The system stores, indexes, and queries org knowledge. It does not assess, recommend, or certify. Audit posture reflects what was imported, not what is true about the repo.

## Domain language

| Term | Meaning | Must not be confused with |
|------|---------|--------------------------|
| Catalog | SQLite database of repo identity, tech, notes, docs, facts, relationships, audit evidence | A "dashboard" or "portal" |
| Sync | Pull metadata from GitHub API and local repos into the catalog | "Real-time monitoring" |
| Audit evidence | Imported structured results (runs, controls, findings, metrics) from external auditors | "Verification" or "certification" |
| Posture | Summary derived from imported audit evidence | "Current security state" (it reflects last import, not live state) |
| FTS5 search | Full-text search across indexed content | "Semantic search" or "AI search" |
| Control | One of 80 canonical check items in the audit framework | A "rule" or "policy" (controls are evidence-checked, not enforced) |

## Enforcement bans

- "verified" / "certified" when describing audit posture (posture reflects imports, not live truth)
- "complete knowledge" / "all repos indexed" (sync has scope limits)
- "real-time" / "live" when describing catalog data (it's point-in-time import)
- "secure" / "compliant" based on audit posture alone (posture can have duplicated findings or stale data)

### Contamination risks

1. **Posture inflation** — duplicated findings inflating severity counts make posture unreliable
2. **Schema drift silence** — missing audit tables returning zeros instead of errors
3. **Stale evidence pretense** — audit posture from months ago presented without age context
4. **Search completeness pretense** — FTS5 index not rebuilt after writes, missing recent data
