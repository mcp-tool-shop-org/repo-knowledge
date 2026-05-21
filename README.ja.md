<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

# Include forked repos
rk sync --owners my-org --forks

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
| `rk sync` | 完全同期：GitHubの組織 + ローカルリポジトリ + 全文検索インデックス |
| `rk scan <path>` | 単一のローカルリポジトリディレクトリをスキャンします。 |
| `rk show <slug>` | 監査状況とともに、完全なリポジトリ情報を表示します。 |
| `rk list` | すべてのリポジトリを一覧表示します（ステータス、言語、構造でフィルタリング可能）。 |
| `rk find <query>` | すべてのインデックス化されたコンテンツに対する全文検索を行います。 |
| `rk related <slug>` | 特定のレポジトリに関連するレポジトリを一覧表示します。 |
| `rk note <slug>` | `--type`と`--content`（オプションで`--title`）を使用して、型付きのメモ（設計思想、アーキテクチャ、警告など）を追加します。 |
| `rk relate <from> <type> <to>` | リポジトリ間の関係を記録します（オプションで`--note`）。 |
| `rk stats` | データベースの統計情報を表示します。 |
| `rk reindex` | 全文検索インデックスを再構築します。 |
| `rk sync-dogfood` | `dogfood-lab/testing-os`から「dogfood」の証拠をインポートし、リポジトリの情報を更新します。 |
| `rk suggest-dogfood --repo <slug>` | リポジトリまたはサービスに対する既知の「dogfood」の問題を提案します。 |

### ライフサイクルコマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk delete <slug> [--yes]` | リポジトリとその子レコードをまとめて削除します。 |
| `rk archive <slug> [--reason <text>]` | `lifecycle_status`を`archived`に変更します（メモ/検出結果は保持されます）。 |
| `rk verify-local [--rig <id>] [--strict]` | `local_path`が各環境に存在するかどうかを確認し、`repo_local_paths`を更新します。 |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | 現在の環境を登録します。 |
| `rk prune [--dry-run] [--apply] [--days <N>]` | N日以上（デフォルトは30日）アーカイブされたリポジトリを完全に削除します。 |

### 公開状態コマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | クロスチャネルの公開バージョンダッシュボード（npm/pypi/github_release） |
| `rk drift <slug> [--strict]` | 信頼できるソースのバージョンと、最新のレジストリのバージョンを比較します。 |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | 手動バインディング設定ツール |

### ヘルスチェックコマンド（v2.0.0 - リサーチベース）

| コマンド | 説明 |
|---------|-------------|
| `rk health`（デフォルト = フィード） | フィードの変更：最終同期からの差分、KEVの共通部分、CIの連続性の中断、アクションピンのずれ。 |
| `rk health doctor <slug>` | 単一リポジトリの詳細分析（依存関係監査、ワークフローアクション、CI信号、ツールチェーン）。 |
| `rk health table [--json\ | --text]` | ポートフォリオのヘルスチェックテーブル。JSONは、動作に必要な契約です。 |

### 運用コマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk fsck [--strict] [--json]` | データベースの整合性チェック。監査レコードを`db_health_runs`に書き込みます。 |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | 1つのリポジトリのエントリの変更履歴を表示します。 |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | 最近の`db_health_runs` / `sync_runs`のエントリを一覧表示します。 |
| `rk owners list` | 設定されているGitHubのオーナーを一覧表示します。 |
| `rk owners add <owner>` | `rk.config.json`のオーナーに追加します。 |
| `rk owners remove <owner>` | `rk.config.json`のオーナーから削除します。 |

### 監査コマンド

