STUDY-RK-017 Q3 Analogist — tip `68cc064` · consumer repo-knowledge

stop: better-sqlite3 native vs prebuild (analogs).
prerequisite: STUDY-RK-016 done sha=`68cc064`; tip `68cc064`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: rk depends on `better-sqlite3@^12` (install via `prebuild-install` then `node-gyp rebuild`); README: C/C++ tools or prebuilds on supported platforms.

1. better-sqlite3 install: prebuild-install || node-gyp — WiseLibs troubleshooting — ongoing — https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/troubleshooting.md — Hold-with-limit: prefers downloaded prebuild; falls back to native compile when ABI/platform missing; limit: rk inherits that dual path.

2. prebuild-install Node/Electron/N-API runtimes — npm prebuild-install — ongoing — https://www.npmjs.com/package/prebuild-install — Hold-with-limit: fetches tagged GitHub prebuilds by runtime/arch; `--build-from-source` skips download; limit: miss → compile still required.

3. Electron rebuild + prebuild download — @electron/rebuild — ongoing — https://github.com/electron/rebuild — Hold-with-limit: Electron ABI often needs rebuild even when Node prebuilds exist; limit: rk is Node CLI/MCP, same “wrong ABI → rebuild” class.

4. Node-API ABI stability across majors — Node.js Docs — ongoing — https://nodejs.org/api/n-api.html — Hold-with-limit: N-API reduces rebuild churn across Node majors; limit: better-sqlite3 still ships platform/ABI-specific binaries; stability ≠ universal prebuild matrix.

5. napi-rs / optionalDependencies platform packages — napi-rs package template — ongoing — https://github.com/napi-rs/package-template — Hold-with-limit: split optional native packages vs single-package prebuilds; both still fail on unsupported targets; limit: different delivery, same native-vs-prebuild tension.

6. Bundled SQLite amalgamation vs system/libsql.js WASM — better-sqlite3 compilation + sql.js — ongoing — https://github.com/WiseLibs/better-sqlite3/blob/master/docs/compilation.md — Hold-with-limit: better-sqlite3 bundles amalgamation into the native addon (not system libsqlite by default); sql.js avoids native build via WASM; limit: rk chooses native SoR performance over WASM portability.

7. prebuilds eliminate all native build needs on every platform — Fail-transfer: unsupported Node/Electron/ABI/arch still triggers node-gyp; CI without toolchains fails when prebuild miss.

8. Soft folklore that “npm install always uses only system libsqlite” — Fail-transfer: default is bundled amalgamation + prebuild/native addon; Soft folklore: 0.

Soft folklore: 0. Universal-prebuild-no-compile claimed: 0. Did not invent STUDY-RK-021.
✅
