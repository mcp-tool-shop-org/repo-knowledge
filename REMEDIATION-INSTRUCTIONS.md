# Remediation Operator Instructions

You are fixing repos. There are 71 repos that need attention. You are one of several Claudes working in parallel.

---

## Step 1: Claim a repo

Open `F:\AI\repo-knowledge\REMEDIATION-WORKLIST.md`. It's a table. Find a row where Status is `[ ]`. Change it to `[~]` with your name and save the file **before doing anything else**. If a row already shows `[~]` or `[x]`, skip it — another Claude has it.

Only claim ONE repo at a time. Finish it completely before claiming another.

## Step 2: Read the audit

Run `audit_detail` (MCP tool) with the repo's slug. This gives you everything: every control result, every finding, every metric. Read it. Understand what failed and why.

The detailed checklist for your repo is also in `F:\AI\repo-knowledge\REMEDIATION-CHECKLIST.md` — search for the repo's slug. It lists every failing control, every open finding with remediation guidance, and which of the 5 programs apply.

## Step 3: Open the repo

The repo lives at `F:\AI\<repo-name>`. If it's not there, clone it.

## Step 4: Fix the issues

Work through the findings. Fix them in this order — it matters because CI is the enforcement rail for everything else:

1. **CI baseline** — add or fix CI workflow (build, lint, test, fail on errors)
2. **Dependencies** — add lockfile, run audit, fix high vulns, add update mechanism
3. **Supply chain** — pin Actions to SHA, generate SBOM if applicable
4. **Security** — add SAST to CI, fix dangerous code patterns (injection, path traversal, etc.)
5. **Tests** — add tests for critical logic, add regression test for every bug you fix

For every bug or security issue you fix, **add a test that proves the fix works**. No exceptions.

## Step 5: Build and test locally BEFORE pushing

Run the repo's build, lint, and test commands locally. Make sure everything passes.

```bash
# Examples — use whatever the repo actually uses
npm run build && npm test
cargo build && cargo test
python -m pytest
dotnet build && dotnet test
```

**Do not push until local checks pass.** CI failure costs you 30 points.

## Step 6: Push and verify CI

Push your fixes, then verify CI passes:

```bash
git push
gh run list --repo <owner>/<repo> --limit 1
```

If CI is still running, **use the wait time productively** — polish the repo's README, add SECURITY.md if missing, update CHANGELOG, fix docs.

If CI fails:
1. `gh run view <run-id> --repo <owner>/<repo> --log-failed`
2. Fix the failure
3. Push again
4. That's -30 points. Don't let it happen twice.

**Do not move on until CI is green.**

## Step 7: Submit updated audit

After CI is green, submit an updated audit via `audit_submit` (MCP tool). Follow the same 19-domain, 80-control standard from the original audit. The posture should improve to `healthy`. If it doesn't, you missed something — go back and fix it.

## Step 8: Mark done and move on

Go back to `F:\AI\repo-knowledge\REMEDIATION-WORKLIST.md`. Change your `[~]` row to:
```
[x] done by <your-name> <timestamp> | posture: healthy | CI: green
```

Then immediately claim the next `[ ]` repo and repeat from Step 2. **Keep rolling.** Don't stop between repos.

---

## Scoring

| Action | Points |
|--------|--------|
| Each high finding fixed | +10 |
| Each medium finding fixed | +5 |
| Each low finding fixed | +2 |
| Each failing control flipped to pass | +3 |
| CI passes on first push | +20 (PERFECT PUSH) |
| Posture upgraded to healthy | +25 |
| **CI FAILS after your push** | **-30** |
| **CI fails TWICE on same repo** | **-50** |
| Skipped high finding without written justification | -15 |
| Abandoned a repo before finishing | -40 |

The most expensive mistake is a CI failure. Build locally first. A perfect push is worth more than three medium finding fixes.

---

## Reference files (read if you need detail)

- Control catalog: `audit_controls_list` MCP tool, or `F:\AI\repo-knowledge\data\control-registry.json`
- Full audit standard: `F:\AI\repo-knowledge\AUDIT-CONTRACT.md`
- Detailed per-repo checklists: `F:\AI\repo-knowledge\REMEDIATION-CHECKLIST.md`

## Key MCP tools

| Tool | What it does |
|------|-------------|
| `audit_detail` | Full audit for a repo: controls, findings, metrics |
| `audit_posture` | Quick posture check for a repo |
| `audit_submit` | Submit your updated audit after fixes |
| `audit_controls_list` | The 80-control catalog |
| `get_repo` | Repo info, tech stack, docs |

## Do not

- Grab more than one repo at a time
- Push without testing locally first
- Skip high findings without `accepted_risk` + written reason
- Mark a repo done while CI is still running
- Delete code or tests to make things pass
- Submit a partial audit as "pass" — use "incomplete"
- Leave a repo half-done

---

**Go. Claim a repo. Fix it. Green CI. Submit audit. Claim the next one. Keep rolling.**
