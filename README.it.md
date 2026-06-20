<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

I registri dei pacchetti e le API di GitHub ti indicano cosa _è_ un repository. Non ti dicono a cosa serve, come si relaziona con gli altri tuoi repository, qual è la sua tesi architettonica o se ha superato l'ultima verifica della sicurezza. Repo-knowledge colma questa lacuna: un singolo database locale che contiene la tesi, l'architettura, le prove delle verifiche, le relazioni e una ricerca completa su tutti questi elementi.

## Installazione

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisiti:**
- Node.js 20+
- CLI `gh` (autenticata) per la sincronizzazione con GitHub
- Strumenti di compilazione C/C++ per `better-sqlite3`, oppure verranno utilizzati automaticamente i binari precompilati sulle piattaforme supportate.

## Modello di sicurezza

**Dati interessati:** database SQLite locale, metadati dell'API GitHub tramite la CLI `gh` (nomi dei repository, descrizioni, argomenti, stelle; nessun contenuto del codice sorgente).

**Dati NON interessati:** non viene letto alcun codice sorgente da GitHub, non vengono memorizzate credenziali e non vengono inviati dati a servizi esterni.

**Autorizzazioni:** richiede la CLI `gh` autenticata per la sincronizzazione con GitHub; tutti i dati rimangono locali.

**Nessun telemetria, nessuna analisi, nessun "chiamata a casa".**

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
| `rk init` | Inizializza la configurazione, il database e i controlli di verifica iniziali. |
| `rk sync` | Sincronizzazione completa: organizzazioni GitHub + repository locali + indice FTS (Full-Text Search). |
| `rk scan <path>` | Scansiona una singola directory del repository locale. |
| `rk show <slug>` | Mostra la conoscenza completa del repository con lo stato della verifica. |
| `rk list` | Elenca tutti i repository (filtrabili per stato, linguaggio, tipo). |
| `rk find <query>` | Ricerca full-text su tutti i contenuti indicizzati. |
| `rk related <slug>` | Mostra i repository correlati a un determinato repository. |
| `rk note <slug>` | Aggiunge una nota tipizzata (tesi, architettura, avviso, ecc.) con `--type` e `--content` (opzionale: `--title`). |
| `rk relate <from> <type> <to>` | Registra una relazione tra i repository (opzionale: `--note`). |
| `rk stats` | Mostra le statistiche del database. |
| `rk reindex` | Ricostruisce l'indice FTS. |
| `rk sync-dogfood` | Sincronizza le prove di "dogfooding" da dogfood-lab/testing-os nei fatti del repository. |
| `rk suggest-dogfood --repo <slug>` | Suggerisce risultati noti di "dogfooding" per un repository o una superficie. |

> **`--json` ovunque sia rilevante.** `list`, `find`, `show`, `related` e `stats`, oltre alle cinque letture di verifica (`posture`, `findings`, `controls`, `unaudited`, `failing`) accettano tutte l'opzione `--json` per un output leggibile dalla macchina. JSON è il contratto fondamentale tra i comandi principali: puoi collegare direttamente uno qualsiasi di essi a `jq`.

### Comandi del ciclo di vita (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk delete <slug> [--yes]` | Elimina in cascata un repository e tutte le righe figlio. |
| `rk archive <slug> [--reason <text>]` | Imposta lo stato del ciclo di vita su `archived` (preserva note/risultati). |
| `rk verify-local [--rig <id>] [--strict]` | Verifica che il percorso locale esista per ogni "rig"; aggiorna i percorsi locali del repository (`repo_local_paths`). |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registra l'ambiente corrente. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Elimina in modo definitivo i repository archiviati da più di N giorni (valore predefinito: 30). |

### Comandi dello stato di pubblicazione (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Dashboard della versione pubblicata su tutti i canali (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Confronta la versione "fonte della verità" con l'ultima versione del registro. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Impostazione manuale del collegamento. |

### Comandi di integrità (v2.0.0, basati sulla ricerca)

| Comando | Descrizione |
|---------|-------------|
| `rk health` (valore predefinito: feed). | Modifica il feed: delta dall'ultima sincronizzazione, intersezione KEV, interruzioni della serie CI, deriva dei pin di azione. |
| `rk health doctor <slug>` | Analisi approfondita di un singolo repository (verifica delle dipendenze, azioni del flusso di lavoro, segnale CI, toolchain). |
| `rk health table [--json\ | --text]` | Tabella dello stato del portfolio; JSON è il contratto fondamentale. |

