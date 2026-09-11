# STUDY-RK-010 — Research grounding (verified — copy)

1. Lit. Registry-read / inventory vs publish mutators (hold where Verifier verified). Scholar #8: unverified.
2. Docs. GET registry/PyPI/GH Releases → upsert repo_published_versions only; no publish path in publish.ts. MCP repo_versions DB-only.
3. Analogs hold-with-limit: registry view vs mutate; PyPI JSON vs twine; cargo search vs mutate; GH Releases list vs create; SBOM vs artifact release; SAM catalog vs distribute. #7-#8 fail-transfer.

**Unverified / do not land as verified:** Scholar #8; Analogist #7-#8 fail-transfer.

**Invented gates: 0** — Sync-may-publish · publish.ts-publishes-packages · Soft folklore · Publish-to-registry claimed.

Verifier: Scholar 7/8 (#8 unverified) · Practitioner 8/8 · Analogist 1-6 hold; 7-8 fail-transfer.

HARD: Do not publish.
Do not invent STUDY-RK-021.
