<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/repo-knowledge/readme.png" alt="repo-knowledge" width="400" />
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

## なぜ

パッケージレジストリやGitHub APIは、リポジトリが「何であるか」を教えてくれます。しかし、それが「何のためにあるのか」、他のリポジトリとの関連性、アーキテクチャの設計思想、または直近のセキュリティ監査に合格したかどうかは教えてくれません。repo-knowledgeは、このギャップを埋めます。これは、設計思想、アーキテクチャ、監査証拠、関連性、そしてこれらすべてに対する全文検索機能を備えた、単一のローカルデータベースです。

## インストール

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**要件:**
- Node.js 20以上
- GitHubとの同期に必要な`gh` CLI（認証済み）
- `better-sqlite3`用のC/C++ビルドツール。対応するプラットフォームでは、あらかじめコンパイルされたバイナリが自動的に使用されます。

## セキュリティモデル

**アクセスするデータ:** ローカルのSQLiteデータベース、`gh` CLIを介したGitHub APIのメタデータ（リポジトリ名、説明、トピック、スター数 - ソースコードの内容は含まれません）。

**アクセスしないデータ:** GitHubからソースコードは読み込まれません。認証情報は保存されません。外部サービスへのデータ送信もありません。

**権限:** GitHubとの同期には、`gh` CLIの認証が必要です。すべてのデータはローカルに保存されます。

**テレメトリー、アナリティクス、および外部へのデータ送信はありません。**

## クイックスタート

```bash
# Initialize workspace — creates config, database, seeds audit controls
rk init

# Sync repos from your GitHub org
rk sync --owners my-org

# Inspect a specific repo
rk show my-org/my-repo

# Search across everything
rk find "authentication middleware"

# Seed the 80-control audit framework
rk audit seed-controls
```

## CLIリファレンス

### 主要なコマンド

| コマンド | 説明 |
|---------|-------------|
| `rk init` | 設定、データベースの初期化、および監査コントロールの初期設定を行います。 |
| `rk sync` | 完全な同期：GitHubの組織 + ローカルリポジトリ + 全文検索インデックス |
| `rk scan <path>` | 単一のローカルリポジトリディレクトリをスキャンします。 |
| `rk show <slug>` | 監査状況とともに、完全なリポジトリ情報を表示します。 |
| `rk list` | すべてのリポジトリを一覧表示します（ステータス、言語、構造でフィルタリング可能）。 |
| `rk find <query>` | すべてのインデックスされたコンテンツに対する全文検索を行います。 |
| `rk related <slug>` | 特定のレポジトリに関連するレポジトリを一覧表示します。 |
| `rk note <slug>` | タイプ付きのメモ（設計思想、アーキテクチャ、警告など）を追加します。 |
| `rk relate <from> <type> <to>` | リポジトリ間の関係を記録します。 |
| `rk stats` | データベースの統計情報を表示します。 |
| `rk reindex` | 全文検索インデックスを再構築します。 |

### 監査コマンド

| コマンド | 説明 |
|---------|-------------|
| `rk audit seed-controls` | 80個のコントロールを含む標準カタログを初期化/更新します。 |
| `rk audit import <dir>` | JSON形式のファイルから監査結果をインポートします。 |
| `rk audit posture [slug]` | 1つのリポジトリまたはすべてのポートフォリオの監査状況を表示します。 |
| `rk audit findings` | ポートフォリオ全体で未解決の問題を一覧表示します。 |
| `rk audit controls` | ドメインごとに標準コントロールを一覧表示します。 |
| `rk audit unaudited` | 監査が実行されていないリポジトリを一覧表示します。 |
| `rk audit failing <domain>` | 特定の監査ドメインに失敗したリポジトリを一覧表示します。 |

## MCPサーバー

MCPサーバーは、AI統合ワークフローのための20種類のツールを提供します。MCPクライアントの設定に追加してください。

**claude_desktop_config.json:**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "node",
      "args": ["node_modules/@mcptoolshop/repo-knowledge/dist/mcp/server.js"],
      "env": {
        "RK_DB_PATH": "/path/to/knowledge.db"
      }
    }
  }
}
```

**.claude.json (プロジェクトスコープ):**
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

### MCPツール

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## 監査フレームワーク

監査システムは、19のドメインと80のコントロールで構成されています。

| ドメイン | コントロール |
|--------|----------|
| inventory | リポジトリのメタデータ、所有権、分類 |
| code_quality | Linting、フォーマット、複雑さ |
| security_sast | 静的解析、インジェクション、認証 |
| dependencies_sca | 脆弱性スキャン、バージョン管理 |
| licenses | ライセンスコンプライアンス、互換性 |
| secrets | 秘密情報の検出、ローテーション |
| config_iac | Infrastructure-as-codeの衛生管理 |
| containers | イメージのセキュリティ、スキャン |
| runtime | エラー処理、耐障害性 |
| performance | プロファイリング、最適化 |
| 可観測性 | ログ、トレース、メトリクス |
| テスト | カバレッジ、型、CI連携 |
| CI/CD | パイプラインのセキュリティ、ゲート |
| デプロイ | リリースプロセス、ロールバック |
| バックアップとディザスタリカバリ | バックアップ計画、復旧 |
| 監視 | アラート、稼働率 |
| コンプライアンスとプライバシー | データ管理、GDPR |
| サプライチェーン | SBOM、トレーサビリティ |
| 連携 | API契約、バージョン管理 |

各監査実行では、構造化された証拠が生成されます。具体的には、コントロール結果（合格/不合格/警告/該当なし）、重大度と修正方法が記載された問題点、および集計されたメトリクスが含まれます。システムの健全性は、自動的に「正常」、「注意が必要」、「重大」のいずれかに分類されます。

## マルチエージェントオーケストレーション：Claude Games

repo-knowledgeには、大規模なポートフォリオ全体で複数のClaudeインスタンスを並行して実行するためのテンプレートが含まれています。Claude Gamesは、複数のAIエージェントを共有ワークリストを通じて連携させます。

1. **監査フェーズ**: 各エージェントはワークリストからリポジトリを選択し、80個のコントロール項目による監査を実行し、構造化された結果を送信します。
2. **エンリッチメントフェーズ**: エージェントは、考察、アーキテクチャに関するメモ、および関連性マッピングを追加します。
3. **修正フェーズ**: エージェントは、スコアリングされた8ステップのワークフローを使用して、問題点を修正します。

詳細については、[`templates/claude-games/`](templates/claude-games/) を参照してください。

## データモデル

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

すべてのデータは、ドキュメント、メモ、およびリポジトリの説明全体を対象とした全文検索機能を備えた、単一のSQLiteデータベースに保存されています。

## 設定

ワークスペースのルートディレクトリに `rk.config.json` ファイルを作成します（または `rk init` コマンドを実行します）。

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

環境変数: `RK_DB_PATH`, `RK_OWNERS`, `RK_LOCAL_DIRS`.

## ライセンス

[MIT](LICENSE)

---

作成：<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
