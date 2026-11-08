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

## Por que

Os registros de pacotes e as APIs GitHub informam o que um repositório _é_. Eles não informam para que ele _serve_, como ele se relaciona com seus outros repositórios, qual é sua tese arquitetural ou se ele passou em sua última auditoria de segurança. O repo-knowledge preenche essa lacuna: um único banco de dados local que contém a tese, a arquitetura, as evidências da auditoria, os relacionamentos e a pesquisa de texto completo em tudo isso.

## Instalação

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisitos:**
- Node.js 20 ou superior — o `engines.node` deste pacote é `>=20`. A lista `engines` do módulo complementar `better-sqlite3`, cuja versão está fixa, inclui as versões principais do fornecedor, e não se refere à cobertura de versões pré-compiladas.
- `gh` CLI (autenticado) para sincronização com GitHub
- Ferramentas de compilação C/C++ para `better-sqlite3` quando uma compilação prévia não está disponível. O script de instalação do complemento utiliza um caminho duplo: `prebuild-install || node-gyp rebuild --release`. Uma compilação prévia correspondente é utilizada quando disponível; caso contrário, `node-gyp` compila a partir do código-fonte. Isso não garante compatibilidade com todas as plataformas. Se a instalação falhar, consulte o [guia de solução de problemas](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md) em better-sqlite3.

## Modelo de segurança

**Dados acessados:** banco de dados local SQLite, metadados da API GitHub via CLI `gh` (nomes de repositórios, descrições, tópicos, estrelas — nenhum conteúdo do código-fonte).

**Dados NÃO acessados:** nenhum código-fonte é lido do GitHub, nenhuma credencial é armazenada e nenhum dado é enviado para serviços externos.

**Permissões:** requer CLI `gh` autenticado para sincronização GitHub; todos os dados permanecem locais.

**Sem telemetria, sem análise, sem comunicação com servidores.**

## Início rápido

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

## Referência da CLI

### Comandos principais

| Comando | Descrição |
|---------|-------------|
| `rk init` | Inicializar configuração, banco de dados e controles de auditoria |
| `rk sync` | Sincronização completa: GitHub organizações + repositórios locais + índice FTS |
| `rk scan <path>` | Analisar um único diretório de repositório local |
| `rk show <slug>` | Mostrar o conhecimento completo do repositório com a postura de auditoria |
| `rk list` | Listar todos os repositórios (filtrável por status, linguagem, formato) |
| `rk find <query>` | Pesquisa de texto completo em todo o conteúdo indexado |
| `rk related <slug>` | Mostrar repositórios relacionados a um determinado repositório |
| `rk note <slug>` | Adicionar uma anotação tipada (tese, arquitetura, aviso, etc.) com `--type` e `--content` (opcional `--title`); `--delete` remove uma anotação por `--type` + `--title` |
| `rk relate <from> <type> <to>` | Registrar um relacionamento entre repositórios (opcional `--note`) |
| `rk stats` | Mostrar estatísticas do banco de dados |
| `rk reindex` | Reconstruir o índice FTS |
| `rk sync-dogfood` | Sincronizar evidências de teste do dogfood-lab/testing-os nos fatos do repositório |
| `rk suggest-dogfood --repo <slug>` | Sugerir descobertas conhecidas do dogfood para um repositório ou superfície |

> **`--json` onde importa.** `list`, `find`, `show`, `related` e `stats` — além das cinco leituras de auditoria (`posture`, `findings`, `controls`, `unaudited`, `failing`) — todas aceitam `--json` para saída legível por máquina. JSON é o contrato fundamental em todos os comandos principais: direcione qualquer um deles diretamente para `jq`.

### Comandos de ciclo de vida (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk delete <slug> [--yes]` | Excluir em cascata um repositório e todas as linhas filhas |
| `rk archive <slug> [--reason <text>]` | Alternar `lifecycle_status` para `archived` (preserva anotações/descobertas) |
| `rk verify-local [--rig <id>] [--strict]` | Verificar se `local_path` existe por rig; atualiza `repo_local_paths` |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registrar o rig atual |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Excluir permanentemente repositórios arquivados há mais de N dias (padrão 30) |

### Comandos de estado de publicação (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Painel de versão publicada entre canais (npm/pypi/github_release) |
| `rk drift <slug> [--strict]` | Comparar a versão da fonte da verdade com a versão mais recente do registro |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Definidor de vinculação manual |

### Comandos de saúde (v2.0.0 — com base em pesquisa)

| Comando | Descrição |
|---------|-------------|
| `rk health` (padrão = feed) | Alterar feed: deltas desde a última sincronização, interseção KEV, interrupções na sequência de CI, desvio de ação-pin |
| `rk health doctor <slug>` | Análise aprofundada de um único repositório (auditoria de dependências, ações de fluxo de trabalho, sinal de CI, cadeia de ferramentas) |
| `rk health table [--json\|--text]` | Tabela de saúde do portfólio; JSON é o contrato fundamental |

### Comandos operacionais (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Verificação de integridade do banco de dados; grava uma linha de auditoria em `db_health_runs` |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Histórico de alterações de entrada para um repositório |
| `rk runs [--db-health\|--sync] [--limit <N>] [--json]` | Listar entradas recentes `db_health_runs` / `sync_runs` |
| `rk owners list` | Listar proprietários configurados GitHub |
| `rk owners add <owner>` | Adicionar aos proprietários `rk.config.json` |
| `rk owners remove <owner>` | Remover dos proprietários `rk.config.json` |

### Backup, restauração e pré-verificação (v2.1.0)

