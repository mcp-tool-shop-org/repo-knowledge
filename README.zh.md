<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## 为什么？

软件包注册表和 GitHub API 会告诉你一个仓库是什么。它们不会告诉你它的用途是什么，它与其他仓库的关系如何，它的架构理念是什么，或者它是否通过了上次的安全审计。repo-knowledge 填补了这个空白：一个单一的本地数据库，其中包含理念、架构、审计证据、关系以及所有内容的全文搜索功能。

## 安装

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**要求：**
- Node.js 20+
- `gh` CLI（已认证），用于与 GitHub 同步
- C/C++ 构建工具，用于构建 `better-sqlite3`；或者在受支持的平台上会自动使用预编译二进制文件。

## 安全模型

**涉及的数据：**本地 SQLite 数据库、通过 `gh` CLI 获取的 GitHub API 元数据（仓库名称、描述、主题、星标——不包含源代码内容）。

**未涉及的数据：**不会从 GitHub 读取任何源代码，也不会存储任何凭据，也不会将任何数据发送到外部服务。

**权限：**需要已认证的 `gh` CLI 才能与 GitHub 同步；所有数据都保存在本地。

**没有遥测、没有分析、没有“回家”功能。**

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
| `rk init` | 初始化配置、数据库和审计控制 |
| `rk sync` | 完全同步：GitHub 组织 + 本地仓库 + FTS 索引 |
| `rk scan <path>` | 扫描单个本地仓库目录 |
| `rk show <slug>` | 显示完整的仓库知识，包括审计状态 |
| `rk list` | 列出所有仓库（可按状态、语言、类型进行筛选） |
| `rk find <query>` | 对所有索引内容进行全文搜索 |
| `rk related <slug>` | 显示与给定仓库相关的仓库 |
| `rk note <slug>` | 添加带有 `--type` 和 `--content` 的类型化注释（例如：理念、架构、警告等）（可选的 `--title`） |
| `rk relate <from> <type> <to>` | 记录仓库之间的关系（可选的 `--note`） |
| `rk stats` | 显示数据库统计信息 |
| `rk reindex` | 重建 FTS 索引 |
| `rk sync-dogfood` | 将来自 dogfood-lab/testing-os 的测试证据同步到仓库事实中 |
| `rk suggest-dogfood --repo <slug>` | 为某个仓库或表面建议已知的测试结果 |

> **在所有重要的地方都使用 `--json`。** `list`、`find`、`show`、`related` 和 `stats`——以及五个审计读取命令（`posture`、`findings`、`controls`、`unaudited`、`failing`）——都可以接受 `--json` 参数，以提供机器可读的输出。JSON 是核心命令之间的关键契约：可以将任何命令直接通过管道传递给 `jq`。

### 生命周期命令（v2.0.0）

| 命令 | 描述 |
|---------|-------------|
| `rk delete <slug> [--yes]` | 级联删除一个仓库及其所有子行 |
| `rk archive <slug> [--reason <text>]` | 将 `lifecycle_status` 更改为 `archived`（保留注释/结果） |
| `rk verify-local [--rig <id>] [--strict]` | 验证 `local_path` 是否存在；更新 `repo_local_paths` |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | 注册当前的运行环境 |
| `rk prune [--dry-run] [--apply] [--days <N>]` | 硬删除存档时间超过 N 天的仓库（默认 30 天） |

### 发布状态命令（v2.0.0）

| 命令 | 描述 |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | 跨渠道发布的版本仪表板（npm/pypi/github_release） |
| `rk drift <slug> [--strict]` | 比较真实版本的源代码与最新的注册表 |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | 手动绑定设置器 |

### 健康状况命令（v2.0.0——基于研究）

| 命令 | 描述 |
|---------|-------------|
| `rk health`（默认 = feed） | 更改信息流：上次同步以来的增量、KEV 交叉点、CI 连续性中断、操作固定漂移 |
| `rk health doctor <slug>` | 单个仓库的深入分析（依赖审计、工作流程操作、CI 信号、工具链） |
| `rk health table [--json\ | --text]` | 组合健康状况表；JSON 是关键契约。 |

### 操作命令（v2.0.0）

| 命令 | 描述 |
|---------|-------------|
| `rk fsck [--strict] [--json]` | 数据库完整性检查；将审计行写入 `db_health_runs` |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | 一个仓库的条目更改历史记录 |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | 列出最近的 `db_health_runs` / `sync_runs` 条目 |
| `rk owners list` | 列出已配置的 GitHub 所有者 |
| `rk owners add <owner>` | 附加到 `rk.config.json` 中的所有者 |
| `rk owners remove <owner>` | 从 `rk.config.json` 中删除所有者 |

