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

## Pourquoi

Les registres de paquets et les API GitHub vous indiquent ce qu’est un dépôt. Ils ne vous disent pas à quoi il sert, comment il est lié à vos autres dépôts, quelle est sa conception architecturale, ou s’il a passé votre dernier audit de sécurité. Repo-knowledge comble cette lacune : une base de données locale unique qui contient la conception, l’architecture, les preuves d’audit, les relations et une recherche en texte intégral sur l’ensemble de ces éléments.

## Installation

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Conditions requises :**
- Node.js 20 ou version ultérieure : le `engines.node` de ce paquet est `>=20`. La liste `engines` du module complémentaire `better-sqlite3` verrouillé contient les versions principales des fournisseurs, et non une déclaration de couverture des versions précompilées.
- `gh` CLI (authentifié) pour la synchronisation GitHub.
- Outils de compilation C/C++ pour `better-sqlite3`, au cas où une version précompilée serait manquante. Le script d’installation du module complémentaire utilise deux chemins : `prebuild-install || node-gyp rebuild --release`. Une version précompilée correspondante est utilisée lorsqu’elle est disponible ; sinon, `node-gyp` compile à partir du code source. Il ne s’agit pas d’une couverture universelle des plateformes. En cas d’échec de l’installation, consultez le [guide de dépannage better-sqlite3](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).

## Modèle de sécurité

**Données concernées :** base de données locale SQLite, métadonnées de l’API GitHub via la CLI `gh` (noms des dépôts, descriptions, sujets, étoiles — aucun contenu du code source).

**Données NON concernées :** aucun code source n’est lu à partir de GitHub, aucune information d’identification n’est stockée, aucune donnée n’est envoyée à des services externes.

**Autorisations :** nécessite une CLI `gh` authentifiée pour la synchronisation GitHub ; toutes les données restent locales.

**Pas de télémétrie, pas d’analyse, pas de communication vers le domicile.**

## Démarrage rapide

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

## Référence de la CLI

### Commandes principales

| Commande | Description |
|---------|-------------|
| `rk init` | Initialiser la configuration, la base de données et les contrôles d’audit |
| `rk sync` | Synchronisation complète : GitHub organisations + dépôts locaux + index FTS |
| `rk scan <path>` | Analyser un seul répertoire de dépôt local |
| `rk show <slug>` | Afficher l’ensemble des connaissances du dépôt avec la posture d’audit |
| `rk list` | Lister tous les dépôts (filtrables par statut, langage, forme) |
| `rk find <query>` | Recherche en texte intégral dans l’ensemble du contenu indexé |
| `rk related <slug>` | Afficher les dépôts liés à un dépôt donné |
| `rk note <slug>` | Ajouter une note typée (conception, architecture, avertissement, etc.) avec `--type` et `--content` (facultatif `--title`) ; `--delete` retire une note en utilisant `--type` + `--title` |
| `rk relate <from> <type> <to>` | Enregistrer une relation entre les dépôts (facultatif `--note`) |
| `rk stats` | Afficher les statistiques de la base de données |
| `rk reindex` | Reconstruire l’index FTS |
| `rk sync-dogfood` | Synchroniser les preuves de dogfooding à partir de dogfood-lab/testing-os vers les faits du dépôt |
| `rk suggest-dogfood --repo <slug>` | Suggérer les problèmes de dogfooding connus pour un dépôt ou une surface |

> **`--json` partout où cela compte.** `list`, `find`, `show`, `related` et `stats` — ainsi que les cinq lectures d’audit (`posture`, `findings`, `controls`, `unaudited`, `failing`) — acceptent toutes `--json` pour une sortie lisible par machine. JSON est le contrat de base entre les commandes principales : vous pouvez rediriger n’importe laquelle d’entre elles directement vers `jq`.

