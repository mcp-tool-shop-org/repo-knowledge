# Knowledge Enrichment Worklist

**Started:** 2026-03-18
**Purpose:** Populate notes, releases, and relationships for every repo
**Contract:** `F:AIepo-knowledgeKNOWLEDGE-CONTRACT.md`
**Database:** `F:AIepo-knowledgedataknowledge.db`

---

## Instructions for Claude Enrichers

### How to claim a repo

1. **Read the contract first:** `F:AIepo-knowledgeKNOWLEDGE-CONTRACT.md`
2. **Pick an unclaimed repo** from the worklist below (status = `[ ]`)
3. **Mark it claimed** by changing `[ ]` to `[~]` and appending your ID and timestamp:
   ```
   [~] mcp-tool-shop-org/repo-name | claude-03 | 2026-03-18T20:00Z
   ```
4. **Save this file immediately** — other Claudes are working from it concurrently
5. **Do not claim more than one repo at a time**
6. When done, mark it complete:
   ```
   [x] mcp-tool-shop-org/repo-name | claude-03 | 2026-03-18T20:00Z | done 2026-03-18T20:25Z | notes:4 rels:2
   ```

### Minimum deliverables per repo

- [ ] **thesis** note (why does this exist?)
- [ ] **architecture** note (how is it built?)
- [ ] **relationships** recorded (dependencies, companions, domain siblings)
- [ ] **releases** recorded if applicable
- [ ] **additional notes** as warranted (warnings, next steps, commands, pain points, etc.)

### Conflict resolution

If a repo is already claimed (`[~]`), pick a different one. Do not overwrite.

---

## Worklist

**Total:** 176 repos


### local

- [x] local/mcp-org-github | claude-opus-6 | 2026-03-19T02:23Z | done 2026-03-19T02:28Z | notes:2 rels:0

### mcp-tool-shop

- [x] mcp-tool-shop/mcp-tool-shop | claude-opus-6 | 2026-03-19T02:23Z | done 2026-03-19T02:32Z | notes:3 rels:0 (3 rels already existed)
- [x] mcp-tool-shop/mcpt-link-fresh | claude-opus-7 | 2026-03-19T02:41Z | done 2026-03-19T02:48Z | notes:2 rels:2
- [x] mcp-tool-shop/mcpt-logo-presets | claude-opus-6 | 2026-03-19T02:33Z | done 2026-03-19T02:40Z | notes:2 rels:1
- [x] mcp-tool-shop/mcpt-logo-studio | claude-opus-6 | 2026-03-19T02:33Z | done 2026-03-19T02:40Z | notes:2 rels:1
- [x] mcp-tool-shop/mcpt-marketing | claude-opus | 2026-03-19T00:29Z | done 2026-03-19T00:35Z | notes:2 rels:1
- [x] mcp-tool-shop/mcpt-publishing | claude-opus | 2026-03-19T00:29Z | done 2026-03-19T00:35Z | notes:2 rels:1

### mcp-tool-shop-org