### 备份、恢复和预检（v2.1.0）

| 命令 | 描述 |
|---------|-------------|
| `rk backup [--out <path>]` | 将知识数据库快照保存到真空副本（`VACUUM INTO`）中，并保存在 `data/backups/` 或 `--out` 目录下。 |
| `rk restore <path> [--yes]` | 从快照恢复数据库——经过架构验证、原子交换、确认门控（拒绝使用较新架构的备份）。 |
| `rk doctor [--json] [--strict]` | 环境预检：配置、数据库、架构版本、`gh` 认证、当前运行环境、最近的同步/fsck 运行。 |
| `rk config [--json]` | 显示已解析的有效配置，并提供每个字段的出处。 |
| `rk config validate [--json]` | 验证 `rk.config.json`——如果存在占位符所有者、错误的类型或无法解析的路径，则以非零状态退出。 |

### 审计命令

| 命令 | 描述 |
|---------|-------------|
| `rk audit seed-controls` | 播种/更新 80 个控制规范目录 |
| `rk audit import <dir>` | 从 JSON 合约文件导入审计结果 |
| `rk audit posture [slug]` | 显示一个或所有仓库的审计状态 |
| `rk audit findings` | 列出组合中未解决的所有问题 |
| `rk audit controls` | 按领域列出规范控制 |
| `rk audit unaudited` | 列出没有进行审计运行的仓库 |
| `rk audit failing <domain>` | 列出在特定审计领域失败的仓库 |

### 游戏命令

| 命令 | 描述 |
|---------|-------------|
| `rk games score <worklist>` | 对 REMEDIATION-WORKLIST.md 文件进行评分，并显示排行榜 |

## MCP 服务器

MCP 服务器公开了 30 个用于 AI 集成工作流程的工具。将其添加到你的 MCP 客户端配置中：

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

**Claude Desktop (`claude_desktop_config.json`)：**
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

服务器在启动时会从工作目录读取 `rk.config.json`。确保 `rk.config.json` 存在于服务器运行的目录中。

### MCP 工具

**知识与同步：**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**审计：**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**构建健康度**（仅读取数据库，不进行网络刷新）：
`health_feed` `health_doctor` `health_portfolio`

**运营规范：**
`db_fsck` `repo_diff` `ops_runs`

**生命周期与发布：**
`archive_repo` `delete_repo` `repo_versions`

**内部测试与审计演练：**
`suggest_dogfood` `audit_failing`

## 审计框架

该审计系统涵盖 19 个领域，包含 80 项控制措施：

| 领域 | 控制措施 |
|--------|----------|
| 清单 | 仓库元数据、所有权、分类 |
| 代码质量 | 代码风格检查、格式化、复杂度 |
| 安全静态分析 | 静态分析、注入、身份验证 |
| 依赖项扫描 | 漏洞扫描、版本更新 |
| 许可证 | 许可证合规性、兼容性 |
| 密钥 | 密钥检测、轮换 |
| 配置即代码 | 基础设施即代码规范 |
| 容器 | 镜像安全、扫描 |
| 运行时 | 错误处理、弹性 |
| 性能 | 性能分析、优化 |
| 可观测性 | 日志记录、追踪、指标 |
| 测试 | 覆盖率、类型检查、CI 集成 |
| 持续集成/持续交付 (CI/CD) | 流水线安全、门控 |
| 部署 | 发布流程、回滚 |
| 备份与灾难恢复 | 备份计划、恢复 |
| 监控 | 告警、正常运行时间 |
| 合规性与隐私 | 数据处理、GDPR |
| 供应链 | 软件物料清单 (SBOM)、来源 |
| 集成 | API 协议、版本控制 |

每次审计运行都会生成结构化的证据：控制结果（通过/失败/警告/不适用）、包含严重程度和修复措施的发现，以及汇总指标。系统状态会自动推断得出：**健康**、**需要关注**或**关键**。

## 多代理编排：Claude 游戏

repo-knowledge 包含用于在大型代码库中并行执行多个 Claude 操作的模板。Claude 游戏通过共享工作列表协调多个 AI 代理：

1. **审计阶段**——每个代理从工作列表中获取仓库，运行 80 项控制措施的审计，并提交结构化结果。
2. **丰富阶段**——代理添加主题、架构说明和关系映射。
3. **修复阶段**——代理使用评分后的 8 个步骤的工作流程来修复发现的问题。

有关完整操作手册，请参阅 [`templates/claude-games/`](templates/claude-games/)。

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

所有数据都存储在一个 SQLite 数据库中，并使用 FTS5 全文搜索功能对文档、注释和仓库描述进行搜索。

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

由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建
