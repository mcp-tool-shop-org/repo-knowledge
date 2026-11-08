<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/repo-knowledge/readme.png" alt="repo-knowledge" width="500" />
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

软件包注册表和 GitHub API 告诉你一个仓库_是什么_。它们不会告诉你它_是用来做什么的_，它与其他仓库的关系如何，它的架构理念是什么，或者它是否通过了上次的安全审计。repo-knowledge 填补了这一空白：一个单一的本地数据库，其中包含理念、架构、审计证据、关系以及所有这些内容的全文搜索。

## 安装

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**要求：**
- Node.js 20+ ——此软件包的 `engines.node` 是 `>=20`。锁定的 `better-sqlite3` 插件自身的 `engines` 列表是供应商的主要版本，而不是预构建覆盖范围的声明。
- `gh` CLI（已认证）用于 GitHub 同步
- C/C++ 构建工具，用于在缺少预构建时进行 `better-sqlite3`。插件安装脚本采用双路径：`prebuild-install || node-gyp rebuild --release`。如果可用，则使用匹配的预构建；否则，`node-gyp` 将从源代码进行编译。这并非适用于所有平台的通用方案。如果安装失败，请参阅 [better-sqlite3 故障排除指南](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md)。

## 安全模型

**涉及的数据：**本地 SQLite 数据库，通过 `gh` CLI（仓库名称、描述、主题、星数——不包含源代码内容）的 GitHub API 元数据。

**不涉及的数据：**不读取 GitHub 中的任何源代码，不存储任何凭据，不将任何数据发送到外部服务。

**权限：**需要 `gh` CLI 认证才能进行 GitHub 同步；所有数据都保留在本地。

**无遥测、无分析、无“回家”功能。**

## 快速入门

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
| `rk init` | 初始化配置、数据库和种子审计控制 |
| `rk sync` | 完全同步：GitHub 组织 + 本地仓库 + FTS 索引 |
| `rk scan <path>` | 扫描单个本地仓库目录 |
| `rk show <slug>` | 显示完整的仓库知识，包括审计状态 |
| `rk list` | 列出所有仓库（可按状态、语言、形状进行筛选） |
| `rk find <query>` | 对所有索引内容进行全文搜索 |
| `rk related <slug>` | 显示与给定仓库相关的仓库 |
| `rk note <slug>` | 添加带有 `--type` 和 `--content`（可选 `--title`）的类型化注释（理念、架构、警告等）；`--delete` 通过 `--type` + `--title` 停用注释。 |
| `rk relate <from> <type> <to>` | 记录仓库之间的关系（可选 `--note`） |
| `rk stats` | 显示数据库统计信息 |
| `rk reindex` | 重建 FTS 索引 |
| `rk sync-dogfood` | 从 dogfood-lab/testing-os 同步 dogfood 证据到仓库事实 |
| `rk suggest-dogfood --repo <slug>` | 为仓库或表面建议已知的 dogfood 发现 |

> **在所有重要的地方都使用 `--json`。** `list`、`find`、`show`、`related` 和 `stats`——以及五个审计读取（`posture`、`findings`、`controls`、`unaudited`、`failing`）——都接受 `--json` 以进行机器可读的输出。JSON 是核心命令之间的重要协议：可以将任何命令直接通过管道传递到 `jq`。

### 生命周期命令（v2.0.0）

| 命令 | 描述 |
|---------|-------------|
| `rk delete <slug> [--yes]` | 级联删除一个仓库和所有子行 |
| `rk archive <slug> [--reason <text>]` | 将 `lifecycle_status` 翻转为 `archived`（保留注释/发现） |
| `rk verify-local [--rig <id>] [--strict]` | 验证 `local_path` 是否存在于每个 rig 中；更新 `repo_local_paths` |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | 注册当前 rig |
| `rk prune [--dry-run] [--apply] [--days <N>]` | 硬删除存档时间超过 N 天的仓库（默认 30 天） |

### 发布状态命令（v2.0.0）

| 命令 | 描述 |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | 跨渠道发布的版本仪表板（npm/pypi/github_release） |
| `rk drift <slug> [--strict]` | 比较事实来源版本与最新的注册表版本 |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | 手动绑定设置器 |

### 健康命令（v2.0.0——基于研究）

| 命令 | 描述 |
|---------|-------------|
| `rk health`（默认 = feed） | 更改 feed：自上次同步以来的增量、KEV 交叉、CI 连续性中断、操作固定点漂移 |
| `rk health doctor <slug>` | 单个仓库的深入分析（依赖审计、工作流操作、CI 信号、工具链） |
| `rk health table [--json\|--text]` | 组合健康表；JSON 是重要的协议 |

### 操作命令（v2.0.0）

| 命令 | 描述 |
|---------|-------------|
| `rk fsck [--strict] [--json]` | DB 完整性检查；将审计行写入 `db_health_runs` |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | 一个仓库的条目更改历史记录 |
| `rk runs [--db-health\|--sync] [--limit <N>] [--json]` | 列出最近的 `db_health_runs` / `sync_runs` 条目 |
| `rk owners list` | 列出已配置的 GitHub 所有者 |
| `rk owners add <owner>` | 添加到 `rk.config.json` 所有者 |
| `rk owners remove <owner>` | 从 `rk.config.json` 所有者中删除 |

