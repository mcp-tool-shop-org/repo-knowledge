<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## Perché

I registri dei pacchetti e le API di GitHub vi dicono cosa _è_ un repository. Non vi dicono a cosa _serve_, come si relaziona agli altri repository, qual è la sua architettura, o se ha superato l'ultima verifica di sicurezza. `repo-knowledge` colma questa lacuna: un singolo database locale che contiene tesi, architettura, evidenze di audit, relazioni e una ricerca full-text su tutti questi elementi.

## Installazione

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisiti:**
- Node.js 20+
- CLI `gh` (autenticata) per la sincronizzazione con GitHub
- Strumenti di compilazione C/C++ per `better-sqlite3`, oppure verranno utilizzati automaticamente file binari precompilati sulle piattaforme supportate.

## Modello di sicurezza

**Dati accessibili:** database SQLite locale, metadati dell'API di GitHub tramite la CLI `gh` (nomi dei repository, descrizioni, argomenti, stelle – nessun contenuto del codice sorgente).

**Dati NON accessibili:** nessun codice sorgente viene letto da GitHub, nessuna credenziale viene memorizzata, nessun dato viene inviato a servizi esterni.

**Permessi:** richiede la CLI `gh` autenticata per la sincronizzazione con GitHub; tutti i dati rimangono locali.

**Nessuna telemetria, nessuna analisi, nessuna trasmissione di dati.**

## Guida rapida

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

## Riferimento CLI

### Comandi principali

| Comando | Descrizione |
|---------|-------------|
| `rk init` | Inizializza la configurazione, il database e i controlli di audit. |
| `rk sync` | Sincronizzazione completa: organizzazioni GitHub + repository locali + indice di ricerca full-text. |
| `rk scan <path>` | Scansiona una singola directory di repository locale. |
| `rk show <slug>` | Mostra tutte le informazioni sul repository con lo stato dell'audit. |
| `rk list` | Elenca tutti i repository (filtrabili per stato, linguaggio, struttura). |
| `rk find <query>` | Ricerca full-text su tutti i contenuti indicizzati. |
| `rk related <slug>` | Mostra i repository correlati a un determinato repository. |
| `rk note <slug>` | Aggiungi una nota di tipo (tesi, architettura, avviso, ecc.) con `--type` e `--content` (opzionale `--title`). |
| `rk relate <from> <type> <to>` | Registra una relazione tra repository (opzionale `--note`). |
| `rk stats` | Mostra le statistiche del database. |
| `rk reindex` | Ricostruisci l'indice di ricerca full-text. |
| `rk sync-dogfood` | Importa le evidenze di test da `dogfood-lab/testing-os` nei fatti del repository. |
| `rk suggest-dogfood --repo <slug>` | Suggerisci i risultati di test noti per un repository o un componente. |

### Comandi del ciclo di vita (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk delete <slug> [--yes]` | Elimina in cascata un repository e tutte le righe figlie. |
| `rk archive <slug> [--reason <text>]` | Imposta lo stato `lifecycle_status` su `archived` (mantiene note/risultati). |
| `rk verify-local [--rig <id>] [--strict]` | Verifica che il percorso `local_path` esista per ogni riga; aggiorna `repo_local_paths`. |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registra il repository corrente. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Elimina definitivamente i repository archiviati da più di N giorni (predefinito 30). |

### Comandi di pubblicazione (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Dashboard di pubblicazione multi-canale (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Confronta la versione di riferimento con l'ultima versione del registro. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Impostazione manuale del binding. |

### Comandi di controllo dello stato (v2.0.0 – basati sulla ricerca)

| Comando | Descrizione |
|---------|-------------|
| `rk health` (predefinito = feed) | Modifica il feed: differenze rispetto all'ultima sincronizzazione, intersezione KEV, interruzioni della CI, deriva delle azioni. |
| `rk health doctor <slug>` | Analisi approfondita di un singolo repository (audit delle dipendenze, azioni del flusso di lavoro, segnali della CI, toolchain). |
| `rk health table [--json\ | --text]` | Tabella dello stato del portfolio; JSON è il contratto di riferimento. |

### Comandi operativi (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Controllo dell'integrità del database; scrive una riga di audit in `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Cronologia delle modifiche per un repository. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Elenca le voci recenti di `db_health_runs` / `sync_runs`. |
| `rk owners list` | Elenca i proprietari di GitHub configurati. |
| `rk owners add <owner>` | Aggiungi proprietari a `rk.config.json`. |
| `rk owners remove <owner>` | Rimuovi proprietari da `rk.config.json`. |