| コマンド | 説明 |
|---------|-------------|
| `rk audit seed-controls` | 80個のコントロールを含む標準カタログをシードまたは更新します。 |
| `rk audit import <dir>` | JSON形式の監査結果をインポートします。 |
| `rk audit posture [slug]` | 特定のレポジトリまたはポートフォリオ全体の監査状況を表示します。 |
| `rk audit findings` | ポートフォリオ全体で未解決の問題を一覧表示します。 |
| `rk audit controls` | ドメインごとの標準コントロールを一覧表示します。 |
| `rk audit unaudited` | 監査が実行されていないレポジトリを一覧表示します。 |
| `rk audit failing <domain>` | 特定の監査ドメインで失敗したレポジトリを一覧表示します。 |

### コマンド：ゲーム

| コマンド | 説明 |
|---------|-------------|
| `rk games score <worklist>` | REMEDIATION-WORKLIST.md のスコアを表示し、ランキングを表示します。 |

## MCP サーバー

MCP サーバーは、AI を活用したワークフローのための 19 のツールを提供します。 MCP クライアントの設定に追加してください。

**Claude Code (プロジェクト固有の `.claude.json`):**
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

**Claude Desktop (`claude_desktop_config.json`):**
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

サーバーは、起動時に作業ディレクトリにある `rk.config.json` を読み込みます。 サーバーが実行されているディレクトリに `rk.config.json` が存在することを確認してください。

### MCP ツール

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## 監査フレームワーク

監査システムは、19 のドメインと 80 のコントロールで構成されています。

| ドメイン | コントロール |
|--------|----------|
| インベントリ | レポジトリのメタデータ、所有権、分類 |
| コード品質 | Linting、フォーマット、複雑さ |
| セキュリティ SAST | 静的解析、インジェクション、認証 |
| 依存関係 SCA | 脆弱性スキャン、ライセンスの有効期限 |
| ライセンス | ライセンスコンプライアンス、互換性 |
| 機密情報 | 機密情報の検出、ローテーション |
| 構成 IaC | インフラストラクチャ・アズ・コードの衛生 |
| コンテナ | イメージのセキュリティ、スキャン |
| 実行時 | エラー処理、耐障害性 |
| パフォーマンス | プロファイリング、最適化 |
| 可観測性 | ロギング、トレース、メトリクス |
| テスト | カバレッジ、型、CI 統合 |
| CI/CD | パイプラインのセキュリティ、ゲート |
| デプロイ | リリースプロセス、ロールバック |
| バックアップとディザスタリカバリ | バックアップ計画、復旧 |
| 監視 | アラート、稼働時間 |
| コンプライアンスとプライバシー | データ処理、GDPR |
| サプライチェーン | SBOM、トレーサビリティ |
| 統合 | API コントラクト、バージョン管理 |

各監査実行では、構造化された証拠が生成されます。これには、コントロールの結果（合格/不合格/警告/非該当）、深刻度と修正情報を含む問題、および集計されたメトリクスが含まれます。 監査状況は自動的に導出されます。**正常**、**注意が必要**、または**重大**。

## マルチエージェントオーケストレーション：Claude Games

repo-knowledge には、大規模なポートフォリオ全体で複数の Claude を並行して実行するためのテンプレートが含まれています。 Claude Games は、共有のワークリストを通じて複数の AI エージェントを調整します。

1. **監査パス**：各エージェントはワークリストからレポジトリを取得し、80 のコントロールによる監査を実行し、構造化された結果を送信します。
2. **エンリッチメントパス**：エージェントは、論文、アーキテクチャに関するメモ、および関係のマッピングを追加します。
3. **修正パス**：エージェントは、スコアリングされた 8 ステップのワークフローを使用して、問題を修正します。

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

すべてのデータは、単一の SQLite データベースに保存され、ドキュメント、メモ、およびレポジトリの説明に対して FTS5 フルテキスト検索が可能です。

## 設定

作業領域のルートディレクトリに `rk.config.json` ファイルを作成します（または `rk init` コマンドを実行します）。

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

すべての設定は `rk.config.json` ファイルから読み込まれます（`rk init` コマンドによって作成されます）。MCP サーバーも、作業ディレクトリから設定ファイルを読み込みます。

## ライセンス

[MIT](LICENSE)

---

開発者: <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
