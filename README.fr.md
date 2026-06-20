<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Les registres de paquets et les API GitHub vous indiquent ce qu’est un dépôt. Ils ne vous disent pas à quoi il sert, comment il est lié à vos autres dépôts, quelle est sa thèse architecturale ou s’il a passé votre dernier audit de sécurité. Repo-knowledge comble cette lacune : une base de données locale unique qui contient la thèse, l’architecture, les preuves d’audit, les relations et une recherche en texte intégral sur tous ces éléments.

## Installation

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Prérequis :**
- Node.js 20+
- CLI `gh` (authentifiée) pour la synchronisation avec GitHub
- Outils de compilation C/C++ pour `better-sqlite3`, ou des binaires précompilés seront utilisés automatiquement sur les plateformes prises en charge.

## Modèle de sécurité

**Données concernées :** base de données SQLite locale, métadonnées de l’API GitHub via la CLI `gh` (noms des dépôts, descriptions, sujets, étoiles — aucun contenu du code source).

**Données NON concernées :** aucun code source n’est lu à partir de GitHub, aucune information d’identification n’est stockée et aucune donnée n’est envoyée vers des services externes.

**Autorisations :** nécessite la CLI `gh` authentifiée pour la synchronisation avec GitHub ; toutes les données restent locales.

**Pas de télémétrie, pas d’analyse, pas de communication vers le serveur.**

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
| `rk init` | Initialiser la configuration, la base de données et les contrôles d’audit. |
| `rk sync` | Synchronisation complète : organisations GitHub + dépôts locaux + index FTS. |
| `rk scan <path>` | Analyser un seul répertoire de dépôt local. |
| `rk show <slug>` | Afficher toutes les informations sur le dépôt avec la posture d’audit. |
| `rk list` | Lister tous les dépôts (filtrables par statut, langage, forme). |
| `rk find <query>` | Recherche en texte intégral dans tout le contenu indexé. |
| `rk related <slug>` | Afficher les dépôts liés à un dépôt donné. |
| `rk note <slug>` | Ajouter une note typée (thèse, architecture, avertissement, etc.) avec `--type` et `--content` (titre optionnel avec `--title`). |
| `rk relate <from> <type> <to>` | Enregistrer une relation entre les dépôts (note optionnelle avec `--note`). |
| `rk stats` | Afficher les statistiques de la base de données. |
| `rk reindex` | Reconstruire l’index FTS. |
| `rk sync-dogfood` | Synchroniser les preuves issues de dogfood-lab/testing-os dans les informations du dépôt. |
| `rk suggest-dogfood --repo <slug>` | Suggérer des problèmes connus liés à un dépôt ou une surface. |

> **`--json` partout où c’est pertinent.** `list`, `find`, `show`, `related` et `stats` — ainsi que les cinq lectures d’audit (`posture`, `findings`, `controls`, `unaudited`, `failing`) — acceptent tous l’option `--json` pour une sortie lisible par machine. JSON est le contrat de base entre les commandes principales : vous pouvez rediriger n’importe laquelle d’entre elles directement vers `jq`.

### Commandes du cycle de vie (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk delete <slug> [--yes]` | Supprimer en cascade un dépôt et toutes ses lignes enfants. |
| `rk archive <slug> [--reason <text>]` | Définir `lifecycle_status` sur `archived` (conserve les notes/problèmes). |
| `rk verify-local [--rig <id>] [--strict]` | Vérifier que `local_path` existe par rig ; met à jour `repo_local_paths`. |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Enregistrer le rig actuel. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Supprimer définitivement les dépôts archivés depuis plus de N jours (par défaut 30). |

### Commandes d’état de publication (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Tableau de bord multi-canal des versions publiées (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Comparer la version source de référence avec la dernière version du registre. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Définisseur manuel de liaison. |

### Commandes d’intégrité (v2.0.0 — fondées sur des recherches)

| Commande | Description |
|---------|-------------|
| `rk health` (par défaut = feed). | Modifier le flux : deltas depuis la dernière synchronisation, intersection KEV, interruptions de la série CI, dérive de l’action-pin. |
| `rk health doctor <slug>` | Analyse approfondie d’un seul dépôt (audit des dépendances, actions du workflow, signal CI, chaîne d’outils). |
| `rk health table [--json\ | --text]` | Tableau de bord de l’intégrité du portefeuille ; JSON est le contrat de base. |

### Commandes opérationnelles (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Vérification de l’intégrité de la base de données ; écrit une ligne d’audit dans `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Historique des modifications pour un dépôt. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Lister les entrées récentes de `db_health_runs` / `sync_runs`. |
| `rk owners list` | Lister les propriétaires GitHub configurés. |
| `rk owners add <owner>` | Ajouter des propriétaires à `rk.config.json`. |
| `rk owners remove <owner>` | Supprimer des propriétaires de `rk.config.json`. |

