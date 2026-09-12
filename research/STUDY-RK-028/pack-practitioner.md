STUDY-RK-028 Q2 (Practitioner)

stop: docs/source inventory — how README/handbook/operations document better-sqlite3 install (C++ tools vs prebuild) vs package.json/vendor reality; gaps to fix in docs PR.
prerequisite: STUDY-RK-027 done sha=`d537696` PR #18; tip `3cd5312`; clone `/workspace/studio/repo-knowledge`; extras STUDY-RK-017.
owner: Practitioner
fallback: path/URL mismatch -> flag; <6 findings -> Coordinator.

Eight doc/API sources. I did not invent prebuild platform coverage or STUDY-RK-051. Do not publish.

1. STUDY-RK-017 grounding | org: local research | date: tip tree `3cd5312` | path: `/workspace/studio/repo-knowledge/research/STUDY-RK-017/grounding.md` | Finding: better-sqlite3 ^12.8.0; README C/C++ or auto-prebuild; vendor prebuild-install || node-gyp; Invented Universal-prebuild-no-compile / platform coverage: 0.

2. package.json + lock reality | org: local | date: tip `3cd5312` | paths: package.json, package-lock.json | Finding: dep better-sqlite3 ^12.8.0 (lock 12.8.0); engines node >=20; hasInstallScript + deps bindings + prebuild-install ^7.1.1; better-sqlite3 engines 20.x||22.x||23.x||24.x||25.x — no product-level install script.

3. Vendor install script | org: WiseLibs/better-sqlite3 | date: 2026-03-13 (v12.8.0) | URL: https://raw.githubusercontent.com/WiseLibs/better-sqlite3/v12.8.0/package.json | Finding: install is prebuild-install || node-gyp rebuild --release — docs never name this dual path or link troubleshooting.md.

4. README Requirements (aligned short form) | org: local | date: tip `3cd5312` | path: README.md | Finding: Node.js 20+, gh, C/C++ build tools for better-sqlite3, or prebuild binaries automatically on supported platforms — no matrix, no prebuild-install wording.

5. handbook getting-started mirrors README | org: local | date: tip `3cd5312` | path: site/src/content/docs/handbook/getting-started.md | Finding: same three requirements (prebuilt spelling); install npm install -g only — no failure path or vendor link.

6. handbook operations troubleshooting | org: local | date: tip `3cd5312` | path: site/src/content/docs/handbook/operations.md | Finding: better-sqlite3 build fails section cites Could not locate the bindings file; Ubuntu build-essential / macOS xcode-select / Windows VS Build Tools; Prebuilt binaries are used automatically on many platforms — still no prebuild-install || node-gyp or WiseLibs troubleshooting URL.

7. handbook beginners gap | org: local | date: tip `3cd5312` | path: site/src/content/docs/handbook/beginners.md | Finding: Prerequisites list Node 20+, gh, GitHub org only — omits better-sqlite3 / C++ / prebuild entirely (unlike README/getting-started).

8. Docs PR gap list (inventory) | org: local | date: tip `3cd5312` | paths: above | Finding: sync beginners Prerequisites with README/getting-started; name dual path prebuild-first then compile; link https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md; note Node engines alignment (>=20 vs vendor listed majors); do not invent a platform coverage table.

Prebuild-platform-coverage invented: 0 · STUDY-RK-051 invented: 0

✅