### 备份、恢复和预检（v2.1.0）

| 命令 | 描述 |
|---------|-------------|
| `rk backup [--out <path>]` | 将知识 DB 快照保存到真空副本（`VACUUM INTO`）中，位于 `data/backups/` 或 `--out` |
| `rk restore <path> [--yes]` | 从快照恢复 DB——架构验证、原子交换、确认门控（拒绝使用较新架构的备份） |
| `rk doctor [--json] [--strict]` | 环境预检：配置、DB、架构版本、`gh` 认证、当前 rig、最近的同步/fsck 运行 |
| `rk config [--json]` | 显示已解析的有效配置，并显示每个字段的来源 |
| `rk config validate [--json]` | 验证 `rk.config.json`——如果存在占位符所有者、错误的形状或无法解析的路径，则以非零状态退出 |

### 分类（v2.1.1）

| 命令 | 描述 |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | 设置策划的生命周期字段——`status`（`active`/`paused`/`archived`/`unknown`）、自由格式的 `stage`（例如，`shipped`、`Phase 1`）和 `category`（`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`）。这些字段不会由 `sync` 或 `scan` 填充；传递 `""` 以清除 `stage`/`category`。 |

### 审计命令

| 命令 | 描述 |
|---------|-------------|
| `rk audit seed-controls` | 种子/更新 80 个控制的规范目录 |
| `rk audit import <dir>` | 从 JSON 协议文件导入审计结果 |
| `rk audit posture [slug]` | 显示一个仓库或整个组合的审计状态 |
| `rk audit findings` | 列出组合中未解决的发现 |
| `rk audit controls` | 按领域列出规范控制 |
| `rk audit unaudited` | 列出没有审计运行的仓库 |
| `rk audit failing <domain>` | 列出未能通过特定审计领域的仓库 |

### 游戏命令

| 命令 | 描述 |
|---------|-------------|
| `rk games score <worklist>` | 对 REMEDIATION-WORKLIST.md 文件进行评分并显示排行榜 |

## MCP 服务器

MCP 服务器公开了 30 个用于 AI 集成工作流的工具。将其添加到您的 MCP 客户端配置中：

**Claude Code（项目范围内的 `.claude.json`）：**
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

**Claude Desktop（`claude_desktop_config.json`）：**
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

服务器在启动时从工作目录读取 `rk.config.json`。确保 `rk.config.json` 存在于服务器运行的目录中。

### MCP 工具

**知识与同步：**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**审计：**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**构建健康度**（仅读取数据库，不刷新网络）：
`health_feed` `health_doctor` `health_portfolio`

**运营规范：**
`db_fsck` `repo_diff` `ops_runs`

**生命周期与发布：**
`archive_repo` `delete_repo` `repo_versions`

**内部测试与审计演练：**
`suggest_dogfood` `audit_failing`

## 审计框架

审计系统涵盖 19 个领域，包含 80 个控制项：

| 领域 | 控制项 |
|--------|----------|
| 清单 | 仓库元数据、所有权、分类 |
| 代码质量 | 代码风格检查、格式化、复杂度 |
| 安全静态分析 | 静态分析、注入、身份验证 |
| 依赖项安全检查 | 漏洞扫描、版本更新 |
| 许可证 | 许可证合规性、兼容性 |
| 密钥 | 密钥检测、轮换 |
| 配置即代码 | 基础设施即代码规范 |
| 容器 | 镜像安全、扫描 |
| 运行时 | 错误处理、弹性 |
| 性能 | 性能分析、优化 |
| 可观测性 | 日志记录、追踪、指标 |
| 测试 | 覆盖率、类型、CI 集成 |
| CI/CD | 流水线安全、门控 |
| 部署 | 发布流程、回滚 |
| 备份与灾难恢复 | 备份计划、恢复 |
| 监控 | 告警、正常运行时间 |
| 合规与隐私 | 数据处理、GDPR |
| 供应链 | SBOM、来源 |
| 集成 | API 协议、版本控制 |

每次审计运行都会生成结构化的证据：控制结果（通过/失败/警告/不适用）、带有严重性和修复建议的发现，以及汇总指标。系统状态会自动推断：**健康**、**需要关注**或**严重**。

## 多代理编排：Claude 游戏

repo-knowledge 包含用于在大型组合中并行执行多 Claude 操作的模板。Claude 游戏通过共享工作列表协调多个 AI 代理：

1. **审计通过**——每个代理从工作列表中获取仓库，运行 80 个控制项的审计，并提交结构化结果。
2. **丰富通过**——代理添加论点、架构说明和关系映射。
3. **修复通过**——代理使用经过评分的 8 步工作流程来修复发现的问题。

有关完整流程，请参阅 [`templates/claude-games/`](templates/claude-games/)。

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

所有数据都存储在一个 SQLite 数据库中，并对文档、注释和仓库描述进行 FTS5 全文搜索。

## 配置

在工作区根目录中创建 `rk.config.json`（或运行 `rk init`）：

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

所有设置都来自 `rk.config.json`（由 `rk init` 创建）。MCP 服务器还会从工作目录读取配置。

## 许可证

[MIT](LICENSE)

---

由 <a href="https://mcp-tool-shop.github.io/">MCP 工具店</a> 构建