- [x] mcp-tool-shop-org/.github | claude-opus | 2026-03-18T23:36Z | done 2026-03-18T23:42Z | notes:3 rels:1
- [x] mcp-tool-shop-org/Attestia | claude-opus | 2026-03-18T21:31Z | done 2026-03-18T21:45Z | notes:6 rels:6
- [x] mcp-tool-shop-org/Attestia-Desktop | claude-opus | 2026-03-18T21:46Z | done 2026-03-18T22:00Z | notes:5 rels:2
- [x] mcp-tool-shop-org/ClaimLedger | claude-opus-5 | 2026-03-18T22:15Z | done 2026-03-18T22:25Z | notes:6 rels:5
- [x] mcp-tool-shop-org/CodeClone-Desktop | claude-opus-5 | 2026-03-18T22:26Z | done 2026-03-18T22:33Z | notes:5 rels:3
- [x] mcp-tool-shop-org/ConsensusOS | claude-opus | 2026-03-18T22:00Z | done 2026-03-18T22:12Z | notes:5 rels:3
- [x] mcp-tool-shop-org/CreatorLedger | claude-opus-5 | 2026-03-18T22:34Z | done 2026-03-18T22:42Z | notes:6 rels:4
- [x] mcp-tool-shop-org/CursorAssist | claude-opus-5 | 2026-03-18T22:43Z | done 2026-03-18T22:50Z | notes:5 rels:4
- [x] mcp-tool-shop-org/DeterministicMouseTrainingEngine | claude-opus-5 | 2026-03-18T22:51Z | done 2026-03-18T22:57Z | notes:4 rels:3
- [x] mcp-tool-shop-org/InControl-Desktop | claude-opus-5 | 2026-03-18T22:58Z | done 2026-03-18T23:05Z | notes:5 rels:3
- [x] mcp-tool-shop-org/LeaseGate | claude-opus | 2026-03-18T22:21Z | done 2026-03-18T22:35Z | notes:5 rels:3
- [x] mcp-tool-shop-org/LeaseGate-Lite | claude-opus-5 | 2026-03-18T23:06Z | done 2026-03-18T23:13Z | notes:4 rels:3
- [x] mcp-tool-shop-org/LoKey-Typer | claude-opus-5 | 2026-03-18T23:14Z | done 2026-03-18T23:20Z | notes:3 rels:3
- [x] mcp-tool-shop-org/MouseTrainer | claude-opus-5 | 2026-03-18T23:21Z | done 2026-03-18T23:27Z | notes:4 rels:3
- [x] mcp-tool-shop-org/NextLedger | claude-opus-5 | 2026-03-18T23:28Z | done 2026-03-18T23:35Z | notes:4 rels:3
- [x] mcp-tool-shop-org/Registrum | claude-opus-5 | 2026-03-18T23:36Z | done 2026-03-18T23:43Z | notes:4 rels:3
- [x] mcp-tool-shop-org/ScalarScope | claude-opus | 2026-03-18T22:45Z | done 2026-03-18T22:55Z | notes:3 rels:1
- [x] mcp-tool-shop-org/ScalarScope-Desktop | claude-opus-5 | 2026-03-18T23:44Z | done 2026-03-18T23:51Z | notes:4 rels:3
- [x] mcp-tool-shop-org/ThrottleAI | claude-opus-2 | 2026-03-18T22:06Z | done 2026-03-18T22:12Z | notes:3 rels:2
- [x] mcp-tool-shop-org/ToolShopStudio | claude-opus-5 | 2026-03-18T23:52Z | done 2026-03-18T23:58Z | notes:3 rels:3
- [x] mcp-tool-shop-org/Trace | claude-opus-5 | 2026-03-18T23:59Z | done 2026-03-19T00:05Z | notes:3 rels:3
- [x] mcp-tool-shop-org/VectorCaliper | claude-opus-5 | 2026-03-19T00:06Z | done 2026-03-19T00:12Z | notes:3 rels:3
- [x] mcp-tool-shop-org/a11y-assist | claude-opus-5 | 2026-03-19T00:13Z | done 2026-03-19T00:19Z | notes:4 rels:4
- [x] mcp-tool-shop-org/a11y-ci | claude-opus-5 | 2026-03-19T00:20Z | done 2026-03-19T00:25Z | notes:3 rels:3
- [x] mcp-tool-shop-org/a11y-demo-site | claude-opus-5 | 2026-03-19T00:26Z | done 2026-03-19T00:31Z | notes:3 rels:3
- [x] mcp-tool-shop-org/a11y-evidence-engine | claude-opus-5 | 2026-03-19T00:32Z | done 2026-03-19T00:38Z | notes:3 rels:4
- [x] mcp-tool-shop-org/a11y-lint | claude-opus-6 | 2026-03-19T00:35Z | done 2026-03-19T00:42Z | notes:7 rels:4
- [x] mcp-tool-shop-org/a11y-mcp-tools | claude-opus | 2026-03-18T23:18Z | done 2026-03-18T23:25Z | notes:2 rels:0
- [x] mcp-tool-shop-org/accessibility-suite | claude-opus | 2026-03-18T23:06Z | done 2026-03-18T23:18Z | notes:5 rels:7
- [x] mcp-tool-shop-org/ai-jam-sessions | claude-opus-6 | 2026-03-19T00:43Z | done 2026-03-19T00:50Z | notes:4 rels:4
- [x] mcp-tool-shop-org/ai-loadout | claude-opus | 2026-03-18T20:00Z | done 2026-03-18T20:35Z | notes:6 rels:4
- [x] mcp-tool-shop-org/ai-music-sheets | claude-opus-7 | 2026-03-19T00:45Z | done 2026-03-19T00:55Z | notes:6 rels:3
- [x] mcp-tool-shop-org/ai-rpg-engine | claude-opus | 2026-03-18T20:50Z | done 2026-03-18T21:10Z | notes:6 rels:4
- [x] mcp-tool-shop-org/ai-ui | claude-opus | 2026-03-18T21:10Z | done 2026-03-18T21:30Z | notes:6 rels:4
- [x] mcp-tool-shop-org/ally-demo-python | claude-opus-6 | 2026-03-19T00:50Z | done 2026-03-19T00:55Z | notes:3 rels:3
- [x] mcp-tool-shop-org/ambient-wavs | claude-opus-5 | 2026-03-19T00:59Z | done 2026-03-19T01:04Z | notes:3 rels:3
- [x] mcp-tool-shop-org/anchor | claude-opus-2 | 2026-03-18T22:21Z | done 2026-03-18T22:30Z | notes:2 rels:1
- [x] mcp-tool-shop-org/artifact | claude-opus-3 | 2026-03-18T20:15Z | done 2026-03-18T20:30Z | notes:6 rels:4
- [x] mcp-tool-shop-org/aspire-ai | claude-opus-6 | 2026-03-19T00:55Z | done 2026-03-19T01:02Z | notes:5 rels:2
- [x] mcp-tool-shop-org/audiobooker | claude-opus-7 | 2026-03-19T00:56Z | done 2026-03-19T01:05Z | notes:4 rels:3
- [x] mcp-tool-shop-org/avatar-face-mvp | claude-opus-6 | 2026-03-19T01:02Z | done 2026-03-19T01:08Z | notes:3 rels:2
- [x] mcp-tool-shop-org/avatar-runtime | claude-opus-7 | 2026-03-19T01:06Z | done 2026-03-19T01:15Z | notes:4 rels:3
- [x] mcp-tool-shop-org/backprop | claude-opus-6 | 2026-03-19T01:08Z | done 2026-03-19T01:15Z | notes:4 rels:3
- [x] mcp-tool-shop-org/backpropagate | claude-opus-7 | 2026-03-19T01:16Z | done 2026-03-19T01:25Z | notes:5 rels:2
- [x] mcp-tool-shop-org/brain-dev | claude-opus-6 | 2026-03-19T01:15Z | done 2026-03-19T01:22Z | notes:3 rels:2
- [x] mcp-tool-shop-org/brand | claude-opus-3 | 2026-03-18T21:55Z | done 2026-03-18T22:03Z | notes:3 rels:2
- [x] mcp-tool-shop-org/build-governor | claude-opus-2 | 2026-03-18T21:47Z | done 2026-03-18T21:55Z | notes:5 rels:0 (2 rels already existed)
- [x] mcp-tool-shop-org/cannon-archive | claude-opus-6 | 2026-03-19T01:22Z | done 2026-03-19T01:30Z | notes:3 rels:3
- [x] mcp-tool-shop-org/civility-kernel | claude-opus-7 | 2026-03-19T01:26Z | done 2026-03-19T01:35Z | notes:3 rels:2
- [x] mcp-tool-shop-org/claude-collaborate | claude-opus-7 | 2026-03-19T01:36Z | done 2026-03-19T01:42Z | notes:3 rels:2
- [x] mcp-tool-shop-org/claude-guardian | claude-opus-4 | 2026-03-18T20:20Z | done 2026-03-18T20:40Z | notes:5 rels:5
- [x] mcp-tool-shop-org/claude-memories | claude-opus-4 | 2026-03-18T20:40Z | done 2026-03-18T20:48Z | notes:5 rels:3
- [x] mcp-tool-shop-org/claude-rpg | claude-opus-6 | 2026-03-19T01:31Z | done 2026-03-19T01:40Z | notes:3 rels:3
- [x] mcp-tool-shop-org/claude-rules | claude-opus | 2026-03-18T20:36Z | done 2026-03-18T20:50Z | notes:6 rels:2
- [x] mcp-tool-shop-org/claude-session-copilot | claude-opus-7 | 2026-03-19T01:43Z | done 2026-03-19T01:50Z | notes:3 rels:2
- [x] mcp-tool-shop-org/claude-sfx | claude-opus-4 | 2026-03-18T20:48Z | done 2026-03-18T20:55Z | notes:5 rels:4
- [x] mcp-tool-shop-org/claude-toolstack | claude-opus-4 | 2026-03-18T20:55Z | done 2026-03-18T21:05Z | notes:5 rels:3
- [x] mcp-tool-shop-org/clearance-opinion-engine | claude-opus-4 | 2026-03-18T21:05Z | done 2026-03-18T21:12Z | notes:5 rels:3
- [x] mcp-tool-shop-org/code-batch | claude-opus-4 | 2026-03-18T21:12Z | done 2026-03-18T21:18Z | notes:4 rels:3
- [x] mcp-tool-shop-org/code-covered | claude-opus-4 | 2026-03-18T21:18Z | done 2026-03-18T21:25Z | notes:4 rels:2
- [x] mcp-tool-shop-org/codeclone-suite | claude-opus-4 | 2026-03-18T21:25Z | done 2026-03-18T21:30Z | notes:4 rels:3
- [x] mcp-tool-shop-org/codecomfy-vscode | claude-opus-4 | 2026-03-18T21:30Z | done 2026-03-18T21:38Z | notes:4 rels:2
- [x] mcp-tool-shop-org/codeteam | claude-opus-4 | 2026-03-18T21:38Z | done 2026-03-18T21:43Z | notes:3 rels:3
- [x] mcp-tool-shop-org/codeteam-suite | claude-opus-4 | 2026-03-18T21:43Z | done 2026-03-18T21:50Z | notes:4 rels:2
- [x] mcp-tool-shop-org/comfy-headless | claude-opus-4 | 2026-03-18T21:50Z | done 2026-03-18T21:58Z | notes:4 rels:1
- [x] mcp-tool-shop-org/commandui | claude-opus-3 | 2026-03-18T20:30Z | done 2026-03-18T20:40Z | notes:5 rels:4
- [x] mcp-tool-shop-org/context-window-manager | claude-opus-4 | 2026-03-18T21:58Z | done 2026-03-18T22:05Z | notes:4 rels:1
- [x] mcp-tool-shop-org/control-room | claude-opus-4 | 2026-03-18T22:05Z | done 2026-03-18T22:12Z | notes:4 rels:2
- [x] mcp-tool-shop-org/deltamind | claude-opus-3 | 2026-03-18T21:00Z | done 2026-03-18T21:10Z | notes:5 rels:3
- [x] mcp-tool-shop-org/dev-op-typer | claude-opus-4 | 2026-03-18T22:12Z | done 2026-03-18T22:18Z | notes:4 rels:3
- [x] mcp-tool-shop-org/escape-the-valley | claude-opus-3 | 2026-03-18T21:38Z | done 2026-03-18T21:48Z | notes:4 rels:3
- [x] mcp-tool-shop-org/feature-reacher | claude-opus-4 | 2026-03-18T22:18Z | done 2026-03-18T22:25Z | notes:4 rels:1
- [x] mcp-tool-shop-org/file-compass | claude-opus-4 | 2026-03-18T22:25Z | done 2026-03-18T22:32Z | notes:4 rels:2
- [x] mcp-tool-shop-org/flexiflow | claude-opus-4 | 2026-03-18T22:32Z | done 2026-03-18T22:38Z | notes:4 rels:1
- [x] mcp-tool-shop-org/game-dev-mcp | claude-opus-4 | 2026-03-18T22:38Z | done 2026-03-18T22:45Z | notes:5 rels:1
- [x] mcp-tool-shop-org/glyphstudio | claude-opus-3 | 2026-03-18T20:40Z | done 2026-03-18T20:50Z | notes:6 rels:5
- [x] mcp-tool-shop-org/headless-wheel-builder | claude-opus-4 | 2026-03-18T22:46Z | done 2026-03-18T22:52Z | notes:4 rels:2
- [x] mcp-tool-shop-org/homebrew-core | claude-opus-4 | 2026-03-18T22:52Z | done 2026-03-18T22:55Z | notes:2 rels:1
- [x] mcp-tool-shop-org/homebrew-mcp-tools | claude-opus-4 | 2026-03-18T22:55Z | done 2026-03-18T22:58Z | notes:2 rels:1
- [x] mcp-tool-shop-org/homevault | claude-opus-4 | 2026-03-18T22:58Z | done 2026-03-18T23:05Z | notes:3 rels:1
- [x] mcp-tool-shop-org/integradio | claude-opus-4 | 2026-03-18T23:05Z | done 2026-03-18T23:12Z | notes:4 rels:2
- [x] mcp-tool-shop-org/jam-session-plugin | claude-opus-4 | 2026-03-18T23:12Z | done 2026-03-18T23:18Z | notes:2 rels:2
- [x] mcp-tool-shop-org/ledger-suite | claude-opus-4 | 2026-03-18T23:18Z | done 2026-03-18T23:25Z | notes:3 rels:3
- [x] mcp-tool-shop-org/linux-dev-typer | claude-opus-4 | 2026-03-18T23:25Z | done 2026-03-18T23:30Z | notes:3 rels:0
- [x] mcp-tool-shop-org/llm-sync-drive | claude-opus-3 | 2026-03-18T21:48Z | done 2026-03-18T21:55Z | notes:4 rels:2
- [x] mcp-tool-shop-org/mcp-app-builder | claude-opus-4 | 2026-03-18T23:30Z | done 2026-03-18T23:36Z | notes:3 rels:2
- [x] mcp-tool-shop-org/mcp-aside | claude-opus-4 | 2026-03-18T23:36Z | done 2026-03-18T23:42Z | notes:2 rels:2
- [x] mcp-tool-shop-org/mcp-bouncer | claude-opus-2 | 2026-03-18T21:35Z | done 2026-03-18T21:40Z | notes:4 rels:2
- [x] mcp-tool-shop-org/mcp-examples | claude-opus-4 | 2026-03-18T23:42Z | done 2026-03-18T23:46Z | notes:2 rels:2
- [x] mcp-tool-shop-org/mcp-file-forge | claude-opus-2 | 2026-03-18T21:56Z | done 2026-03-18T22:05Z | notes:3 rels:2
- [x] mcp-tool-shop-org/mcp-personify | claude-opus-4 | 2026-03-18T23:46Z | done 2026-03-18T23:52Z | notes:2 rels:3
- [x] mcp-tool-shop-org/mcp-stress-test | claude-opus-2 | 2026-03-18T21:40Z | done 2026-03-18T21:46Z | notes:4 rels:2
- [x] mcp-tool-shop-org/mcp-tool-registry | claude-opus-4 | 2026-03-18T23:52Z | done 2026-03-18T23:58Z | notes:3 rels:1
- [x] mcp-tool-shop-org/mcp-tool-shop | claude-opus-4 | 2026-03-18T23:58Z | done 2026-03-19T00:05Z | notes:3 rels:2
- [x] mcp-tool-shop-org/mcp-tool-shop.github.io | claude-opus-4 | 2026-03-19T00:05Z | done 2026-03-19T00:08Z | notes:2 rels:0
- [x] mcp-tool-shop-org/mcp-voice-engine | claude-opus-4 | 2026-03-19T00:08Z | done 2026-03-19T00:15Z | notes:3 rels:3
- [x] mcp-tool-shop-org/mcp-voice-soundboard | claude-opus-4 | 2026-03-19T00:15Z | done 2026-03-19T00:22Z | notes:3 rels:1
- [x] mcp-tool-shop-org/mcpt | claude-opus-4 | 2026-03-19T00:22Z | done 2026-03-19T00:28Z | notes:3 rels:0
- [x] mcp-tool-shop-org/meta-content-system | claude-opus-4 | 2026-03-19T00:28Z | done 2026-03-19T00:35Z | notes:3 rels:2
- [x] mcp-tool-shop-org/nameops | claude-opus-4 | 2026-03-19T00:35Z | done 2026-03-19T00:40Z | notes:2 rels:1
- [x] mcp-tool-shop-org/nexus-attest | claude-opus-6 | 2026-03-19T01:41Z | done 2026-03-19T01:50Z | notes:3 rels:4
- [x] mcp-tool-shop-org/nexus-control | claude-opus-7 | 2026-03-19T01:51Z | done 2026-03-19T01:58Z | notes:2 rels:3
- [x] mcp-tool-shop-org/nexus-router | claude-opus-6 | 2026-03-19T01:50Z | done 2026-03-19T01:58Z | notes:3 rels:3
- [x] mcp-tool-shop-org/nexus-router-adapter-http | claude-opus-7 | 2026-03-19T01:59Z | done 2026-03-19T02:05Z | notes:2 rels:3
- [x] mcp-tool-shop-org/nexus-router-adapter-stdout | claude-opus-6 | 2026-03-19T01:58Z | done 2026-03-19T02:03Z | notes:2 rels:0 (2 rels already existed)
- [x] mcp-tool-shop-org/nexus-suite | claude-opus-7 | 2026-03-19T02:06Z | done 2026-03-19T02:12Z | notes:2 rels:1
- [x] mcp-tool-shop-org/npm-escape-the-valley | claude-opus-6 | 2026-03-19T02:03Z | done 2026-03-19T02:07Z | notes:2 rels:0 (2 rels already existed)
- [x] mcp-tool-shop-org/npm-launcher | claude-opus-2 | 2026-03-18T22:50Z | done 2026-03-18T22:58Z | notes:2 rels:2
- [x] mcp-tool-shop-org/npm-sovereignty | claude-opus-7 | 2026-03-19T02:13Z | done 2026-03-19T02:17Z | notes:2 rels:0 (2 rels already existed)
- [x] mcp-tool-shop-org/npm-xrpl-camp | claude-opus-6 | 2026-03-19T02:07Z | done 2026-03-19T02:12Z | notes:2 rels:3
- [x] mcp-tool-shop-org/npm-xrpl-lab | claude-opus-7 | 2026-03-19T02:18Z | done 2026-03-19T02:22Z | notes:2 rels:3
- [x] mcp-tool-shop-org/nuget-signing-kit | claude-opus-6 | 2026-03-19T02:12Z | done 2026-03-19T02:17Z | notes:2 rels:0 (2 rels already existed)
- [x] mcp-tool-shop-org/nullout | claude-opus-4 | 2026-03-18T20:40Z | done 2026-03-18T20:50Z | notes:5 rels:2
- [x] mcp-tool-shop-org/original_voice-soundboard | claude-opus-7 | 2026-03-19T02:23Z | done 2026-03-19T02:32Z | notes:3 rels:4
- [x] mcp-tool-shop-org/pathway | claude-opus-2 | 2026-03-18T22:35Z | done 2026-03-18T22:40Z | notes:3 rels:1
- [x] mcp-tool-shop-org/payroll-engine | claude-opus | 2026-03-19T00:10Z | done 2026-03-19T00:18Z | notes:2 rels:1
- [x] mcp-tool-shop-org/pocket-ledger | claude-opus-6 | 2026-03-19T02:17Z | done 2026-03-19T02:22Z | notes:2 rels:1
- [x] mcp-tool-shop-org/polyglot | claude-opus-4 | 2026-03-18T20:50Z | done 2026-03-18T21:00Z | notes:5 rels:4
- [x] mcp-tool-shop-org/polyglot-mcp | claude-opus-4 | 2026-03-18T21:00Z | done 2026-03-18T21:15Z | notes:5 rels:3
- [x] mcp-tool-shop-org/polyglot-vscode | claude-opus-4 | 2026-03-18T21:15Z | done 2026-03-18T21:30Z | notes:4 rels:3
- [x] mcp-tool-shop-org/prototypes | claude-opus-4 | 2026-03-18T21:30Z | done 2026-03-18T21:45Z | notes:4 rels:6
- [x] mcp-tool-shop-org/prov-engine-js | claude-opus-4 | 2026-03-18T21:45Z | done 2026-03-18T21:55Z | notes:4 rels:3
- [x] mcp-tool-shop-org/prov-spec | claude-opus-4 | 2026-03-18T21:55Z | done 2026-03-18T22:05Z | notes:4 rels:3
- [x] mcp-tool-shop-org/py-polyglot | claude-opus-2 | 2026-03-18T20:36Z | done 2026-03-18T20:42Z | notes:5 rels:5
- [x] mcp-tool-shop-org/readme-i18n | claude-opus-4 | 2026-03-18T22:05Z | done 2026-03-18T22:10Z | notes:3 rels:0
- [x] mcp-tool-shop-org/receipt-factory | claude-opus-4 | 2026-03-18T22:10Z | done 2026-03-18T22:50Z | notes:5 rels:4
- [x] mcp-tool-shop-org/registry-pulse | claude-opus-4 | 2026-03-18T22:50Z | done 2026-03-18T23:00Z | notes:3 rels:3
- [x] mcp-tool-shop-org/registry-stats | claude-opus-3 | 2026-03-18T21:20Z | done 2026-03-18T21:30Z | notes:4 rels:3
- [x] mcp-tool-shop-org/registry-stats-vscode | claude-opus-4 | 2026-03-18T23:00Z | done 2026-03-18T23:10Z | notes:3 rels:1
- [x] mcp-tool-shop-org/registry-sync | claude-opus-4 | 2026-03-18T23:10Z | done 2026-03-18T23:20Z | notes:4 rels:3
- [x] mcp-tool-shop-org/repo-crawler-mcp | claude-opus-4 | 2026-03-18T23:20Z | done 2026-03-18T23:35Z | notes:4 rels:2
- [x] mcp-tool-shop-org/repo-tester | claude-opus-4 | 2026-03-18T23:35Z | done 2026-03-18T23:38Z | notes:2 rels:0
- [x] mcp-tool-shop-org/repomesh | claude-opus-4 | 2026-03-18T23:38Z | done 2026-03-18T23:55Z | notes:4 rels:4
- [x] mcp-tool-shop-org/rippled-windows-debug | claude-opus-4 | 2026-03-18T23:55Z | done 2026-03-19T00:05Z | notes:3 rels:2
- [x] mcp-tool-shop-org/runforge-desktop | claude-opus-4 | 2026-03-19T00:05Z | done 2026-03-19T00:20Z | notes:3 rels:2
- [x] mcp-tool-shop-org/runforge-vscode | claude-opus-4 | 2026-03-19T00:20Z | done 2026-03-19T00:35Z | notes:4 rels:1
- [x] mcp-tool-shop-org/scoop-bucket | claude-opus-4 | 2026-03-19T00:35Z | done 2026-03-19T00:38Z | notes:2 rels:0
- [x] mcp-tool-shop-org/shipcheck | claude-opus-2 | 2026-03-18T20:10Z | done 2026-03-18T20:35Z | notes:5 rels:4
- [x] mcp-tool-shop-org/siege-kit | claude-opus-4 | 2026-03-19T00:38Z | done 2026-03-19T00:45Z | notes:3 rels:2
- [x] mcp-tool-shop-org/site-theme | claude-opus-3 | 2026-03-18T21:30Z | done 2026-03-18T21:38Z | notes:3 rels:3
- [x] mcp-tool-shop-org/sonic-core | claude-opus-2 | 2026-03-18T22:21Z | done 2026-03-18T22:30Z | notes:2 rels:2
- [x] mcp-tool-shop-org/sonic-runtime | claude-opus-4 | 2026-03-19T00:45Z | done 2026-03-19T00:55Z | notes:3 rels:2
- [x] mcp-tool-shop-org/soundboard-maui | claude-opus-4 | 2026-03-19T00:55Z | done 2026-03-19T01:05Z | notes:3 rels:3
- [x] mcp-tool-shop-org/soundboard-plugin | claude-opus-3 | 2026-03-18T21:10Z | done 2026-03-18T21:20Z | notes:4 rels:3
- [x] mcp-tool-shop-org/soundweave | claude-opus-4 | 2026-03-19T01:05Z | done 2026-03-19T01:15Z | notes:3 rels:2
- [x] mcp-tool-shop-org/sovereignty | claude-opus-4 | 2026-03-19T01:15Z | done 2026-03-19T01:25Z | notes:3 rels:3
- [x] mcp-tool-shop-org/sprite-creator-studio | claude-opus-4 | 2026-03-19T01:25Z | done 2026-03-19T01:35Z | notes:3 rels:1
- [x] mcp-tool-shop-org/stillpoint | claude-opus-2 | 2026-03-18T23:00Z | done 2026-03-18T23:08Z | notes:2 rels:3
- [x] mcp-tool-shop-org/stresskit-mcp | claude-opus-4 | 2026-03-19T01:37Z | done 2026-03-19T01:42Z | notes:3 rels:1
- [x] mcp-tool-shop-org/synthesis | claude-opus-2 | 2026-03-18T23:20Z | done 2026-03-18T23:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/tool-compass | claude-opus-4 | 2026-03-19T01:44Z | done 2026-03-19T01:50Z | notes:3 rels:2
- [x] mcp-tool-shop-org/tool-scan | claude-opus-2 | 2026-03-18T22:13Z | done 2026-03-18T22:20Z | notes:3 rels:0 (3 rels already existed)
- [x] mcp-tool-shop-org/training-studio | claude-opus-2 | 2026-03-18T23:10Z | done 2026-03-18T23:18Z | notes:2 rels:0 (7 rels already existed)
- [x] mcp-tool-shop-org/venvkit | claude-opus-2 | 2026-03-18T21:56Z | done 2026-03-18T22:05Z | notes:2 rels:0 (1 rel already existed)
- [x] mcp-tool-shop-org/vocal-synth-engine | claude-opus-7 | 2026-03-19T02:33Z | done 2026-03-19T02:40Z | notes:3 rels:1
- [x] mcp-tool-shop-org/voice-soundboard | claude-opus-2 | 2026-03-18T23:32Z | done 2026-03-18T23:42Z | notes:2 rels:2
- [x] mcp-tool-shop-org/vscode-voice-soundboard | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/websketch-cli | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/websketch-demo | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/websketch-extension | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/websketch-ir | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/websketch-mcp | claude-opus-2 | 2026-03-18T23:32Z | done 2026-03-18T23:42Z | notes:2 rels:2
- [x] mcp-tool-shop-org/websketch-vscode | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/winget-pkgs | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/witness | claude-opus-4 | 2026-03-19T01:50Z | done 2026-03-19T01:55Z | notes:3 rels:0 (5 rels already existed)
- [x] mcp-tool-shop-org/world-forge | claude-opus-3 | 2026-03-18T20:50Z | done 2026-03-18T21:00Z | notes:5 rels:5
- [x] mcp-tool-shop-org/xrpl-camp | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/xrpl-lab | claude-opus | 2026-03-19T00:15Z | done 2026-03-19T00:28Z | notes:2 rels:1
- [x] mcp-tool-shop-org/zip-meta-map | claude-opus-2 | 2026-03-18T22:42Z | done 2026-03-18T22:48Z | notes:2 rels:2

---

## Progress

| Metric | Count |
|--------|-------|
| Total repos | 176 |
| Claimed | 0 |
| Done | 0 |
| Remaining | 176 |