### Commandes du cycle de vie (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk delete <slug> [--yes]` | Supprimer en cascade un dépôt et toutes les lignes enfants |
| `rk archive <slug> [--reason <text>]` | Inverser `lifecycle_status` à `archived` (conserve les notes/résultats) |
| `rk verify-local [--rig <id>] [--strict]` | Vérifier que `local_path` existe par rig ; met à jour `repo_local_paths` |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Enregistrer le rig actuel |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Supprimer définitivement les dépôts archivés depuis plus de N jours (par défaut 30) |

### Commandes d’état de publication (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Tableau de bord de la version publiée multi-canal (npm/pypi/github_release) |
| `rk drift <slug> [--strict]` | Comparer la version source de vérité par rapport au dernier registre |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Définisseur de liaison manuelle |

### Commandes de santé (v2.0.0 — fondées sur la recherche)

| Commande | Description |
|---------|-------------|
| `rk health` (par défaut = flux) | Modifier le flux : deltas depuis la dernière synchronisation, intersection KEV, interruptions de la série CI, dérive de l’action-pin |
| `rk health doctor <slug>` | Analyse approfondie d’un seul dépôt (audit des dépendances, actions du flux de travail, signal CI, chaîne d’outils) |
| `rk health table [--json\|--text]` | Tableau de bord de la santé du portefeuille ; JSON est le contrat de base |

### Commandes opérationnelles (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Vérification de l’intégrité de la base de données ; écrit une ligne d’audit dans `db_health_runs` |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Historique des modifications d’une entrée pour un dépôt |
| `rk runs [--db-health\|--sync] [--limit <N>] [--json]` | Lister les entrées `db_health_runs` / `sync_runs` récentes |
| `rk owners list` | Lister les propriétaires configurés GitHub |
| `rk owners add <owner>` | Ajouter aux propriétaires `rk.config.json` |
| `rk owners remove <owner>` | Supprimer des propriétaires `rk.config.json` |

### Sauvegarde, restauration et pré-vol (v2.1.0)

| Commande | Description |
|---------|-------------|
| `rk backup [--out <path>]` | Créer un instantané de la base de données de connaissances dans une copie nettoyée (`VACUUM INTO`) sous `data/backups/` ou `--out` |
| `rk restore <path> [--yes]` | Restaurer la base de données à partir d’un instantané — validation du schéma, échange atomique, confirmation obligatoire (refuse une sauvegarde avec un schéma plus récent) |
| `rk doctor [--json] [--strict]` | Pré-vol de l’environnement : configuration, base de données, version du schéma, authentification `gh`, rig actuel, exécutions de synchronisation/fsck récentes |
| `rk config [--json]` | Afficher la configuration effective résolue avec la provenance par champ |
| `rk config validate [--json]` | Valider `rk.config.json` — quitte avec un code d’erreur non nul en cas de propriétaires de substitution, de formes incorrectes ou de chemins non résolubles |

### Classification (v2.1.1)

| Commande | Description |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | Définir les champs du cycle de vie organisés — `status` (`active`/`paused`/`archived`/`unknown`), `stage` en texte libre (par exemple, `shipped`, `Phase 1`) et `category` (`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`). Ces champs ne sont pas renseignés par `sync` ou `scan` ; passez `""` pour effacer `stage`/`category` |

### Commandes d’audit

| Commande | Description |
|---------|-------------|
| `rk audit seed-controls` | Initialiser/mettre à jour le catalogue canonique de 80 contrôles |
| `rk audit import <dir>` | Importer les résultats d’audit à partir de fichiers de contrat JSON |
| `rk audit posture [slug]` | Afficher la posture d’audit pour un dépôt ou l’ensemble du portefeuille |
| `rk audit findings` | Lister les problèmes ouverts dans l’ensemble du portefeuille |
| `rk audit controls` | Lister les contrôles canoniques par domaine |
| `rk audit unaudited` | Lister les dépôts sans exécution d’audit |
| `rk audit failing <domain>` | Lister les dépôts qui échouent à un domaine d’audit spécifique |

### Commandes de jeux

