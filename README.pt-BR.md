<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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

Os registros de pacotes e as APIs do GitHub informam o que um repositório _é_. Eles não informam para que ele serve, como se relaciona com seus outros repositórios, qual é sua tese arquitetural ou se passou em sua última auditoria de segurança. O repo-knowledge preenche essa lacuna: um único banco de dados local que contém a tese, a arquitetura, as evidências da auditoria, os relacionamentos e a pesquisa de texto completo em tudo isso.

## Instalar

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisitos:**
- Node.js 20+
- CLI `gh` (autenticado) para sincronização com o GitHub
- Ferramentas de compilação C/C++ para `better-sqlite3`, ou binários pré-compilados serão usados automaticamente em plataformas compatíveis

## Modelo de segurança

**Dados acessados:** banco de dados SQLite local, metadados da API do GitHub por meio da CLI `gh` (nomes dos repositórios, descrições, tópicos, estrelas — nenhum conteúdo do código-fonte).

**Dados NÃO acessados:** nenhum código-fonte é lido do GitHub, nenhuma credencial é armazenada e nenhum dado é enviado para serviços externos.

**Permissões:** requer a CLI `gh` autenticada para sincronização com o GitHub; todos os dados permanecem locais.

**Sem telemetria, sem análise de dados, sem comunicação constante.**

## Primeiros passos

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
| `rk init` | Inicializar a configuração, o banco de dados e os controles de auditoria. |
| `rk sync` | Sincronização completa: organizações do GitHub + repositórios locais + índice FTS. |
| `rk scan <path>` | Analisar um único diretório de repositório local. |
| `rk show <slug>` | Mostrar o conhecimento completo do repositório com a postura da auditoria. |
| `rk list` | Listar todos os repositórios (filtrável por status, linguagem, formato). |
| `rk find <query>` | Pesquisa de texto completo em todo o conteúdo indexado. |
| `rk related <slug>` | Mostrar os repositórios relacionados a um determinado repositório. |
| `rk note <slug>` | Adicione uma nota digitada (tese, arquitetura, aviso, etc.) com `--type` e `--content` (opcionalmente `--title`); `--delete` remove uma nota por meio de `--type` + `--title`. |
| `rk relate <from> <type> <to>` | Registrar um relacionamento entre os repositórios (opcionalmente, `--note`). |
| `rk stats` | Mostrar as estatísticas do banco de dados. |
| `rk reindex` | Reconstruir o índice FTS. |
| `rk sync-dogfood` | Sincronizar evidências do dogfood-lab/testing-os nos fatos do repositório. |
| `rk suggest-dogfood --repo <slug>` | Sugerir descobertas conhecidas do dogfood para um repositório ou superfície. |

> **`--json` onde for relevante.** `list`, `find`, `show`, `related` e `stats` — além das cinco leituras de auditoria (`posture`, `findings`, `controls`, `unaudited`, `failing`) — todos aceitam `--json` para saída legível por máquina. JSON é o contrato fundamental em todos os comandos principais: direcione qualquer um deles diretamente para o `jq`.

### Comandos do ciclo de vida (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk delete <slug> [--yes]` | Excluir em cascata um repositório e todas as linhas filhas. |
| `rk archive <slug> [--reason <text>]` | Alterar `lifecycle_status` para `archived` (preserva anotações/descobertas). |
| `rk verify-local [--rig <id>] [--strict]` | Verificar se `local_path` existe por rig; atualiza `repo_local_paths`. |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registrar o rig atual. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Excluir permanentemente os repositórios arquivados há mais de N dias (padrão: 30). |

### Comandos do estado de publicação (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Painel de versão publicada entre canais (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Comparar a versão da fonte da verdade com a versão mais recente do registro. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Definidor manual de vinculação. |

### Comandos de integridade (v2.0.0 — baseado em pesquisa)

| Comando | Descrição |
|---------|-------------|
| `rk health` (padrão = feed). | Alterar o feed: deltas desde a última sincronização, interseção KEV, interrupções na sequência de CI, desvio da ação-pin. |
| `rk health doctor <slug>` | Análise detalhada de um único repositório (auditoria de dependências, ações do fluxo de trabalho, sinal de CI, cadeia de ferramentas). |
| `rk health table [--json\ | --text]` | Tabela de integridade do portfólio; JSON é o contrato fundamental. |

### Comandos operacionais (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Verificação da integridade do banco de dados; grava uma linha de auditoria em `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Histórico de alterações de entrada para um repositório. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Listar as entradas recentes de `db_health_runs` / `sync_runs`. |
| `rk owners list` | Listar os proprietários configurados do GitHub. |
| `rk owners add <owner>` | Adicionar aos proprietários em `rk.config.json`. |
| `rk owners remove <owner>` | Remover dos proprietários em `rk.config.json`. |

