<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

パッケージレジストリとGitHub APIは、あるリポジトリが何であるかを教えてくれます。それらが何を目的としているのか、他のリポジトリとどのように関連しているのか、そのアーキテクチャの基本理念は何なのか、または最後にセキュリティ監査に合格したかどうかは教えてくれません。repo-knowledgeは、そのギャップを埋めます。それは、基本理念、アーキテクチャ、監査証拠、関係性、およびそれらすべてに対する全文検索を含む、単一のローカルデータベースです。

## インストール

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**要件:**
- Node.js 20+
- GitHubとの同期のための`gh` CLI（認証済み）
- `better-sqlite3`用のC/C++ビルドツール、またはサポートされているプラットフォームで事前にビルドされたバイナリが自動的に使用されます。

## セキュリティモデル

**アクセスされるデータ:** ローカルSQLiteデータベース、`gh` CLIを介したGitHub APIメタデータ（リポジトリ名、説明、トピック、スター数 - ソースコードの内容は含まれません）。

**アクセスされないデータ:** GitHubからソースコードは読み込まれず、認証情報は保存されず、外部サービスにデータは送信されません。

**権限:** GitHubとの同期には、認証された`gh` CLIが必要です。すべてのデータはローカルに保持されます。

**テレメトリ、分析、または自動通信はありません。**

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

### コアコマンド

| コマンド | 説明 |
|---------|-------------|
| `rk init` | 構成、データベースを初期化し、監査コントロールのシードデータを設定します。 |
| `rk sync` | 完全な同期：GitHub組織 + ローカルリポジトリ + FTSインデックス |
| `rk scan <path>` | 単一のローカルリポジトリディレクトリをスキャンします。 |
| `rk show <slug>` | 監査状況とともに、完全なリポジトリ情報を表示します。 |
| `rk list` | すべてのリポジトリをリスト（ステータス、言語、形状でフィルタリング可能） |
| `rk find <query>` | インデックス化されたすべてのコンテンツに対する全文検索 |
| `rk related <slug>` | 特定のレポジトリに関連するレポジトリを表示します。 |
| `rk note <slug>` | `--type` と `--content` を使用して、注釈（論文、アーキテクチャ、警告など）を追加します（オプションで `--title` も使用できます）。`--delete` を使用すると、`--type` + `--title` で指定した注釈を削除できます。 |
| `rk relate <from> <type> <to>` | リポジトリ間の関係を記録します（オプションで`--note`）。 |
| `rk stats` | データベース統計を表示します。 |
| `rk reindex` | FTSインデックスを再構築します。 |
| `rk sync-dogfood` | dogfood-lab/testing-osからリポジトリの事実へと、ドッグフード証拠を同期します。 |
| `rk suggest-dogfood --repo <slug>` | リポジトリまたはサーフェスに対して、既知のドッグフードの結果を提案します。 |

> **`--json`は重要な場所で使用されます。** `list`、`find`、`show`、`related`、および`stats` - さらに5つの監査読み取り（`posture`、`findings`、`controls`、`unaudited`、`failing`）- すべてマシン可読の出力のために`--json`を受け入れます。JSONはコアコマンド全体の重要な要素です。それらのいずれかを直接`jq`にパイプしてください。

### ライフサイクルコマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk delete <slug> [--yes]` | リポジトリとそのすべての子行をカスケード削除します。 |
| `rk archive <slug> [--reason <text>]` | `lifecycle_status`を`archived`に設定します（メモ/結果は保持されます）。 |
| `rk verify-local [--rig <id>] [--strict]` | 各リグに対して`local_path`が存在することを確認し、`repo_local_paths`を更新します。 |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | 現在のリグを登録します。 |
| `rk prune [--dry-run] [--apply] [--days <N>]` | N日以上前にアーカイブされたリポジトリをハード削除します（デフォルトは30日）。 |

