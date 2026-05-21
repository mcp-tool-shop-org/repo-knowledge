<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## Pourquoi

Les registres de paquets et les API GitHub vous indiquent ce qu'est un dépôt. Ils ne vous disent pas à quoi il sert, comment il se rapporte à vos autres dépôts, quelle est sa thèse architecturale, ou s'il a passé votre dernier audit de sécurité. repo-knowledge comble cette lacune : une base de données locale unique qui contient les thèses, l'architecture, les preuves d'audit, les relations, et permet une recherche en texte intégral sur l'ensemble de ces données.

## Installation

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Prérequis :**
- Node.js 20+
- CLI `gh` (authentifiée) pour la synchronisation avec GitHub
- Outils de compilation C/C++ pour `better-sqlite3`, ou des binaires précompilés seront utilisés automatiquement sur les plateformes prises en charge.

## Modèle de sécurité

**Données consultées :** base de données SQLite locale, métadonnées de l'API GitHub via la CLI `gh` (noms des dépôts, descriptions, sujets, étoiles - aucun contenu de code source).

**Données NON consultées :** aucun code source n'est lu depuis GitHub, aucune information d'identification n'est stockée, aucune donnée n'est envoyée à des services externes.

**Autorisations :** nécessite la CLI `gh` authentifiée pour la synchronisation avec GitHub ; toutes les données restent locales.

**Aucune télémétrie, aucune analyse, aucun envoi de données à des services externes.**

## Premiers pas

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
| `rk init` | Initialise la configuration, la base de données et les contrôles d'audit. |
| `rk sync` | Synchronisation complète : organisations GitHub + dépôts locaux + index de recherche en texte intégral. |
| `rk scan <path>` | Analyse d'un seul répertoire de dépôt local. |
| `rk show <slug>` | Affiche les informations complètes du dépôt avec l'état de l'audit. |
| `rk list` | Liste tous les dépôts (filtrables par statut, langage, structure). |
| `rk find <query>` | Recherche en texte intégral sur tout le contenu indexé. |
| `rk related <slug>` | Affiche les dépôts liés à un dépôt donné. |
| `rk note <slug>` | Ajoute une note de type (thèse, architecture, avertissement, etc.) avec `--type` et `--content` (optionnel `--title`). |
| `rk relate <from> <type> <to>` | Enregistre une relation entre des dépôts (optionnel `--note`). |
| `rk stats` | Affiche les statistiques de la base de données. |
| `rk reindex` | Reconstruit l'index de recherche en texte intégral. |
| `rk sync-dogfood` | Importe les données de test de "dogfood" depuis dogfood-lab/testing-os dans les informations du dépôt. |
| `rk suggest-dogfood --repo <slug>` | Suggère les problèmes de "dogfood" connus pour un dépôt ou un composant. |

### Commandes du cycle de vie (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk delete <slug> [--yes]` | Supprime en cascade un dépôt et toutes les lignes enfants. |
| `rk archive <slug> [--reason <text>]` | Modifie le statut `lifecycle_status` à `archived` (conserve les notes/constatations). |
| `rk verify-local [--rig <id>] [--strict]` | Vérifie que le chemin `local_path` existe pour chaque instance ; met à jour `repo_local_paths`. |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Enregistre l'instance actuelle. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Supprime définitivement les dépôts archivés depuis plus de N jours (par défaut 30). |

### Commandes de publication (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Tableau de bord de publication multi-plateformes (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Compare la version de référence avec la dernière version du registre. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Définition manuelle de la version. |

### Commandes de vérification (v2.0.0 - basées sur la recherche)

| Commande | Description |
|---------|-------------|
| `rk health` (par défaut = feed) | Change le flux d'informations : différences depuis la dernière synchronisation, intersection KEV, interruptions de l'intégration continue, dérive des actions épinglées. |
| `rk health doctor <slug>` | Analyse approfondie d'un seul dépôt (audit des dépendances, actions du flux de travail, signaux d'intégration continue, chaîne d'outils). |
| `rk health table [--json\ | --text]` | Tableau de l'état de la plateforme ; JSON est le contrat de référence. |

### Commandes opérationnelles (v2.0.0)

