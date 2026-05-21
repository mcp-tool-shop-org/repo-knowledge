<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/repo-knowledge/readme.png" alt="repo-knowledge" width="800" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/repo-knowledge/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/repo-knowledge/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/repo-knowledge"><img src="https://img.shields.io/npm/v/@mcptoolshop/repo-knowledge" alt="npm version" /></a>
  <a href="https://github.com/mcp-tool-shop-org/repo-knowledge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/repo-knowledge/"><img src="https://img.shields.io/badge/docs-landing%20page-34d399" alt="Landing Page" /></a>
</p>

<p align="center">
  Local-first repo knowledge system built on SQLite and FTS5. Catalogs repositories with structured metadata, thesis notes, architecture docs, audit evidence, and inter-repo relationships — then exposes everything through a CLI and MCP server for AI-integrated workflows.
</p>

---

## 为什么

包注册表和 GitHub API 可以告诉你一个仓库_是什么_。它们无法告诉你它的_用途_，它与你的其他仓库之间的关系，它的架构设计理念，或者它是否通过了你最近的安全审计。`repo-knowledge` 填补了这个空白：它是一个本地数据库，存储了设计理念、架构、审计证据、关系，并支持所有内容的全文搜索。

## 安装

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**要求：**
- Node.js 20+
- `gh` CLI（已进行身份验证），用于与 GitHub 同步
- 用于 `better-sqlite3` 的 C/C++ 构建工具，或者在支持的平台上将自动使用预构建的二进制文件。

## 安全模型

**访问的数据：** 本地 SQLite 数据库，通过 `gh` CLI 获取的 GitHub API 元数据（仓库名称、描述、主题、星级——不包括源代码内容）。

**未访问的数据：** 不会从 GitHub 读取任何源代码，不会存储任何凭据，不会向任何外部服务发送任何数据。

**权限：** 需要 `gh` CLI 进行身份验证，以便与 GitHub 同步；所有数据都保存在本地。

**无遥测，无分析，无任何数据上传。**

## 快速开始

```bash
# Initialize workspace — creates config, database, seeds audit controls
rk init

# Sync repos from your GitHub org
rk sync --owners my-org

# Include forked repos
rk sync --owners my-org --forks

# Inspect a specific repo
rk show my-org/my-repo

# Search across everything
rk find "authentication middleware"

# Seed the 80-control audit framework
rk audit seed-controls
```

## CLI 参考

### 核心命令

| 命令 | 描述 |
|---------|-------------|
| `rk init` | 初始化配置、数据库，并设置审计控制。 |
| `rk sync` | 完全同步：GitHub 组织 + 本地仓库 + 全文搜索索引。 |
| `rk scan <path>` | 扫描单个本地仓库目录。 |
| `rk show <slug>` | 显示带有审计状态的完整仓库信息。 |
| `rk list` | 列出所有仓库（可按状态、语言、结构进行过滤）。 |
| `rk find <query>` | 在所有索引内容上进行全文搜索。 |
| `rk related <slug>` | 显示与给定仓库相关的仓库。 |
| `rk note <slug>` | 添加带有类型（例如：设计理念、架构、警告等）的注释，使用 `--type` 和 `--content`（可选 `--title`）。 |
| `rk relate <from> <type> <to>` | 记录仓库之间的关系（可选 `--note`）。 |
| `rk stats` | 显示数据库统计信息。 |
| `rk reindex` | 重建全文搜索索引。 |
| `rk sync-dogfood` | 从 `dogfood-lab/testing-os` 导入内部测试数据，并将其添加到仓库信息中。 |
| `rk suggest-dogfood --repo <slug>` | 为仓库或模块建议已知的内部测试结果。 |

### 生命周期命令 (v2.0.0)

| 命令 | 描述 |
|---------|-------------|
| `rk delete <slug> [--yes]` | 级联删除仓库及其所有子行。 |
| `rk archive <slug> [--reason <text>]` | 将 `lifecycle_status` 更改为 `archived`（保留注释/发现）。 |
| `rk verify-local [--rig <id>] [--strict]` | 验证 `local_path` 是否存在于每个环境中；更新 `repo_local_paths`。 |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | 注册当前环境。 |
| `rk prune [--dry-run] [--apply] [--days <N>]` | 硬删除存档时间超过 N 天（默认为 30 天）的仓库。 |

### 发布状态命令 (v2.0.0)

| 命令 | 描述 |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | 跨渠道发布版本仪表板（npm/pypi/github_release）。 |
| `rk drift <slug> [--strict]` | 比较原始版本与注册表中的最新版本。 |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | 手动版本设置器。 |

### 健康状况命令 (v2.0.0 — 基于研究)

| 命令 | 描述 |
|---------|-------------|
| `rk health` (默认 = feed) | 更改 feed：自上次同步以来的增量更新，KEV 交叉点，CI 连续性中断，action-pin 漂移。 |
| `rk health doctor <slug>` | 对单个仓库进行深入分析（依赖项审计、工作流操作、CI 信号、工具链）。 |
| `rk health table [--json\ | --text]` | 仪表板健康状况表；JSON 是关键数据合约。 |

### 运维命令 (v2.0.0)

