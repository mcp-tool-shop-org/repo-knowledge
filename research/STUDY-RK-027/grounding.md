# STUDY-RK-027 — Research grounding (verified — copy)

STUDY-RK-027 Research grounding · tip `db556c6`

Verifier: Scholar 8/8 · Practitioner 8/8 · Analogist 1–6 hold-with-limit (#1 PUT clause flagged); 7–8 fail-transfer. Invented gates: 0. Did not publish.

Thesis: publish.ts = GET inventory → upsert repo_published_versions only. Filename ≠ mutator. MCP repo_versions DB-only. CLI versions/drift/bind may GET on --refresh; never publish. HARD: Do not publish. Docs PR only for publish-state ≠ npm publish / MCP DB-only vs CLI --refresh if handbook silent. No publish APIs.

**Unverified / do not land as verified:** Analogist #1 PUT-publish clause (flagged); Analogist #7–#8 fail-transfer only.

**Invented gates: 0** — Sync-may-publish · publish.ts-publishes-packages · Soft folklore · Publish-to-registry · STUDY-RK-051.

HARD: Do not publish. Do not npm publish. Do not invent STUDY-RK-051.