### Backup, restauração e pré-verificação (v2.1.0)

| Comando | Descrição |
|---------|-------------|
| `rk backup [--out <path>]` | Criar um instantâneo do banco de dados de conhecimento para uma cópia "vacuumed" (`VACUUM INTO`) em `data/backups/` ou `--out`. |
| `rk restore <path> [--yes]` | Restaurar o banco de dados a partir de um instantâneo — validação do esquema, troca atômica, confirmação (rejeita um backup com um esquema mais recente). |
| `rk doctor [--json] [--strict]` | Pré-verificação do ambiente: configuração, banco de dados, versão do esquema, autenticação `gh`, rig atual, execuções recentes de sincronização/fsck. |
| `rk config [--json]` | Mostrar a configuração efetiva resolvida com a origem por campo. |
| `rk config validate [--json]` | Validar `rk.config.json` — sai com código diferente de zero em caso de proprietários de espaço reservado, formatos incorretos ou caminhos irresolvíveis. |

### Classificação (v2.1.1)

| Comando | Descrição |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | Defina os campos do ciclo de vida selecionados: `status` (`ativo`/`pausado`/`arquivado`/`desconhecido`), `stage` em formato livre (por exemplo, `enviado`, `Fase 1`) e `category` (`produto`/`ferramenta`/`biblioteca`/`experimento`/`modelo`/`marketing`). Estes campos não são preenchidos por `sync` ou `scan`; use `""` para limpar `stage`/`category`. |

### Comandos de auditoria

| Comando | Descrição |
|---------|-------------|
| `rk audit seed-controls` | Criar/atualizar o catálogo canônico de 80 controles. |
| `rk audit import <dir>` | Importar resultados de auditoria de arquivos com contrato JSON. |
| `rk audit posture [slug]` | Mostrar a postura da auditoria para um repositório ou portfólio completo. |
| `rk audit findings` | Listar as descobertas abertas em todo o portfólio. |
| `rk audit controls` | Listar os controles canônicos por domínio. |
| `rk audit unaudited` | Listar os repositórios sem execuções de auditoria. |
| `rk audit failing <domain>` | Listar os repositórios que falham em um domínio de auditoria específico. |

### Comandos de jogos

| Comando | Descrição |
|---------|-------------|
| `rk games score <worklist>` | Avaliar um arquivo REMEDIATION-WORKLIST.md e mostrar a tabela de classificação. |

## Servidor MCP

O servidor MCP expõe 30 ferramentas para fluxos de trabalho integrados com IA. Adicione-o à configuração do seu cliente MCP:

**Claude Code (escopo do projeto `.claude.json`):**
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

**Dogfood e simulação de auditoria:**
`suggest_dogfood` `audit_failing`

## Estrutura de Auditoria

O sistema de auditoria abrange 19 domínios com 80 controles:

| Domínio | Controles |
|--------|----------|
| inventário | Metadados do repositório, propriedade, classificação |
| qualidade_do_código | Análise de código estática, formatação, complexidade |
| segurança_sast | Análise estática, injeção, autenticação |
| dependências_sca | Verificação de vulnerabilidades, atualização |
| licenças | Conformidade com a licença, compatibilidade |
| segredos | Detecção de segredos, rotação |
| config_iac | Higiene da infraestrutura como código |
| contêineres | Segurança da imagem, verificação |
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

Cada execução de auditoria produz evidências estruturadas: resultados dos controles (aprovado/reprovado/alerta/não aplicável), descobertas com gravidade e correção, e métricas agregadas. A postura é derivada automaticamente: **saudável**, **precisa de atenção** ou **crítica**.

## Orquestração Multi-Agente: Os Jogos Claude

repo-knowledge inclui modelos para operações paralelas multi-Claude em grandes portfólios. Os Jogos Claude coordenam vários agentes de IA por meio de uma lista de tarefas compartilhada:

1. **Passagem de Auditoria** — Cada agente seleciona repositórios da lista de tarefas, executa a auditoria com 80 controles e envia resultados estruturados.
2. **Passagem de Enriquecimento** — Os agentes adicionam tese, notas de arquitetura e mapeamentos de relacionamento.
3. **Passagem de Correção** — Os agentes corrigem as descobertas usando um fluxo de trabalho de 8 etapas com pontuação.

Consulte [`templates/claude-games/`](templates/claude-games/) para obter o playbook completo.

## Modelo de Dados

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

Todos os dados estão armazenados em um único banco de dados SQLite com pesquisa de texto completo FTS5 em documentos, notas e descrições do repositório.

## Configuração

Crie `rk.config.json` no diretório raiz do seu espaço de trabalho (ou execute `rk init`):

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