### Comandi operativi (v2.0.0)

| Comando | Descrizione |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Verifica dell'integrità del database; scrive una riga di verifica in `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Cronologia delle modifiche per un repository. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Elenca le voci recenti di `db_health_runs` / `sync_runs`. |
| `rk owners list` | Elenca i proprietari configurati di GitHub. |
| `rk owners add <owner>` | Aggiunge i proprietari a `rk.config.json`. |
| `rk owners remove <owner>` | Rimuove i proprietari da `rk.config.json`. |

### Backup, ripristino e preflight (v2.1.0)

| Comando | Descrizione |
|---------|-------------|
| `rk backup [--out <path>]` | Crea uno snapshot del database della conoscenza in una copia "vacuumed" (`VACUUM INTO`) nella directory `data/backups/` o `--out`. |
| `rk restore <path> [--yes]` | Ripristina il database da uno snapshot: verifica lo schema, scambio atomico, conferma (rifiuta un backup con uno schema più recente). |
| `rk doctor [--json] [--strict]` | Preflight dell'ambiente: configurazione, database, versione dello schema, autenticazione `gh`, ambiente corrente, esecuzioni recenti di sincronizzazione/fsck. |
| `rk config [--json]` | Mostra la configurazione effettiva risolta con la provenienza per ogni campo. |
| `rk config validate [--json]` | Valida `rk.config.json`: termina con un codice diverso da zero in caso di proprietari segnaposto, tipi non validi o percorsi irrisolvibili. |

### Comandi di verifica

| Comando | Descrizione |
|---------|-------------|
| `rk audit seed-controls` | Inizializza/aggiorna il catalogo canonico di 80 controlli. |
| `rk audit import <dir>` | Importa i risultati della verifica da file con contratto JSON. |
| `rk audit posture [slug]` | Mostra lo stato della verifica per un repository o per l'intero portfolio. |
| `rk audit findings` | Elenca i risultati aperti nell'intero portfolio. |
| `rk audit controls` | Elenca i controlli canonici per dominio. |
| `rk audit unaudited` | Elenca i repository che non hanno eseguiti controlli di verifica. |
| `rk audit failing <domain>` | Elenca i repository in cui un determinato dominio di verifica ha prodotto risultati negativi. |

### Comandi dei giochi

| Comando | Descrizione |
|---------|-------------|
| `rk games score <worklist>` | Valuta un file REMEDIATION-WORKLIST.md e mostra la classifica. |

## Server MCP

Il server MCP espone 30 strumenti per flussi di lavoro integrati con l'IA. Aggiungilo alla configurazione del tuo client MCP:

**Claude Code (configurazione specifica del progetto `.claude.json`):**
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

**Stato di salute della build** (letture solo dal database, senza aggiornamenti dalla rete):
`health_feed` `health_doctor` `health_portfolio`

**Igiene operativa:**
`db_fsck` `repo_diff` `ops_runs`

**Ciclo di vita e pubblicazione:**
`archive_repo` `delete_repo` `repo_versions`

**Dogfood e simulazione di audit:**
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

Ogni esecuzione di audit produce evidenze strutturate: risultati dei controlli (superato/fallito/avviso/non applicabile), risultati con gravità e azioni correttive e metriche aggregate. Lo stato viene derivato automaticamente: **sano**, **richiede attenzione** o **critico**.

## Orchestrazione multi-agente: The Claude Games

repo-knowledge include modelli per operazioni parallele multi-Claude su ampi portafogli. The Claude Games coordinano più agenti AI tramite un elenco di lavoro condiviso:

1. **Passaggio di audit:** ogni agente seleziona i repository dall'elenco di lavoro, esegue l'audit con 80 controlli e invia i risultati strutturati.
2. **Passaggio di arricchimento:** gli agenti aggiungono tesi, note sull'architettura e mappature delle relazioni.
3. **Passaggio di correzione:** gli agenti risolvono i problemi utilizzando un flusso di lavoro a 8 passaggi con punteggio.

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

Tutti i dati sono archiviati in un singolo database SQLite con ricerca full-text FTS5 su documenti, note e descrizioni dei repository.

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

Tutte le impostazioni provengono da `rk.config.json` (creato da `rk init`). Il server MCP legge anche la configurazione dalla directory di lavoro.

## Licenza

[MIT](LICENSE)

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
