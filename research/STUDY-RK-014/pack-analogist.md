STUDY-RK-014 Q3 Analogist — tip `96662ef` · consumer repo-knowledge

stop: security model no telemetry / tokens never in DB (analogs).
prerequisite: STUDY-RK-013 done sha=`96662ef`; tip `96662ef`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: README/SECURITY — no telemetry/phone-home; GitHub sync inherits `gh` auth; credentials never stored in knowledge.db; data stays local.

1. Git credential helpers (osxkeychain / libsecret / wincred) — Git Docs — ongoing — https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage — Hold-with-limit: tools inherit OS/helper store; secrets stay out of project DB; limit: plaintext `store` helper is a weaker sibling, not rk’s model.

2. `gh auth login` / system credential store (+ `GH_TOKEN` env) — GitHub CLI manual — ongoing — https://cli.github.com/manual/gh_auth_login — Hold-with-limit: tokens live in OS store or env, not in a product SQLite; limit: rk shells out to `gh`, does not re-home tokens.

3. Chromium password encryption via OS keychain / Secret Service — Chromium Linux Password Storage — ongoing — https://chromium.googlesource.com/chromium/src/+/master/docs/linux/password_storage.md — Hold-with-limit: secrets keyed by OS credential backend, not dumped into arbitrary app tables; limit: browser Login Data ≠ knowledge catalog schema.

4. HashiCorp Vault AppRole short-lived tokens (no long-lived secret in app DB) — HashiCorp — ongoing — https://developer.hashicorp.com/vault/docs/auth/approle — Hold-with-limit: apps fetch ephemeral credentials from a secret plane; product DB must not become the token store; limit: rk has no Vault — inherits `gh` instead.

5. VS Code telemetry opt-out / local-first data folder — VS Code Docs — ongoing — https://code.visualstudio.com/docs/configure/telemetry — Hold-with-limit: operator can keep the tool local with no phone-home; credentials for sync use OS keychain; limit: optional Settings Sync cloud ≠ rk’s hard no-telemetry claim.

6. Self-hosted privacy analytics (Plausible CE / Matomo) vs SaaS phone-home — Plausible vs Matomo self-host guides — ongoing — https://selfhosting.sh/compare/plausible-vs-matomo/ — Hold-with-limit: keep operational metrics on operator infra or omit; do not ship user/host tokens off-box; limit: analytics products ≠ knowledge SoR, same local-first stance.

7. product may phone-home or store token files in knowledge.db — Fail-transfer: SECURITY/README forbid telemetry and credential persistence; sync inherits `gh` only.

8. Soft folklore that copying `GH_TOKEN` into a meta/facts row is fine for “offline sync” — Fail-transfer: tokens never belong in knowledge.db; inherit CLI/OS helpers. Soft folklore: 0.

Soft folklore: 0. Phone-home/token-in-DB claimed: 0. Did not invent STUDY-RK-021.
✅
