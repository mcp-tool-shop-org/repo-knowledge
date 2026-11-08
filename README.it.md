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

## Perché

I registri dei pacchetti e le API GitHub ti indicano cosa _è_ un repository. Non ti dicono a cosa _serve_, come si relaziona con gli altri repository, qual è la sua architettura o se ha superato l'ultima verifica di sicurezza. Repo-knowledge colma questa lacuna: un singolo database locale che contiene la tesi, l'architettura, le prove della verifica, le relazioni e la ricerca full-text su tutti questi elementi.

## Installazione

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requirements:**
- Node.js 20+ — this package's `engines.node` is `>=20`. The locked `better-sqlite3` addon's own `engines` list is vendor majors, not a prebuild-coverage claim.
- `gh` CLI (authenticated) for GitHub sync
- C/C++ build tools for `better-sqlite3` when a prebuild misses. The addon install script is dual-path: `prebuild-install || node-gyp rebuild --release`. A matching prebuild is used when one is available; otherwise `node-gyp` compiles from source. That is not universal platform coverage. If install fails, see the [better-sqlite3 troubleshooting guide](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).

## Modello di sicurezza

**Dati interessati:** database locale SQLite, metadati dell'API GitHub tramite CLI `gh` (nomi, descrizioni, argomenti, stelle dei repository; nessun contenuto del codice sorgente).

**Dati NON interessati:** nessun codice sorgente viene letto da GitHub, nessuna credenziale viene archiviata e nessun dato viene inviato a servizi esterni.

**Autorizzazioni:** richiede l'autenticazione tramite CLI `gh` per la sincronizzazione GitHub; tutti i dati rimangono locali.

**Nessun telemetria, nessuna analisi, nessun invio di dati.**

## Avvio rapido

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
| `rk init` | Inizializza la configurazione, il database e i controlli di verifica |
| `rk sync` | Sincronizzazione completa: GitHub organizzazioni + repository locali + indice FTS |
| `rk scan <path>` | Analizza una singola directory di repository locale |
| `rk show <slug>` | Mostra la conoscenza completa del repository con la postura di verifica |
| `rk list` | Elenca tutti i repository (filtrabili per stato, linguaggio, forma) |
| `rk find <query>` | Ricerca full-text su tutti i contenuti indicizzati |
| `rk related <slug>` | Mostra i repository correlati a un determinato repository |
| `rk note <slug>` | Aggiungi una nota tipizzata (tesi, architettura, avviso, ecc.) con `--type` e `--content` (opzionale `--title`); `--delete` rimuove una nota tramite `--type` + `--title` |
| `rk relate <from> <type> <to>` | Registra una relazione tra i repository (opzionale `--note`) |
| `rk stats` | Mostra le statistiche del database |
| `rk reindex` | Ricostruisci l'indice FTS |
| `rk sync-dogfood` | Sincronizza le prove di dogfooding da dogfood-lab/testing-os nei fatti del repository |
| `rk suggest-dogfood --repo <slug>` | Suggerisci risultati di dogfooding noti per un repository o una superficie |

> **`--json` ovunque sia importante.** `list`, `find`, `show`, `related` e `stats`, oltre alle cinque letture di verifica (`posture`, `findings`, `controls`, `unaudited`, `failing`), accettano tutte `--json` per un output leggibile dalla macchina. JSON è il contratto fondamentale per tutti i comandi principali: puoi inviare l'output di qualsiasi comando direttamente a `jq`.

### Comandi del ciclo di vita (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk delete <slug> [--yes]` | Elimina a cascata un repository e tutte le righe figlio |
| `rk archive <slug> [--reason <text>]` | Inverti `lifecycle_status` in `archived` (preserva note/risultati) |
| `rk verify-local [--rig <id>] [--strict]` | Verifica che `local_path` esista per ogni rig; aggiorna `repo_local_paths` |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registra il rig corrente |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Elimina definitivamente i repository archiviati da più di N giorni (predefinito 30) |

### Comandi dello stato di pubblicazione (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Dashboard della versione pubblicata tra canali (npm/pypi/github_release) |
| `rk drift <slug> [--strict]` | Confronta la versione di riferimento con l'ultima versione del registro |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Impostazione manuale del binding |

### Comandi di integrità (v2.0.0 — basati sulla ricerca)

| Comando | Descrizione |
|---------|-------------|
| `rk health` (predefinito = feed) | Modifica del feed: differenze rispetto all'ultima sincronizzazione, intersezione KEV, interruzioni della serie CI, deriva dell'azione-pin |
| `rk health doctor <slug>` | Analisi approfondita di un singolo repository (verifica delle dipendenze, azioni del flusso di lavoro, segnale CI, toolchain) |
| `rk health table [--json\ | --text]` | Tabella di integrità del portfolio; JSON è il contratto fondamentale |

### Comandi operativi (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Verifica dell'integrità del database; scrive una riga di verifica in `db_health_runs` |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Cronologia delle modifiche per un repository |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Elenca le voci `db_health_runs` / `sync_runs` recenti |
| `rk owners list` | Elenca i proprietari configurati GitHub |
| `rk owners add <owner>` | Aggiungi ai proprietari `rk.config.json` |
| `rk owners remove <owner>` | Rimuovi dai proprietari `rk.config.json` |

### Backup, ripristino e preflight (v2.1.0)