| 命令 | 描述 |
|---------|-------------|
| `rk fsck [--strict] [--json]` | 数据库完整性检查；将审计行写入 `db_health_runs`。 |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | 一个仓库的条目变更历史。 |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | 列出最近的 `db_health_runs` / `sync_runs` 条目。 |
| `rk owners list` | 列出配置的 GitHub 组织。 |
| `rk owners add <owner>` | 将内容追加到 `rk.config.json` 中的组织列表。 |
| `rk owners remove <owner>` | 从 `rk.config.json` 中删除组织。 |

### 审计命令

| 命令 | 描述 |
|---------|-------------|
| `rk audit seed-controls` | 设置/更新 80 个控制项的标准目录。 |
| `rk audit import <dir>` | 从 JSON 配置文件中导入审计结果。 |
| `rk audit posture [slug]` | 显示单个仓库或整个资产组合的审计状态。 |
| `rk audit findings` | 列出整个资产组合中的所有未解决的问题。 |
| `rk audit controls` | 按领域列出标准控制项。 |
| `rk audit unaudited` | 列出未进行过审计的仓库。 |
| `rk audit failing <domain>` | 列出在特定审计领域中失败的仓库。 |

### 游戏命令

| 命令 | 描述 |
|---------|-------------|
| `rk games score <worklist>` | 评分 `REMEDIATION-WORKLIST.md` 文件，并显示排行榜。 |

## MCP 服务器

MCP 服务器提供 19 个工具，用于集成人工智能的工作流程。将其添加到您的 MCP 客户端配置中：

**Claude 代码 (项目范围内的 `.claude.json` 文件):**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "rk",
      "args": ["mcp"],
      "env": {}
    }
  }
}
```

**Claude 桌面 (`claude_desktop_config.json` 文件):**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "node",
      "args": ["node_modules/@mcptoolshop/repo-knowledge/dist/mcp/server.js"]
    }
  }
}
```

服务器在启动时从工作目录读取 `rk.config.json` 文件。请确保 `rk.config.json` 文件存在于服务器运行的目录中。

### MCP 工具

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## 审计框架

审计系统涵盖 19 个领域，包含 80 个控制项：

| 领域 | 控制项 |
|--------|----------|
| 库存 | 仓库元数据、所有权、分类 |
| 代码质量 | 代码检查、格式化、复杂度 |
| 安全静态分析 | 静态分析、注入、身份验证 |
| 依赖项扫描 | 漏洞扫描、版本 |
| 许可证 | 许可证合规性、兼容性 |
| 密钥 | 密钥检测、轮换 |
| 配置即代码 | 基础设施即代码的安全性 |
| 容器 | 镜像安全、扫描 |
| 运行时 | 错误处理、弹性 |
| 性能 | 性能分析、优化 |
| 可观察性 | 日志记录、跟踪、指标 |
| 测试 | 覆盖率、类型、CI 集成 |
| 持续集成/持续交付 | 流水线安全、网关 |
| 部署 | 发布流程、回滚 |
| 备份与灾难恢复 | 备份计划、恢复 |
| 监控 | 告警、正常运行时间 |
| 合规与隐私 | 数据处理、GDPR |
| 供应链 | 软件物料清单 (SBOM)、溯源 |
| 集成 | API 接口、版本控制 |

每次审计运行都会产生结构化的证据：控制结果（通过/失败/警告/不适用）、包含严重程度和修复建议的发现，以及聚合指标。 审计状态会自动推断：**健康 (healthy)**、**需要关注 (needs_attention)** 或 **严重 (critical)**。

## 多智能体编排：Claude 游戏

`repo-knowledge` 包含用于在大型资产组合中执行并行多 Claude 操作的模板。Claude 游戏通过共享工作列表协调多个 AI 代理：

1. **审计阶段** — 每个代理从工作列表中选择仓库，运行 80 个控制项的审计，并提交结构化结果。
2. **丰富阶段** — 代理添加论点、架构说明和关系映射。
3. **修复阶段** — 代理使用一个包含 8 个步骤的评分工作流程来修复发现的问题。

请参阅 [`templates/claude-games/`](templates/claude-games/) 目录以获取完整的操作手册。

## 数据模型

```
repos
 +-- tech (language, framework, shape, runtime)
 +-- notes (thesis, architecture, warning, convention, ...)
 +-- docs (README, CHANGELOG, indexed content)
 +-- facts (dependencies, config keys, endpoints)
 +-- relationships (depends_on, related_to, supersedes, ...)
 +-- audit_runs
      +-- audit_control_results (per-control pass/fail)
      +-- audit_findings (title, severity, remediation)
      +-- audit_metrics (pass_rate, coverage, counts)
```

所有数据都存储在单个 SQLite 数据库中，该数据库使用 FTS5 进行全文搜索，涵盖文档、注释和仓库描述。

## 配置

在您的工作区根目录下创建 `rk.config.json` 文件（或者运行 `rk init` 命令）。

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

所有设置都来自 `rk.config.json` 文件（由 `rk init` 命令创建）。MCP 服务器也会从工作目录读取配置文件。

## 许可证

[MIT](LICENSE)

---

由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建。