### 公開状態コマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | クロスチャネルの公開バージョンダッシュボード（npm/pypi/github_release） |
| `rk drift <slug> [--strict]` | 信頼できるソースバージョンの最新のレジストリとの比較 |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | 手動バインディング設定ツール |

### ヘルスチェックコマンド（v2.0.0 - 研究に基づいています）

| コマンド | 説明 |
|---------|-------------|
| `rk health`（デフォルト=フィード） | フィードを変更します：最後の同期からのデルタ、KEVの交差、CIストリークの中断、アクションピンのドリフト。 |
| `rk health doctor <slug>` | 単一のリポジトリの詳細な調査（依存関係監査、ワークフローアクション、CIシグナル、ツールチェーン）。 |
| `rk health table [--json\ | --text]` | ポートフォリオのヘルスチェックテーブル。JSONは重要な要素です。 |

### 運用コマンド（v2.0.0）

| コマンド | 説明 |
|---------|-------------|
| `rk fsck [--strict] [--json]` | DB整合性チェック。監査行を`db_health_runs`に書き込みます。 |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | 1つのリポジトリのエントリ変更履歴 |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | 最近の`db_health_runs`/`sync_runs`エントリをリストします。 |
| `rk owners list` | 構成されたGitHubオーナーをリストします。 |
| `rk owners add <owner>` | `rk.config.json`にオーナーを追加します。 |
| `rk owners remove <owner>` | `rk.config.json`からオーナーを削除します。 |

### バックアップ、復元、および事前チェック（v2.1.0）

| コマンド | 説明 |
|---------|-------------|
| `rk backup [--out <path>]` | 知識データベースのスナップショットを、`data/backups/`または`--out`の下の真空化されたコピー（`VACUUM INTO`）に保存します。 |
| `rk restore <path> [--yes]` | スキーマ検証を行い、アトミックなスワップを実行し、確認ゲートを設定して（新しいスキーマのバックアップは拒否します）、スナップショットからデータベースを復元します。 |
| `rk doctor [--json] [--strict]` | 環境事前チェック：構成、DB、スキーマバージョン、`gh`認証、現在のリグ、最近の同期/fsck実行。 |
| `rk config [--json]` | フィールドごとのソースを表示して、解決された有効な構成を表示します。 |
| `rk config validate [--json]` | `rk.config.json`を検証します。プレースホルダーのオーナー、無効な形状、または解決できないパスがある場合、ゼロ以外の値で終了します。 |

### 分類（バージョン2.1.1）

| コマンド | 説明 |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | 管理されたライフサイクルフィールドを設定します。これには、`status`（`active`/`paused`/`archived`/`unknown`）、自由形式の `stage`（例：`shipped`、`Phase 1`）、および `category`（`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`）が含まれます。これらは `sync` または `scan` によって自動的に入力されるものではありません。`stage`/`category` をクリアするには、`""` を渡します。 |

### 監査コマンド

| コマンド | 説明 |
|---------|-------------|
| `rk audit seed-controls` | 80個のコントロールからなる標準カタログをシード/更新します。 |
| `rk audit import <dir>` | JSON契約ファイルから監査結果をインポートします。 |
| `rk audit posture [slug]` | 1つまたはすべてのリポジトリの監査状況を表示します。 |
| `rk audit findings` | ポートフォリオ内の未解決の問題をリストします。 |
| `rk audit controls` | ドメインごとの標準コントロールをリストします。 |
| `rk audit unaudited` | 監査実行がないリポジトリをリストします。 |
| `rk audit failing <domain>` | 特定の監査ドメインで失敗しているリポジトリをリストします。 |

### ゲームコマンド

| コマンド | 説明 |
|---------|-------------|
| `rk games score <worklist>` | REMEDIATION-WORKLIST.mdのスコアを計算し、リーダーボードを表示します。 |

## MCPサーバー

MCPサーバーは、AI統合ワークフローのための30個のツールを提供します。それをMCPクライアント構成に追加してください。

**Claude Code（プロジェクト固有の`.claude.json`）：**
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

