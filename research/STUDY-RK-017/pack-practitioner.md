STUDY-RK-017 Q2 (Practitioner)

stop: better-sqlite3 native vs prebuild (docs + source).
prerequisite: STUDY-RK-016 done sha=`68cc064`; tip `68cc064`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch -> flag; Coordinator if <6 findings.

Eight doc/API sources. I did not invent prebuild coverage claims or STUDY-RK-021.

1. package.json better-sqlite3 pin | org: mcp-tool-shop-org/repo-knowledge | date: 2026-06-22 (a301d0e on file; tree tip 68cc064) | path: `/workspace/studio/repo-knowledge/package.json` | Finding: runtime dep `better-sqlite3` `^12.8.0`, engines `node` `>=20`, plus `@types/better-sqlite3` `^7.6.0` in devDependencies; no product-level `optionalDependencies` or install script for sqlite.

2. package-lock resolved 12.8.0 + install hook | org: local lockfile | date: tip `68cc064` | path: `/workspace/studio/repo-knowledge/package-lock.json` (`node_modules/better-sqlite3`) | Finding: resolves `better-sqlite3@12.8.0` from npm registry with `hasInstallScript: true` and dependencies `bindings` + `prebuild-install` `^7.1.1` (engines node 20.x||22.x||23.x||24.x||25.x).

3. README Install Requirements | org: mcp-tool-shop-org/repo-knowledge | date: 2026-06-22 (a301d0e) | path: `/workspace/studio/repo-knowledge/README.md` (mirrored in locale READMEs) | Finding: product states Node.js 20+, authenticated `gh`, and \\"C/C++ build tools for `better-sqlite3`, or prebuild binaries will be used automatically on supported platforms\\" — no platform matrix listed in-repo.

4. WiseLibs better-sqlite3 README Installation | org: WiseLibs/better-sqlite3 | date: fetched 2026-09-12 (master README) | URL: https://raw.githubusercontent.com/WiseLibs/better-sqlite3/master/README.md | Finding: vendor says install via `npm install better-sqlite3`; \\"Prebuilt binaries are available for major platforms/architectures\\"; points install failures to troubleshooting.md; documents ESM `import Database from 'better-sqlite3'` then `new Database(...)` + recommended WAL pragma.

5. better-sqlite3@12.8.0 install script (native fallback) | org: WiseLibs/better-sqlite3 | date: 2026-03-13 (v12.8.0 release) | URL: https://raw.githubusercontent.com/WiseLibs/better-sqlite3/v12.8.0/package.json | Finding: `"install": "prebuild-install || node-gyp rebuild --release"` — prebuild first, compile from source on miss; files include `binding.gyp` and native `src/**/*.[ch]pp`.

6. v12.8.0 release prebuild assets exist (no coverage claim) | org: WiseLibs/better-sqlite3 | date: 2026-03-13 | URL: https://github.com/WiseLibs/better-sqlite3/releases/tag/v12.8.0 | Finding: release publishes many `better-sqlite3-v12.8.0-node-v*-{darwin,linux,linuxmusl,win32}-*.tar.gz` (and electron variants); product README does not enumerate which of these apply to `@mcptoolshop/repo-knowledge` installs — assets listed, coverage not asserted here.

7. src/db/init.ts open path | org: local | date: 2026-06-21 (9a45fd4 on file; tip 68cc064) | path: `/workspace/studio/repo-knowledge/src/db/init.ts` | Finding: ESM default + type import from `better-sqlite3`; singleton `openDb` does `_db = new Database(dbPath)` then `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000` (comment notes default busy handler is 0ms without explicit timeout).

8. Other product Database constructors | org: local | date: tip `68cc064` | paths: `src/sync/swarm.ts`, `src/cli.ts` | Finding: swarm opens with `new Database(dbPath, { readonly: true, fileMustExist: true })`; CLI backup/schema probes use `new Database(..., { readonly: true })` — still the same native addon import, no alternate sqlite driver.

Also noted (vendor advanced, not product default): https://raw.githubusercontent.com/WiseLibs/better-sqlite3/master/docs/compilation.md documents `--build-from-source --sqlite3=...` for custom amalgamation; repo-knowledge `package.json` scripts do not invoke that path.

Prebuild platform coverage invented: 0 · STUDY-RK-021 invented: 0

✅
