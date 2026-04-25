<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## Perché

I registri dei pacchetti e le API di GitHub vi dicono cosa *è* un repository. Non vi dicono a cosa *serve*, come si relaziona agli altri repository, qual è la sua architettura, o se ha superato l'ultima verifica di sicurezza. repo-knowledge colma questa lacuna: un singolo database locale che contiene tesi, architettura, evidenze di verifica, relazioni e una ricerca full-text su tutti questi elementi.

## Installazione

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisiti:**
- Node.js 20+
- CLI `gh` (autenticata) per la sincronizzazione con GitHub
- Strumenti di compilazione C/C++ per `better-sqlite3`, oppure verranno utilizzati automaticamente file binari precompilati sulle piattaforme supportate.

## Modello di sicurezza

**Dati accessibili:** database SQLite locale, metadati dell'API di GitHub tramite la CLI `gh` (nomi dei repository, descrizioni, argomenti, stelle - nessun contenuto del codice sorgente).

**Dati NON accessibili:** nessun codice sorgente viene letto da GitHub, nessuna credenziale viene memorizzata, nessun dato viene inviato a servizi esterni.

**Permessi:** richiede la CLI `gh` autenticata per la sincronizzazione con GitHub; tutti i dati rimangono locali.

**Nessuna telemetria, nessuna analisi, nessuna trasmissione di dati.**

## Guida rapida

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

## Riferimento CLI

### Comandi principali

| Comando | Descrizione |
|---------|-------------|
| `rk init` | Inizializza la configurazione, il database e i controlli di verifica. |
| `rk sync` | Sincronizzazione completa: organizzazioni GitHub + repository locali + indice di ricerca full-text. |
| `rk scan <path>` | Scansiona una singola directory di repository locale. |
| `rk show <slug>` | Mostra le informazioni complete sul repository, inclusa la conformità alle verifiche. |
| `rk list` | Elenca tutti i repository (filtrabili per stato, linguaggio, struttura). |
| `rk find <query>` | Ricerca full-text su tutti i contenuti indicizzati. |
| `rk related <slug>` | Mostra i repository correlati a un determinato repository. |
| `rk note <slug>` | Aggiungi una nota di tipo (tesi, architettura, avviso, ecc.). |
| `rk relate <from> <type> <to>` | Registra una relazione tra repository. |
| `rk stats` | Mostra le statistiche del database. |
| `rk reindex` | Ricostruisci l'indice di ricerca full-text. |

### Comandi di verifica

| Comando | Descrizione |
|---------|-------------|
| `rk audit seed-controls` | Aggiorna il catalogo canonico con 80 controlli. |
| `rk audit import <dir>` | Importa i risultati delle verifiche da file di contratto JSON. |
| `rk audit posture [slug]` | Mostra lo stato di conformità di un repository o dell'intero portfolio. |
| `rk audit findings` | Elenca i problemi aperti in tutto il portfolio. |
| `rk audit controls` | Elenca i controlli canonici per dominio. |
| `rk audit unaudited` | Elenca i repository senza esecuzioni di verifica. |
| `rk audit failing <domain>` | Elenca i repository che non superano un dominio di verifica specifico. |

## Server MCP

Il server MCP espone 20 strumenti per flussi di lavoro integrati con l'intelligenza artificiale. Aggiungilo alla configurazione del tuo client MCP:

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

**.claude.json (ambito del progetto):**
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

### Strumenti MCP

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Framework di verifica

Il sistema di verifica copre 19 domini con 80 controlli:

| Dominio | Controlli |
|--------|----------|
| inventario | Metadati del repository, proprietà, classificazione. |
| qualità_del_codice | Linting, formattazione, complessità. |
| sicurezza_sast | Analisi statica, injection, autenticazione. |
| dipendenze_sca | Scansione delle vulnerabilità, versione. |
| licenze | Conformità delle licenze, compatibilità. |
| segreti | Rilevamento dei segreti, rotazione. |
| config_iac | Igiene dell'infrastruttura come codice. |
| container | Sicurezza delle immagini, scansione. |
| runtime | Gestione degli errori, resilienza. |
| prestazioni | Profiling, ottimizzazione. |
| osservabilità | Log, tracciamento, metriche |
| test | Copertura, tipi, integrazione CI |
| CI/CD | Sicurezza della pipeline, controlli |
| distribuzione | Processo di rilascio, rollback |
| backup e disaster recovery | Piani di backup, ripristino |
| monitoraggio | Avvisi, uptime |
| conformità e privacy | Gestione dei dati, GDPR |
| catena di fornitura | SBOM, provenienza |
| integrazioni | Contratti API, versionamento |

Ogni esecuzione di audit produce evidenze strutturate: risultati dei controlli (superato/fallito/avvertimento/non applicabile), risultati con gravità e azioni correttive, e metriche aggregate. Lo stato viene determinato automaticamente: **buono**, **richiede attenzione** o **critico**.

## Orchestrazione multi-agente: i giochi di Claude

repo-knowledge include modelli per operazioni parallele multi-Claude su ampi portafogli. I giochi di Claude coordinano più agenti AI attraverso una lista di lavoro condivisa:

1. **Audit Pass** — Ogni agente seleziona repository dalla lista di lavoro, esegue l'audit di 80 controlli e invia risultati strutturati.
2. **Enrichment Pass** — Gli agenti aggiungono tesi, note sull'architettura e mappature delle relazioni.
3. **Remediation Pass** — Gli agenti correggono i risultati utilizzando un flusso di lavoro di 8 passaggi con punteggio.

Consultare [`templates/claude-games/`](templates/claude-games/) per il playbook completo.

## Modello dei dati

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

Tutti i dati sono memorizzati in un singolo database SQLite con ricerca full-text FTS5 su documenti, note e descrizioni dei repository.

## Configurazione

Creare `rk.config.json` nella directory principale del proprio spazio di lavoro (o eseguire `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Variabili d'ambiente: `RK_DB_PATH`, `RK_OWNERS`, `RK_LOCAL_DIRS`.

## Licenza

[MIT](LICENSE)

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