### Comandi di audit

| Comando | Descrizione |
|---------|-------------|
| `rk audit seed-controls` | Seed/aggiorna il catalogo canonico di 80 controlli. |
| `rk audit import <dir>` | Importa i risultati dell'audit da file di contratto JSON. |
| `rk audit posture [slug]` | Mostra lo stato di conformità per un singolo repository o per l'intero portfolio. |
| `rk audit findings` | Elenca i problemi riscontrati in tutto il portfolio. |
| `rk audit controls` | Elenca i controlli standard per dominio. |
| `rk audit unaudited` | Elenca i repository senza esecuzioni di audit. |
| `rk audit failing <domain>` | Elenca i repository che non superano un dominio di audit specifico. |

### Comandi per i giochi (Games)

| Comando | Descrizione |
|---------|-------------|
| `rk games score <worklist>` | Valuta un file REMEDIATION-WORKLIST.md e mostra la classifica. |

## Server MCP

Il server MCP espone 19 strumenti per flussi di lavoro integrati con l'intelligenza artificiale. Aggiungilo alla configurazione del tuo client MCP:

**Claude Code (file `.claude.json` specifico del progetto):**
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

Il server legge `rk.config.json` dalla directory di lavoro all'avvio. Assicurati che `rk.config.json` esista nella directory in cui è in esecuzione il server.

### Strumenti MCP

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Framework di Audit

Il sistema di audit copre 19 domini con 80 controlli:

| Dominio | Controlli |
|--------|----------|
| inventario | Metadati del repository, proprietà, classificazione. |
| qualità_del_codice | Linting, formattazione, complessità. |
| sicurezza_sast | Analisi statica, injection, autenticazione. |
| dipendenze_sca | Scansione delle vulnerabilità, versione. |
| licenze | Conformità e compatibilità delle licenze. |
| segreti | Rilevamento e rotazione dei segreti. |
| config_iac | Igiene dell'infrastruttura come codice. |
| container | Sicurezza delle immagini, scansione. |
| runtime | Gestione degli errori, resilienza. |
| prestazioni | Profiling, ottimizzazione. |
| osservabilità | Logging, tracing, metriche. |
| test | Copertura, tipi, integrazione CI. |
| cicd | Sicurezza della pipeline, controlli. |
| distribuzione | Processo di rilascio, rollback. |
| backup_dr | Piani di backup, ripristino. |
| monitoraggio | Avvisi, uptime. |
| conformità_privacy | Gestione dei dati, GDPR. |
| supply_chain | SBOM, provenienza. |
| integrazioni | Contratti API, versioning. |

Ogni esecuzione di audit produce evidenze strutturate: risultati dei controlli (superato/non superato/avvertimento/non applicabile), problemi con gravità e correzioni, e metriche aggregate. Lo stato di conformità viene derivato automaticamente: **sano**, **richiede attenzione** o **critico**.

## Orchestrazione Multi-Agente: I Giochi di Claude

repo-knowledge include modelli per operazioni parallele multi-Claude su ampi portfolio. I Giochi di Claude coordinano più agenti di intelligenza artificiale attraverso una lista di lavoro condivisa:

1. **Audit Pass** — Ogni agente seleziona i repository dalla lista di lavoro, esegue l'audit con 80 controlli e invia i risultati strutturati.
2. **Enrichment Pass** — Gli agenti aggiungono tesi, note sull'architettura e mappature delle relazioni.
3. **Remediation Pass** — Gli agenti correggono i problemi utilizzando un flusso di lavoro di 8 passaggi valutato.

Consulta [`templates/claude-games/`](templates/claude-games/) per il playbook completo.

## Modello Dati

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

Tutti i dati risiedono in un singolo database SQLite con ricerca full-text FTS5 su documenti, note e descrizioni dei repository.

## Configurazione

Crea il file `rk.config.json` nella directory principale del tuo spazio di lavoro (oppure esegui il comando `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Tutte le impostazioni provengono dal file `rk.config.json` (creato con `rk init`). Il server MCP legge anche la configurazione dalla directory di lavoro.

## Licenza

[MIT](LICENSE)

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