| Comando | Descrição |
|---------|-------------|
| `rk backup [--out <path>]` | Faça uma cópia do banco de dados de conhecimento e armazene-a em uma cópia otimizada (`VACUUM INTO`) em `data/backups/` ou `--out`. |
| `rk restore <path> [--yes]` | Restaurar o banco de dados a partir de um instantâneo — validação de esquema, troca atômica, confirmação obrigatória (recusa um backup com um esquema mais recente) |
| `rk doctor [--json] [--strict]` | Pré-verificação do ambiente: configuração, banco de dados, versão do esquema, autenticação `gh`, rig atual, execuções recentes de sincronização/fsck |
| `rk config [--json]` | Mostrar a configuração efetiva resolvida com a proveniência por campo |
| `rk config validate [--json]` | Validar `rk.config.json` — sai com código de erro diferente de zero em proprietários de espaço reservado, formatos incorretos ou caminhos irresolvíveis |

### Classificação (v2.1.1)

| Comando | Descrição |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | Definir os campos de ciclo de vida selecionados — `status` (`active`/`paused`/`archived`/`unknown`), `stage` de formato livre (por exemplo, `shipped`, `Phase 1`) e `category` (`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`). Estes não são preenchidos por `sync` ou `scan`; passe `""` para limpar `stage`/`category` |

### Comandos de auditoria

| Comando | Descrição |
|---------|-------------|
| `rk audit seed-controls` | Criar/atualizar o catálogo canônico de 80 controles |
| `rk audit import <dir>` | Importar resultados de auditoria de arquivos de contrato JSON |
| `rk audit posture [slug]` | Mostrar a postura de auditoria para um repositório ou portfólio completo |
| `rk audit findings` | Listar descobertas abertas em todo o portfólio |
| `rk audit controls` | Listar controles canônicos por domínio |
| `rk audit unaudited` | Listar repositórios sem execuções de auditoria |
| `rk audit failing <domain>` | Listar repositórios que falham em um domínio de auditoria específico |

### Comandos de jogos

| Comando | Descrição |
|---------|-------------|
| `rk games score <worklist>` | Avaliar um REMEDIATION-WORKLIST.md e mostrar a tabela de classificação |

## Servidor MCP

O servidor MCP expõe 30 ferramentas para fluxos de trabalho integrados com IA. Adicione-o à configuração do seu cliente MCP:

**Claude Code (`.claude.json` com escopo de projeto):**
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

O servidor lê `rk.config.json` do diretório de trabalho na inicialização. Certifique-se de que `rk.config.json` exista no diretório onde o servidor é executado.

### Ferramentas MCP

**Conhecimento e sincronização:**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**Auditoria:**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**Saúde da construção** (apenas leituras do banco de dados, sem atualização da rede):
`health_feed` `health_doctor` `health_portfolio`

**Higiene operacional:**
`db_fsck` `repo_diff` `ops_runs`

**Ciclo de vida e publicação:**
`archive_repo` `delete_repo` `repo_versions`

**Teste interno e simulação de auditoria:**
`suggest_dogfood` `audit_failing`

## Estrutura de auditoria

O sistema de auditoria abrange 19 domínios com 80 controles:

| Domínio | Controles |
|--------|----------|
| inventário | Metadados do repositório, propriedade, classificação |
| qualidade_do_código | Análise de código, formatação, complexidade |
| segurança_sast | Análise estática, injeção, autenticação |
| dependências_sca | Análise de vulnerabilidades, atualização |
| licenças | Conformidade com a licença, compatibilidade |
| segredos | Detecção de segredos, rotação |
| config_iac | Higiene da infraestrutura como código |
| contêineres | Segurança da imagem, análise |
| runtime | Tratamento de erros, resiliência |
| desempenho | Perfil, otimização |
| observabilidade | Registro, rastreamento, métricas |
| testes | Cobertura, tipos, integração com CI |
| cicd | Segurança do pipeline, portões |
| implantação | Processo de lançamento, reversão |
| backup_dr | Planos de backup, recuperação |
| monitoramento | Alertas, tempo de atividade |
| conformidade_privacidade | Tratamento de dados, GDPR |
| cadeia_de_suprimentos | SBOM, rastreabilidade |
| integrações | Contratos de API, versionamento |

Cada execução de auditoria produz evidências estruturadas: resultados dos controles (aprovado/reprovado/alerta/não aplicável), descobertas com gravidade e correção, e métricas agregadas. O estado é derivado automaticamente: **saudável**, **precisa de atenção** ou **crítico**.

## Orquestração Multi-Agente: Os Jogos Claude

O conhecimento do repositório inclui modelos para operações paralelas multi-Claude em grandes portfólios. Os Jogos Claude coordenam vários agentes de IA por meio de uma lista de tarefas compartilhada:

1. **Passagem de auditoria** — Cada agente seleciona repositórios da lista de tarefas, executa a auditoria de 80 controles e envia resultados estruturados.
2. **Passagem de enriquecimento** — Os agentes adicionam tese, notas de arquitetura e mapeamentos de relacionamento.
3. **Passagem de correção** — Os agentes corrigem as descobertas usando um fluxo de trabalho de 8 etapas com pontuação.

Consulte [`templates/claude-games/`](templates/claude-games/) para obter o guia completo.

## Modelo de dados

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

Todos os dados estão armazenados em um único banco de dados SQLite com pesquisa de texto completo FTS5 em documentos, notas e descrições de repositórios.

## Configuração

Crie `rk.config.json` na raiz do seu espaço de trabalho (ou execute `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Todas as configurações vêm de `rk.config.json` (criado por `rk init`). O servidor MCP também lê a configuração do diretório de trabalho.

## Licença

[MIT](LICENSE)

---

Criado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