| Commande | Description |
|---------|-------------|
| `rk games score <worklist>` | Noter un REMEDIATION-WORKLIST.md et afficher le classement |

## Serveur MCP

Le serveur MCP expose 30 outils pour les flux de travail intégrés à l’IA. Ajoutez-le à la configuration de votre client MCP :

**Claude Code (`.claude.json` à l’échelle du projet) :**
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

**Claude Desktop (`claude_desktop_config.json`) :**
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

Le serveur lit `rk.config.json` à partir du répertoire de travail au démarrage. Assurez-vous que `rk.config.json` existe dans le répertoire où le serveur est exécuté.

### Outils MCP

**Connaissance et synchronisation :**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**Audit :**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**Vérification de la qualité de la construction** (lectures uniquement sur la base de données, sans actualisation du réseau) :
`health_feed` `health_doctor` `health_portfolio`

**Hygiène opérationnelle :**
`db_fsck` `repo_diff` `ops_runs`

**Cycle de vie et publication :**
`archive_repo` `delete_repo` `repo_versions`

**Tests internes et exercices d’audit :**
`suggest_dogfood` `audit_failing`

## Cadre d’audit

Le système d’audit couvre 19 domaines avec 80 contrôles :

| Domaine | Contrôles |
|--------|----------|
| inventaire | Métadonnées du dépôt, propriété, classification |
| qualité_du_code | Analyse statique du code, formatage, complexité |
| sécurité_sast | Analyse statique, injection, authentification |
| dépendances_sca | Analyse des vulnérabilités, actualité |
| licences | Conformité aux licences, compatibilité |
| secrets | Détection des secrets, rotation |
| config_iac | Hygiène de l’infrastructure en tant que code |
| conteneurs | Sécurité des images, analyse |
| exécution | Gestion des erreurs, résilience |
| performance | Profilage, optimisation |
| observabilité | Journalisation, suivi, métriques |
| tests | Couverture, types, intégration CI |
| cicd | Sécurité du pipeline, passerelles |
| déploiement | Processus de publication, restauration |
| sauvegarde_dr | Plans de sauvegarde, récupération |
| surveillance | Alertes, temps de fonctionnement |
| conformité_confidentialité | Gestion des données, RGPD |
| chaîne_d’approvisionnement | SBOM, provenance |
| intégrations | Contrats d’API, gestion des versions |

Chaque exécution d’audit produit des preuves structurées : résultats des contrôles (réussi/échec/avertissement/non applicable), éléments avec niveau de gravité et mesures correctives, et métriques agrégées. L’état est dérivé automatiquement : **bon**, **nécessite une attention** ou **critique**.

## Orchestration multi-agents : Les jeux Claude

repo-knowledge inclut des modèles pour des opérations parallèles multi-Claude sur de vastes portefeuilles. Les jeux Claude coordonnent plusieurs agents d’IA via une liste de tâches partagée :

1. **Passage d’audit** — Chaque agent sélectionne des dépôts dans la liste de tâches, exécute l’audit avec les 80 contrôles et soumet des résultats structurés.
2. **Passage d’enrichissement** — Les agents ajoutent une thèse, des notes sur l’architecture et des mappages de relations.
3. **Passage de correction** — Les agents corrigent les problèmes en utilisant un flux de travail en 8 étapes avec une évaluation.

Voir [`templates/claude-games/`](templates/claude-games/) pour le guide complet.

## Modèle de données

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

Toutes les données sont stockées dans une seule base de données SQLite avec une recherche en texte intégral FTS5 sur les documents, les notes et les descriptions des dépôts.

## Configuration

Créez `rk.config.json` dans le répertoire racine de votre espace de travail (ou exécutez `rk init`) :

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Tous les paramètres proviennent de `rk.config.json` (créé par `rk init`). Le serveur MCP lit également la configuration à partir du répertoire de travail.

## Licence

[MIT](LICENSE)

---

Créé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
