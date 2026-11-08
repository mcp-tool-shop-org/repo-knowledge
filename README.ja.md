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

## なぜか

パッケージレジストリとGitHub API は、リポジトリが何であるかを教えてくれます。リポジトリが何のためにあるのか、他のリポジトリとどのように関連しているのか、そのアーキテクチャの基本理念は何か、または最後にセキュリティ監査に合格したかどうかは教えてくれません。repo-knowledge は、そのギャップを埋めます。それは、基本理念、アーキテクチャ、監査証拠、関係性、およびそれらすべてに対する全文検索を含む、単一のローカルデータベースです。

## インストール

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**要件:**
- Node.js 20 以降 — このパッケージの`engines.node`は`>=20`です。ロックされた`better-sqlite3`アドオン自身の`engines`リストは、ベンダーの主要バージョンであり、事前ビルドの互換性を示すものではありません。
- `gh` CLI（認証済み）によるGitHub同期
- 事前ビルドが存在しない場合に備えて、`better-sqlite3`用の C/C++ ビルドツール。アドオンのインストールスクリプトはデュアルパスです：`prebuild-install || node-gyp rebuild --release`。利用可能な場合は、対応する事前ビルドが使用されます。それ以外の場合は、`node-gyp`がソースからコンパイルされます。これは、すべてのプラットフォームで利用できるわけではありません。インストールに失敗した場合は、[better-sqlite3トラブルシューティングガイド](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md)を参照してください。

## セキュリティモデル

**アクセスされるデータ:** ローカルのSQLiteデータベース、GitHub API メタデータ（`gh` CLI 経由）、（リポジトリ名、説明、トピック、スター数 — ソースコードの内容は含まれません）。

**アクセスされないデータ:** GitHubからソースコードは読み込まれません。認証情報は保存されません。データは外部サービスに送信されません。

**権限:** GitHub同期には、`gh` CLI での認証が必要です。すべてのデータはローカルに保存されます。

**テレメトリ、分析、および「ホームへの通信」はありません。**

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

## CLI リファレンス

### 主要コマンド

| コマンド | 説明 |
|---------|-------------|
| `rk init` | 構成、データベース、および監査制御の初期化 |
| `rk sync` | 完全同期：GitHub組織 + ローカルリポジトリ + FTS インデックス |
| `rk scan <path>` | 単一のローカルリポジトリディレクトリのスキャン |
| `rk show <slug>` | 監査状況を含む、完全なリポジトリ情報を表示 |
| `rk list` | すべてのリポジトリをリスト表示（ステータス、言語、形状でフィルタリング可能） |
| `rk find <query>` | インデックス化されたすべてのコンテンツに対する全文検索 |
| `rk related <slug>` | 特定のレポジトリに関連するレポジトリを表示 |
| `rk note <slug>` | 型付きのノート（基本理念、アーキテクチャ、警告など）を追加（`--type`と`--content`、オプションの`--title`）。`--delete`は、`--type` + `--title`によってノートを廃止します。 |
| `rk relate <from> <type> <to>` | リポジトリ間の関係を記録（オプションの`--note`） |
| `rk stats` | データベースの統計情報を表示 |
| `rk reindex` | FTS インデックスを再構築 |
| `rk sync-dogfood` | dogfood-lab/testing-os からリポジトリの事実への dogfood の証拠を同期 |
| `rk suggest-dogfood --repo <slug>` | リポジトリまたは表面に対して、既知の dogfood の結果を提案 |

> **重要な場所では、`--json`を使用します。** `list`、`find`、`show`、`related`、および`stats` — さらに、5つの監査読み取り（`posture`、`findings`、`controls`、`unaudited`、`failing`） — すべて、機械可読の出力のために`--json`を受け入れます。JSON は、主要コマンド全体で重要な役割を果たします。それらのいずれかを直接 `jq` にパイプできます。

### ライフサイクルコマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk delete <slug> [--yes]` | リポジトリとそのすべての子行をカスケード削除 |
| `rk archive <slug> [--reason <text>]` | `lifecycle_status` を `archived` に切り替えます（ノート/結果は保持されます）。 |
| `rk verify-local [--rig <id>] [--strict]` | 各リグに対して `local_path` が存在することを確認し、`repo_local_paths` を更新します。 |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | 現在のリグを登録します。 |
| `rk prune [--dry-run] [--apply] [--days <N>]` | N 日以上前にアーカイブされたリポジトリをハード削除します（デフォルトは 30 日）。 |

### 公開状態コマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | クロスチャネルの公開バージョンダッシュボード（npm/pypi/github_release） |
| `rk drift <slug> [--strict]` | 真実のソースバージョンと最新のレジストリを比較 |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | 手動バインディング設定 |

### ヘルスコマンド（v2.0.0 — 研究に基づいています）

| コマンド | 説明 |
|---------|-------------|
| `rk health`（デフォルト = フィード） | フィードを変更：前回の同期からの差分、KEV の交差、CI ストリークの停止、アクションピンのドリフト |
| `rk health doctor <slug>` | 単一のリポジトリの詳細な調査（依存関係の監査、ワークフローアクション、CI シグナル、ツールチェーン） |
| `rk health table [--json\|--text]` | ポートフォリオのヘルステーブル。JSON が重要な役割を果たします。 |

### 運用コマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk fsck [--strict] [--json]` | DB の整合性チェック。監査行を `db_health_runs` に書き込みます。 |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | 1 つのリポジトリの変更履歴 |
| `rk runs [--db-health\|--sync] [--limit <N>] [--json]` | 最近の `db_health_runs` / `sync_runs` エントリをリスト表示 |
| `rk owners list` | 構成された GitHub オーナーをリスト表示 |
| `rk owners add <owner>` | `rk.config.json` オーナーに追加 |
| `rk owners remove <owner>` | `rk.config.json` オーナーから削除 |

### バックアップ、復元、および事前チェック（v2.1.0）

| コマンド | 説明 |
|---------|-------------|
| `rk backup [--out <path>]` | 知識データベースの現在の状態を、クリーンなコピー（`VACUUM INTO`）として、`data/backups/`または`--out`に保存します。 |
| `rk restore <path> [--yes]` | データベースをスナップショットから復元します。スキーマ検証、アトミックスワップ、確認ゲート付き（より新しいスキーマのバックアップは拒否します）。 |
| `rk doctor [--json] [--strict]` | 環境の事前チェック：構成、データベース、スキーマバージョン、`gh`認証、現在のリグ、最近の同期/fsck 実行 |
| `rk config [--json]` | フィールドごとのプロベナンスを含む、解決された有効な構成を表示 |
| `rk config validate [--json]` | `rk.config.json` を検証します。プレースホルダーのオーナー、無効な形状、または解決できないパスがある場合、ゼロ以外の値で終了します。 |

### 分類（v2.1.1）

| コマンド | 説明 |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | キュレーションされたライフサイクルフィールドを設定します。`status`（`active`/`paused`/`archived`/`unknown`）、フリーフォームの`stage`（例：`shipped`、`Phase 1`）、および`category`（`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`）。これらは、`sync`または`scan`によって入力されるものではありません。`""`を渡して、`stage`/`category`をクリアします。 |

### 監査コマンド

| コマンド | 説明 |
|---------|-------------|
| `rk audit seed-controls` | 80 個のコントロールからなる標準カタログをシード/更新 |
| `rk audit import <dir>` | JSON 形式のコントラクトファイルから監査結果をインポート |
| `rk audit posture [slug]` | 1 つのリポジトリまたは完全なポートフォリオの監査状況を表示 |
| `rk audit findings` | ポートフォリオ全体の未解決の課題をリスト表示 |
| `rk audit controls` | ドメインごとの標準コントロールをリスト表示 |
| `rk audit unaudited` | 監査が実行されていないリポジトリをリスト表示 |
| `rk audit failing <domain>` | 特定の監査ドメインに失敗しているリポジトリをリスト表示 |