サーバーは、起動時に作業ディレクトリから`rk.config.json`を読み取ります。サーバーが実行されるディレクトリに`rk.config.json`が存在することを確認してください。

### MCPツール

**知識と同期:**
`get_repo`、`find_repos`、`search_repos`、`related_repos`、`repos_by_stack`、`repos_needing_work`、`repo_summary`、`add_repo_note`、`add_relationship`、`knowledge_stats`、`sync_repos`、`sync_dogfood`

**監査:**
`audit_posture`、`audit_portfolio`、`audit_findings`、`audit_detail`、`audit_submit`、`audit_controls_list`、`audit_unaudited`

**ビルドの健全性**（DBのみ読み込み、ネットワーク更新なし）：
`health_feed`、`health_doctor`、`health_portfolio`

**運用上の衛生管理:**
`db_fsck`、`repo_diff`、`ops_runs`

**ライフサイクルと公開:**
`archive_repo`、`delete_repo`、`repo_versions`

**ドッグフードテストと監査演習:**
`suggest_dogfood`、`audit_failing`

## 監査フレームワーク

監査システムは、80のコントロールを備えた19の領域をカバーします。

| 領域 | コントロール |
|--------|----------|
| インベントリ | リポジトリメタデータ、所有権、分類 |
| コード品質 | リンティング、フォーマット、複雑性 |
| セキュリティ（静的解析） | 静的分析、インジェクション、認証 |
| 依存関係（ソフトウェア部品表） | 脆弱性スキャン、最新バージョンチェック |
| ライセンス | ライセンス遵守、互換性 |
| シークレット（機密情報） | シークレット検出、ローテーション |
| 構成（IaC：Infrastructure as Code） | コードとしてのインフラストラクチャの衛生管理 |
| コンテナ | イメージセキュリティ、スキャン |
| 実行時 | エラー処理、回復力 |
| パフォーマンス | プロファイリング、最適化 |
| 可観測性 | ロギング、トレーシング、メトリクス |
| テスト | カバレッジ、型チェック、CI統合 |
| CI/CD（継続的インテグレーション/継続的デリバリー） | パイプラインセキュリティ、ゲート |
| デプロイメント | リリースプロセス、ロールバック |
| バックアップと災害復旧 | バックアップ計画、リカバリ |
| 監視 | アラート、稼働時間 |
| コンプライアンスとプライバシー | データ処理、GDPR（一般データ保護規則） |
| サプライチェーン | SBOM（ソフトウェア部品表）、来歴情報 |
| 統合 | APIコントラクト、バージョン管理 |

各監査実行では、構造化された証拠が生成されます。これには、コントロール結果（合格/不合格/警告/該当なし）、重大度と修正策を含む検出結果、および集計メトリクスが含まれます。状態は自動的に導き出されます：**正常**、**注意が必要**、または**クリティカル**。

## マルチエージェントオーケストレーション：Claude Games

リポジトリ知識には、大規模なポートフォリオにわたる並列マルチClaudeオペレーションのテンプレートが含まれています。Claude Gamesは、共有ワークリストを通じて複数のAIエージェントを調整します。

1. **監査パス** — 各エージェントがワークリストからリポジトリを取得し、80個のコントロールによる監査を実行し、構造化された結果を送信します。
2. **エンリッチメントパス** — エージェントは、仮説、アーキテクチャノート、および関係マッピングを追加します。
3. **修正パス** — エージェントは、スコアリングされた8段階のワークフローを使用して検出された問題を修正します。

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

すべてのデータは、ドキュメント、ノート、およびリポジトリの説明全体でFTS5フルテキスト検索を使用する単一のSQLiteデータベースに保存されます。

## 構成

ワークスペースのルートに`rk.config.json`を作成します（または`rk init`を実行します）。

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

すべての設定は、`rk.config.json`（`rk init`によって作成される）から取得されます。MCPサーバーも、作業ディレクトリから構成を読み取ります。

## ライセンス

[MIT](LICENSE)

---

<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>によって構築されました。
