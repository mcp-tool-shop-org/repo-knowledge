STUDY-RK-028 Q3 Analogist — tip `3cd5312` · consumer repo-knowledge coding

stop: adjacent analogs for operator docs of native addon vs prebuild install paths; name analog + limit.
prerequisite: STUDY-RK-027 done sha=`d537696` PR #18; tip `3cd5312`; extras STUDY-RK-017.
owner: Analogist
fallback: soft folklore that prebuilds cover every platform / eliminate all native needs → fail-transfer; <6 findings → 🛑 Coordinator.

Six hold-with-limit; two fail-transfer. Context: rk/`better-sqlite3` dual path — README + handbook getting-started + operations already say C/C++ tools OR prebuilds on supported platforms; STUDY-RK-017. Operator docs must keep both paths honest. Do not publish.

1. better-sqlite3 troubleshooting (prebuild miss → compile) — WiseLibs — ongoing — https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/troubleshooting.md — Hold-with-limit: vendor docs name dual path for operators. Limit: vendor guide ≠ rk handbook, same “document both paths” duty.

2. prebuild-install / --build-from-source — npm prebuild-install — ongoing — https://www.npmjs.com/package/prebuild-install — Hold-with-limit: operators can force compile; miss still needs toolchain. Limit: generic installer ≠ rk-specific ops page.

3. node-gyp-build: use prebuild if present else rebuild — prebuild/node-gyp-build — ongoing — https://github.com/prebuild/node-gyp-build/blob/master/README.md — Hold-with-limit: install script documents fallback; `--build-from-source` override. Limit: bundled-prebuildify model ≠ better-sqlite3 download model, same dual-path doc pattern.

4. node-gyp OS toolchain requirements — nodejs/node-gyp README — ongoing — https://github.com/nodejs/node-gyp/blob/master/README.md — Hold-with-limit: operator docs must list Python + C++ tools per OS when native path runs. Limit: generic gyp ≠ SQLite amalgamation details.

5. Node.js Learn: C/C++ + Python for native addons — Node.js Docs — ongoing — https://nodejs.org/learn/node-api/getting-started/tools — Hold-with-limit: platform install recipes belong in operator onboarding. Limit: general Node learn ≠ rk handbook.

6. better-sqlite3 npm “Prebuilt binaries… troubleshooting” — npm package page — ongoing — https://www.npmjs.com/package/better-sqlite3 — Hold-with-limit: package surface tells operators prebuilds are major platforms only; trouble → guide. Limit: npm blurb ≠ full ops runbook.

7. soft folklore that prebuilds cover every platform / eliminate all native needs — Fail-transfer: unsupported Node/ABI/arch/runtime still needs node-gyp; ops docs must keep the compile path.

8. Soft folklore that “prebuilt binaries automatically” means never document toolchains — Fail-transfer: Soft folklore: 0. Handbook already pairs both; lag would mislead Alpine/Bun/odd ABI operators.

Soft folklore: 0. Universal-prebuild-no-compile claimed: 0. Did not invent STUDY-RK-051. Did not publish.
✅