### Sauvegarde, restauration et pré-vérification (v2.1.0)

| Commande | Description |
|---------|-------------|
| `rk backup [--out <path>]` | Créer un instantané de la base de données vers une copie nettoyée (`VACUUM INTO`) dans `data/backups/` ou `--out`. |
| `rk restore <path> [--yes]` | Restaurer la base de données à partir d’un instantané — validation du schéma, échange atomique, confirmation requise (refuse un instantané avec un schéma plus récent). |
| `rk doctor [--json] [--strict]` | Pré-vérification de l’environnement : configuration, base de données, version du schéma, authentification `gh`, rig actuel, exécutions récentes de synchronisation/fsck. |
| `rk config [--json]` | Afficher la configuration effective résolue avec la provenance par champ. |
| `rk config validate [--json]` | Valider `rk.config.json` — quitte le programme si des propriétaires sont en attente, s’il y a des formes incorrectes ou des chemins non résolubles. |

### Commandes d’audit

| Commande | Description |
|---------|-------------|
| `rk audit seed-controls` | Initialiser/mettre à jour le catalogue canonique de 80 contrôles. |
| `rk audit import <dir>` | Importer les résultats d’audit à partir de fichiers au format JSON. |
| `rk audit posture [slug]` | Afficher la posture d’audit pour un dépôt ou l’ensemble du portefeuille. |
| `rk audit findings` | Lister les problèmes ouverts dans le portefeuille. |
| `rk audit controls` | Lister les contrôles canoniques par domaine. |
| `rk audit unaudited` | Lister les dépôts sans exécution d’audit. |
| `rk audit failing <domain>` | Lister les dépôts qui échouent à un domaine d’audit spécifique. |

### Commandes de jeux

| Commande | Description |
|---------|-------------|
| `rk games score <worklist>` | Attribuer un score à REMEDIATION-WORKLIST.md et afficher le classement. |

## Serveur MCP

Le serveur MCP expose 30 outils pour les flux de travail intégrés à l’IA. Ajoutez-le à la configuration de votre client MCP :

**Claude Code (fichier `.claude.json` spécifique au projet) :**
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

**Claude Desktop (`claude_desktop_config.json`) :**
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

Le serveur lit `rk.config.json` à partir du répertoire de travail au démarrage. Assurez-vous que `rk.config.json` existe dans le répertoire où le serveur s’exécute.

### Outils MCP

**Connaissance et synchronisation :**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**Audit :**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**État de santé des builds** (lectures uniquement à partir de la base de données, sans actualisation du réseau) :
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
| dépendances_sca | Analyse des vulnérabilités, actualisation |
| licences | Conformité aux licences, compatibilité |
| secrets | Détection et rotation des secrets |
| config_iac | Hygiène de l’infrastructure en tant que code |
| conteneurs | Sécurité des images, analyse |
| exécution | Gestion des erreurs, résilience |
| performance | Profilage, optimisation |
| observabilité | Journalisation, suivi, métriques |
| tests | Couverture, types, intégration CI |
| cicd | Sécurité du pipeline, étapes de validation |
| déploiement | Processus de publication, restauration |
| sauvegarde_dr | Plans de sauvegarde, récupération |
| surveillance | Alertes, temps de fonctionnement |
| conformité_confidentialité | Gestion des données, RGPD |
| chaîne_d’approvisionnement | SBOM, provenance |
| intégrations | Contrats d’API, gestion des versions |

Chaque exécution d’audit produit des preuves structurées : résultats des contrôles (réussi/échec/avertissement/non applicable), éléments avec niveau de gravité et mesures correctives, et métriques agrégées. L’état est dérivé automatiquement : **bon**, **nécessite une attention** ou **critique**.

## Orchestration multi-agents : les jeux Claude

repo-knowledge inclut des modèles pour des opérations parallèles multi-Claude sur de vastes portefeuilles. Les jeux Claude coordonnent plusieurs agents d’IA via une liste de tâches partagée :

1. **Étape d’audit** : chaque agent sélectionne des dépôts dans la liste de tâches, exécute l’audit avec les 80 contrôles et soumet des résultats structurés.
2. **Étape d’enrichissement** : les agents ajoutent une thèse, des notes sur l’architecture et des mappages de relations.
3. **Étape de correction** : les agents corrigent les problèmes en utilisant un flux de travail à 8 étapes avec évaluation.

Consultez [`templates/claude-games/`](templates/claude-games/) pour obtenir le guide complet.

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

Toutes les données sont stockées dans une seule base de données SQLite avec recherche en texte intégral FTS5 sur les documents, les notes et les descriptions des dépôts.

## Configuration

Créez `rk.config.json` dans le répertoire racine de votre espace de travail (ou exécutez `rk init`) :

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
