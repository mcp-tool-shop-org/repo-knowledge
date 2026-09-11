STUDY-RK-003 Q1 — Scholar pack (tip 2d83594)

Q1 — Peer literature on deterministic tool APIs for agents vs non-deterministic LLM/MCP surfaces: when a structured catalog (SQLite/FTS5) should expose read-only/repeatable tools vs mutating ones; CLI vs agent-tool contracts; reproducibility of tool results.

Consumer context (not citations): repo-knowledge MCP + rk CLI (catalog reads vs add_*/sync mutations). Pack below is papers/arXiv only; no execute; no implications as final. Did not invent “all MCP tools may be non-deterministic.”

1. Harness Engineering for Predictable Agentic Systems… — Saransh Dhage — 2026 — https://arxiv.org/abs/2608.26197 — Shows LLM agents vary run-to-run even with identical tools; a deterministic harness (finite-state control, forced tool selection, schema-validated planning before any tool) raises reproducibility to 1.000 in measured cells.

2. Deterministic Replay for AI Agent Systems — Rasheed Mudasiru — 2026 — https://arxiv.org/abs/2607.16200 — Formalizes that agent loops coupling LLMs with external tools/APIs are non-deterministic from sampling and external state, and offers a CLI record/replay layer so tool traffic can be reproduced in isolation.

3. Agent-First Tool API… — Kai Pan, Rong Hou — 2026 — https://arxiv.org/abs/2605.10555 — Separates read tools (no side effects; speculative) from write/commit tools with idempotency keys, arguing agent-facing contracts must declare mode and risk rather than treat all CRUD calls alike; complementary to MCP transport.

4. Verified Tool Calls Improve LLM Agent Reliability Under Non-Atomic Failures — Isham Kalappurackal Mansoor, Abhishek Phadke, Pratip Rana — 2026 — https://arxiv.org/abs/2608.02645 — Adds read-only postcondition verifiers, verify-before-retry, and idempotency keys so mutating tool retries do not duplicate effects; verification itself must stay side-effect free.

5. Reason Less, Verify More: Deterministic Gates… — Vikas Reddy, Sumanth Reddy Challaram, Abhishek Basu — 2026 — https://arxiv.org/abs/2607.07405 — Places deterministic, read-only pre-execution gates before mutating tool calls; gates inspect proposed call and state without LLM or writes, converting silent policy-violating mutations into explicit rejections.

6. Gorilla: Large Language Model Connected with Massive APIs — Shishir G. Patil, Tianjun Zhang, Xin Wang, Joseph E. Gonzalez — 2023 — https://arxiv.org/abs/2305.15334 — Shows accurate, document-grounded API invocation (APIBench) reduces hallucinated tool use, reinforcing structured tool schemas and reliable call formation over free-form generation.

7. StableToolBench: Towards Stable Large-Scale Benchmarking on Tool Learning… — Zhicheng Guo, Sijie Cheng, Hao Wang, Shihao Liang, Yujia Qin, Peng Li, Zhiyuan Liu, Maosong Sun, Yang Liu — 2024 — https://arxiv.org/abs/2403.07714 — Replaces unstable live APIs with cached/simulated servers so tool-learning evaluation is repeatable, underscoring that tool-result reproducibility is a first-class systems requirement.

8. ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs — Yujia Qin, Shihao Liang, Yining Ye, Kunlun Zhu, Lan Yan, Yaxi Lu, Yankai Lin, Xin Cong, Xiangru Tang, Bill Qian, Sihan Zhao, Runchu Tian, Ruobing Xie, Jie Zhou, Mark Gerstein, Dahai Li, Zhiyuan Liu, Maosong Sun — 2023 — https://arxiv.org/abs/2307.16789 — Scales real REST tool use with explicit solution paths of API calls, treating tools as discrete, evaluable actions rather than opaque LLM generations.

Recipes invented: 0. Metrics invented: 0. “All MCP tools non-deterministic” invented: 0.
Tip: 2d83594. Extra context only: README MCP/CLI, src/mcp/server.ts, src/cli.ts.

✅