| Comando | Descrizione |
|---------|-------------|
| `rk backup [--out <path>]` | Crea uno snapshot del database di conoscenza in una copia svuotata (`VACUUM INTO`) in `data/backups/` o `--out` |
| `rk restore <path> [--yes]` | Ripristina il database da uno snapshot: convalida dello schema, scambio atomico, conferma obbligatoria (rifiuta un backup con uno schema più recente) |
| `rk doctor [--json] [--strict]` | Preflight dell'ambiente: configurazione, database, versione dello schema, autenticazione `gh`, rig corrente, esecuzioni di sincronizzazione/fsck recenti |
| `rk config [--json]` | Mostra la configurazione effettiva risolta con la provenienza per ogni campo |
| `rk config validate [--json]` | Valida `rk.config.json`: esce con un codice di errore se sono presenti proprietari segnaposto, forme non valide o percorsi non risolvibili |

### Classificazione (v2.1.1)

| Comando | Descrizione |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | Imposta i campi del ciclo di vita curati: `status` (`active`/`paused`/`archived`/`unknown`), `stage` in formato libero (ad esempio, `shipped`, `Phase 1`) e `category` (`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`). Questi non vengono popolati da `sync` o `scan`; passa `""` per cancellare `stage`/`category` |

### Comandi di verifica

| Comando | Descrizione |
|---------|-------------|
| `rk audit seed-controls` | Inizializza/aggiorna il catalogo canonico di 80 controlli |
| `rk audit import <dir>` | Importa i risultati della verifica da file con contratto JSON |
| `rk audit posture [slug]` | Mostra la postura di verifica per un repository o per l'intero portfolio |
| `rk audit findings` | Elenca i risultati aperti nell'intero portfolio |
| `rk audit controls` | Elenca i controlli canonici per dominio |
| `rk audit unaudited` | Elenca i repository che non hanno eseguiti controlli di verifica |
| `rk audit failing <domain>` | Elenca i repository che non superano un determinato dominio di verifica |

### Comandi dei giochi

| Comando | Descrizione |
|---------|-------------|
| `rk games score <worklist>` | Valuta un file REMEDIATION-WORKLIST.md e mostra la classifica |

## Server MCP

Il server MCP espone 30 strumenti per flussi di lavoro integrati con l'IA. Aggiungilo alla configurazione del client MCP:

**Claude Code (ambito del progetto `.claude.json`):**
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

Il server legge `rk.config.json` dalla directory di lavoro all'avvio. Assicurati che `rk.config.json` esista nella directory in cui viene eseguito il server.

### Strumenti MCP

**Conoscenza e sincronizzazione:**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**Audit:**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**Verifica dello stato di build** (letture solo dal database, senza aggiornamenti di rete):
`health_feed` `health_doctor` `health_portfolio`

**Igiene operativa:**
`db_fsck` `repo_diff` `ops_runs`

**Ciclo di vita e pubblicazione:**
`archive_repo` `delete_repo` `repo_versions`

**Test interni e simulazione di audit:**
`suggest_dogfood` `audit_failing`

## Framework di audit

Il sistema di audit copre 19 aree con 80 controlli:

| Area | Controlli |
|--------|----------|
| inventario | Metadati del repository, proprietà, classificazione |
| qualità_del_codice | Linting, formattazione, complessità |
| sicurezza_sast | Analisi statica, injection, autenticazione |
| dipendenze_sca | Scansione delle vulnerabilità, aggiornamento |
| licenze | Conformità alle licenze, compatibilità |
| segreti | Rilevamento dei segreti, rotazione |
| config_iac | Igiene dell'infrastruttura come codice |
| container | Sicurezza delle immagini, scansione |
| runtime | Gestione degli errori, resilienza |
| performance | Profiling, ottimizzazione |
| osservabilità | Logging, tracciamento, metriche |
| testing | Copertura, tipi, integrazione CI |
| cicd | Sicurezza della pipeline, gate |
| deployment | Processo di rilascio, rollback |
| backup_dr | Piani di backup, ripristino |
| monitoring | Avvisi, uptime |
| compliance_privacy | Gestione dei dati, GDPR |
| supply_chain | SBOM, provenienza |
| integrazioni | Contratti API, versionamento |

Ogni esecuzione di audit produce prove strutturate: risultati dei controlli (superato/fallito/avviso/non applicabile), risultati con gravità e azioni correttive e metriche aggregate. Lo stato viene derivato automaticamente: **sano**, **richiede attenzione** o **critico**.

## Orchestrazione multi-agente: The Claude Games

repo-knowledge include modelli per operazioni multi-Claude parallele su ampi portafogli. The Claude Games coordinano più agenti AI tramite un elenco di lavoro condiviso:

1. **Passaggio di audit:** ogni agente seleziona i repository dall'elenco di lavoro, esegue l'audit con 80 controlli e invia i risultati strutturati.
2. **Passaggio di arricchimento:** gli agenti aggiungono tesi, note sull'architettura e mappature delle relazioni.
3. **Passaggio di correzione:** gli agenti correggono i risultati utilizzando un flusso di lavoro a 8 passaggi con punteggio.

Consulta [`templates/claude-games/`](templates/claude-games/) per il playbook completo.

## Modello dati

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

Tutti i dati risiedono in un singolo database SQLite con ricerca FTS5 full-text su documenti, note e descrizioni dei repository.

## Configurazione

Crea `rk.config.json` nella directory principale del tuo spazio di lavoro (o esegui `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Tutte le impostazioni provengono da `rk.config.json` (create da `rk init`). Il server MCP legge anche la configurazione dalla directory di lavoro.

## Licenza

[MIT](LICENSE)

---

Realizzato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
