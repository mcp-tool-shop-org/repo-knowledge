# repo-knowledge: how it works

Mapped at 2026-09-23 from commit 8236017.

## What this is

11 parts. Work enters through 3 doors; the busiest is CI, which reaches 4 parts.

## What changed since the last map

This is the first map.

## What comes in

1. **CI.** On a pull request touching 10 paths; on a push to main touching 10 paths; or by hand. Runs scripts/postbuild.js, src/ and test/.
2. **Release.** When a tag matching `v*.*.*` is pushed; or by hand. Runs scripts/gen-audit-report.mjs, scripts/gen-worklist.mjs, scripts/postbuild.js and 2 more.
3. **Deploy site to GitHub Pages.** On a pull request touching 2 paths; on a push to main touching 2 paths; or by hand. Runs no file this map can see.

## What happens through CI

1. The workflow runs scripts/postbuild.js in scripts, src/ in src and test/ in test.
2. That reaches the repository root (1 file).
3. It writes to data/.

## Who reads the results

- **data/** is read by package.json (found by text).

## The other doors

**Release** runs scripts/gen-audit-report.mjs, scripts/gen-worklist.mjs, scripts/postbuild.js and 2 more, reaches the repository root, writes to REMEDIATION-WORKLIST.md, audit_report.md and data/, publishes to npm, and creates a GitHub release.

**Deploy site to GitHub Pages** runs no file this map can see and deploys the site.

## What breaks what

- **the repository root** is imported by 1 part (src) and sits on the path of 2 doors.
- **src** is imported only from tests, by 1 part (test), and sits on the path of 2 doors.
- **scripts** is imported by no other part and sits on the path of 2 doors.
- **test** is imported by no other part and sits on the path of 2 doors.

## What tends to change together

- **src/mcp/server.ts** and **test/mcp-server.test.ts** changed together in 6 of 7 commits, and the test part imports the src part.
- **src/db/init.ts** and **test/migration-sequence.test.ts** changed together in 10 of 13 commits, and the test part imports the src part.
- **src/index.ts** and **test/migration-sequence.test.ts** changed together in 7 of 10 commits, and the test part imports the src part.
- **src/index.ts** and **src/sync/index.ts** changed together in 5 of 8 commits, inside the src part.
- **test/migration-sequence.test.ts** and **test/publish-state.test.ts** changed together in 6 of 10 commits, inside the test part.

Confidence is low: fewer than 20 source files reach 10 revisions in the window.

Window: 180 days; a pair counts from 3 shared commits.

## What no test touches

- **scripts** is imported by no test.

## Written but never read

- **AUDIT-WORKLIST.md** is written by scripts/gen-audit-worklist.mjs and read by nothing else in this repository.
- **ENRICHMENT-WORKLIST.md** is written by scripts/gen-enrichment-worklist.mjs and read by nothing else in this repository.
- **REMEDIATION-CHECKLIST.md** is written by scripts/gen-remediation-checklist.mjs and read by nothing else in this repository.
- **REMEDIATION-WORKLIST.md** is written by scripts/gen-worklist.mjs and read by nothing else in this repository.
- **audit_report.md** is written by scripts/gen-audit-report.mjs and read by nothing else in this repository.
- **data/** is written by src/cli.ts and read by nothing else in this repository.

## Helpers that look duplicated

No two parts export a helper that looks alike.

## Generated, never hand-edited

- **AUDIT-WORKLIST.md** is written by scripts/gen-audit-worklist.mjs.
- **ENRICHMENT-WORKLIST.md** is written by scripts/gen-enrichment-worklist.mjs.
- **REMEDIATION-CHECKLIST.md** is written by scripts/gen-remediation-checklist.mjs.
- **REMEDIATION-WORKLIST.md** is written by scripts/gen-worklist.mjs.
- **audit_report.md** is written by scripts/gen-audit-report.mjs.
- **data/** is written by src/cli.ts.

## Hand-authored

People write .claude/, .github/, assets/, research/, site/ and templates/. Nothing in this repository writes to them.

## Where to start

.github/workflows/ci.yml → test/ → package.json → data/ → package.json

Read those in order to follow one pull request end to end.

## What this map cannot see

- 3 writes and 39 reads use paths built at run time and are not named here.
- Readers marked (found by text) come from scanning unparsed files.
- Statistics confidence is low: fewer than 20 source files reach 10 revisions in the window.

Regenerate with `npx --yes @dogfood-lab/atlas map`.