| Commande | Description |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Vérification de l'intégrité de la base de données ; écrit une ligne d'audit dans `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Historique des modifications pour un dépôt. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Liste les entrées récentes de `db_health_runs` / `sync_runs`. |
| `rk owners list` | Liste les propriétaires de GitHub configurés. |
| `rk owners add <owner>` | Ajoute des propriétaires à `rk.config.json`. |
| `rk owners remove <owner>` | Supprime des propriétaires de `rk.config.json`. |

### Commandes d'audit

| Commande | Description |
|---------|-------------|
| `rk audit seed-controls` | Initialise/met à jour le catalogue canonique de 80 contrôles. |
| `rk audit import <dir>` | Importe les résultats d'audit depuis les fichiers de contrat JSON. |
| `rk audit posture [slug]` | Afficher l'état de conformité pour un dépôt ou l'ensemble du portefeuille. |
| `rk audit findings` | Lister les problèmes détectés dans l'ensemble du portefeuille. |
| `rk audit controls` | Lister les contrôles standard par domaine. |
| `rk audit unaudited` | Lister les dépôts sans exécution d'audit. |
| `rk audit failing <domain>` | Lister les dépôts qui ne passent pas un domaine d'audit spécifique. |

### Commandes des jeux Claude

| Commande | Description |
|---------|-------------|
| `rk games score <worklist>` | Attribuer un score à un fichier REMEDIATION-WORKLIST.md et afficher le classement. |

## Serveur MCP

Le serveur MCP expose 19 outils pour les flux de travail intégrant l'IA. Ajoutez-le à la configuration de votre client MCP :

**Claude Code (fichier `.claude.json` spécifique au projet) :**
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

**Bureau Claude (`claude_desktop_config.json`) :**
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

Le serveur lit le fichier `rk.config.json` depuis le répertoire de travail au démarrage. Assurez-vous que le fichier `rk.config.json` existe dans le répertoire où le serveur est exécuté.

### Outils MCP

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Cadre d'audit

Le système d'audit couvre 19 domaines avec 80 contrôles :

| Domaine | Contrôles |
|--------|----------|
| inventaire | Métadonnées du dépôt, propriété, classification. |
| qualité_du_code | Analyse statique, formatage, complexité. |
| sécurité_sast | Analyse statique, injection, authentification. |
| dépendances_sca | Analyse des vulnérabilités, versions. |
| licences | Conformité et compatibilité des licences. |
| secrets | Détection et rotation des secrets. |
| config_iac | Hygiène de l'infrastructure en tant que code. |
| conteneurs | Sécurité et analyse des images. |
| exécution | Gestion des erreurs, résilience. |
| performance | Profilage, optimisation. |
| observabilité | Journalisation, traçage, métriques. |
| tests | Couverture, types, intégration CI. |
| cicd | Sécurité des pipelines, passerelles. |
| déploiement | Processus de publication, restauration. |
| sauvegarde_dr | Plans de sauvegarde et de récupération. |
| surveillance | Alertes, disponibilité. |
| conformité_confidentialité | Gestion des données, RGPD. |
| chaîne_d'approvisionnement | SBOM, provenance. |
| intégrations | Contrats API, versionnement. |

Chaque exécution d'audit produit des preuves structurées : résultats des contrôles (réussi/échoué/avertissement/non applicable), problèmes avec leur gravité et leur correction, ainsi que des métriques agrégées. L'état de conformité est dérivé automatiquement : **bon état**, **nécessite une attention**, ou **critique**.

## Orchestration multi-agents : Les jeux Claude

repo-knowledge inclut des modèles pour les opérations parallèles multi-Claude sur de grands portefeuilles. Les jeux Claude coordonnent plusieurs agents d'IA via une liste de tâches partagée :

1. **Audit Pass** — Chaque agent sélectionne des dépôts de la liste de tâches, exécute l'audit des 80 contrôles et soumet les résultats structurés.
2. **Enrichment Pass** — Les agents ajoutent des thèses, des notes d'architecture et des mappages de relations.
3. **Remediation Pass** — Les agents corrigent les problèmes détectés en utilisant un flux de travail en 8 étapes avec attribution de score.

Consultez [`templates/claude-games/`](templates/claude-games/) pour le guide complet.

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

Toutes les données sont stockées dans une seule base de données SQLite avec une recherche en texte intégral FTS sur les documents, les notes et les descriptions des dépôts.

## Configuration

Créez le fichier `rk.config.json` à la racine de votre espace de travail (ou exécutez la commande `rk init`) :

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Tous les paramètres proviennent du fichier `rk.config.json` (créé par `rk init`). Le serveur MCP lit également la configuration dans le répertoire de travail.

## Licence

[MIT](LICENSE)

---

Développé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