### ゲームコマンド

| コマンド | 説明 |
|---------|-------------|
| `rk games score <worklist>` | REMEDIATION-WORKLIST.md をスコアリングし、リーダーボードを表示 |

## MCP サーバー

MCP サーバーは、AI を統合したワークフローのための 30 個のツールを公開します。MCP クライアント構成にサーバーを追加します。

**Claude Code（プロジェクトスコープの `.claude.json`）:**
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

**Claude Desktop（`claude_desktop_config.json`）:**
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

サーバーは、起動時に作業ディレクトリから `rk.config.json` を読み取ります。サーバーが実行されるディレクトリに `rk.config.json` が存在することを確認してください。

### MCP ツール

**知識と同期:**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**監査:**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**ビルド健全性**（データベースのみ読み取り、ネットワーク更新なし）：
`health_feed` `health_doctor` `health_portfolio`

**運用上の衛生管理:**
`db_fsck` `repo_diff` `ops_runs`

**ライフサイクルと公開:**
`archive_repo` `delete_repo` `repo_versions`

**内部利用と監査演習:**
`suggest_dogfood` `audit_failing`

## 監査フレームワーク

監査システムは、80のコントロールを備えた19のドメインを対象としています。

| ドメイン | コントロール |
|--------|----------|
| インベントリ | リポジトリメタデータ、所有権、分類 |
| コード品質 | Linting、フォーマット、複雑性 |
| セキュリティSAST | 静的解析、インジェクション、認証 |
| 依存関係SCA | 脆弱性スキャン、最新性 |
| ライセンス | ライセンスコンプライアンス、互換性 |
| シークレット | シークレット検出、ローテーション |
| 構成IAC | コードとしてのインフラストラクチャの衛生管理 |
| コンテナ | イメージセキュリティ、スキャン |
| 実行時 | エラー処理、回復力 |
| パフォーマンス | プロファイリング、最適化 |
| 可観測性 | ロギング、トレーシング、メトリクス |
| テスト | カバレッジ、タイプ、CI統合 |
| CI/CD | パイプラインセキュリティ、ゲート |
| デプロイ | リリースプロセス、ロールバック |
| バックアップ/DR | バックアップ計画、復旧 |
| 監視 | アラート、稼働時間 |
| コンプライアンス/プライバシー | データ処理、GDPR |
| サプライチェーン | SBOM、来歴 |
| 統合 | API契約、バージョン管理 |

各監査実行では、構造化された証拠が生成されます。コントロール結果（合格/不合格/警告/該当なし）、重大度と修正策を含む結果、および集計メトリクス。姿勢は自動的に導き出されます：**正常**、**注意が必要**、または**重大**。

## マルチエージェントオーケストレーション：Claude Games

リポジトリ知識には、大規模なポートフォリオにわたる並列マルチClaudeオペレーションのテンプレートが含まれています。Claude Gamesは、共有ワークリストを通じて複数のAIエージェントを調整します。

1. **監査パス** — 各エージェントは、ワークリストからリポジトリを取得し、80のコントロールによる監査を実行し、構造化された結果を送信します。
2. **エンリッチメントパス** — エージェントは、仮説、アーキテクチャノート、および関係マッピングを追加します。
3. **修正パス** — エージェントは、スコアリングされた8段階のワークフローを使用して、結果を修正します。

完全なプレイブックについては、[`templates/claude-games/`](templates/claude-games/)を参照してください。

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

すべてのデータは、ドキュメント、ノート、およびリポジトリの説明全体でFTS5の全文検索を備えた、単一のSQLiteデータベースに保存されます。

## 構成

ワークスペースのルートに`rk.config.json`を作成するか（または`rk init`を実行します）。

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

すべての設定は、`rk.config.json`（`rk init`によって作成）から取得されます。MCPサーバーは、作業ディレクトリから構成も読み取ります。

## ライセンス

[MIT](LICENSE)

---

<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>によって構築されました。
