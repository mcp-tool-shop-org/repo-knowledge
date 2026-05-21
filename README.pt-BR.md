<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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

## Por que

Os registros de pacotes e as APIs do GitHub informam o que um repositório _é_. Eles não informam para que ele _serve_, como ele se relaciona com seus outros repositórios, qual é a sua tese arquitetural ou se ele passou na sua última auditoria de segurança. O repo-knowledge preenche essa lacuna: um único banco de dados local que armazena teses, arquitetura, evidências de auditoria, relacionamentos e pesquisa de texto completo em tudo isso.

## Instalação

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisitos:**
- Node.js 20+
- CLI `gh` (autenticado) para sincronização com o GitHub
- Ferramentas de compilação C/C++ para `better-sqlite3`, ou binários pré-compilados serão usados automaticamente em plataformas suportadas.

## Modelo de Segurança

**Dados acessados:** banco de dados SQLite local, metadados da API do GitHub via CLI `gh` (nomes de repositórios, descrições, tópicos, estrelas — sem conteúdo do código-fonte).

**Dados NÃO acessados:** nenhum código-fonte é lido do GitHub, nenhuma credencial é armazenada, nenhum dado é enviado para serviços externos.

**Permissões:** requer CLI `gh` autenticada para sincronização com o GitHub; todos os dados permanecem locais.

**Sem telemetria, sem análises, sem envio de dados.**

## Início Rápido

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

### Comandos Principais

| Comando | Descrição |
|---------|-------------|
| `rk init` | Inicializa a configuração, o banco de dados e os controles de auditoria. |
| `rk sync` | Sincronização completa: organizações do GitHub + repositórios locais + índice de pesquisa de texto completo. |
| `rk scan <path>` | Analisa um único diretório de repositório local. |
| `rk show <slug>` | Exibe todo o conhecimento do repositório com a postura de auditoria. |
| `rk list` | Lista todos os repositórios (filtráveis por status, linguagem, estrutura). |
| `rk find <query>` | Pesquisa de texto completo em todo o conteúdo indexado. |
| `rk related <slug>` | Exibe repositórios relacionados a um determinado repositório. |
| `rk note <slug>` | Adiciona uma nota tipada (tese, arquitetura, aviso, etc.) com `--type` e `--content` (opcional `--title`). |
| `rk relate <from> <type> <to>` | Registra um relacionamento entre repositórios (opcional `--note`). |
| `rk stats` | Exibe estatísticas do banco de dados. |
| `rk reindex` | Reconstrói o índice de pesquisa de texto completo. |
| `rk sync-dogfood` | Importa evidências do "dogfood" de dogfood-lab/testing-os para os fatos do repositório. |
| `rk suggest-dogfood --repo <slug>` | Sugere descobertas de "dogfood" conhecidas para um repositório ou ambiente. |

### Comandos do Ciclo de Vida (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk delete <slug> [--yes]` | Exclui em cascata um repositório e todas as linhas filhas. |
| `rk archive <slug> [--reason <text>]` | Altera o status do ciclo de vida para "arquivado" (preserva notas/descobertas). |
| `rk verify-local [--rig <id>] [--strict]` | Verifica se o `local_path` existe para cada ambiente; atualiza `repo_local_paths`. |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registra o ambiente atual. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Exclui permanentemente repositórios arquivados há mais de N dias (padrão: 30). |

### Comandos de Publicação de Estado (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Painel de versão publicada entre diferentes canais (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Compara a versão de referência com a versão mais recente do registro. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Definidor de vinculação manual. |

### Comandos de Saúde (v2.0.0 — baseados em pesquisa)

| Comando | Descrição |
|---------|-------------|
| `rk health` (padrão = feed) | Altera o feed: diferenças desde a última sincronização, interseção KEV, interrupções da CI, desvio do "action-pin". |
| `rk health doctor <slug>` | Análise detalhada de um único repositório (auditoria de dependências, ações de fluxo de trabalho, sinal da CI, cadeia de ferramentas). |
| `rk health table [--json\ | --text]` | Tabela de saúde do portfólio; JSON é o contrato de suporte. |

### Comandos Operacionais (v2.0.0)

| Comando | Descrição |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Verificação da integridade do banco de dados; grava uma linha de auditoria em `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Histórico de alterações de uma entrada para um repositório. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Lista as entradas recentes de `db_health_runs` / `sync_runs`. |
| `rk owners list` | Lista os proprietários do GitHub configurados. |
| `rk owners add <owner>` | Adiciona proprietários a `rk.config.json`. |
| `rk owners remove <owner>` | Remove proprietários de `rk.config.json`. |

### Comandos de Auditoria

| Comando | Descrição |
|---------|-------------|
| `rk audit seed-controls` | Semeia/atualiza o catálogo canônico de 80 controles. |
| `rk audit import <dir>` | Importa resultados de auditoria de arquivos de contrato JSON. |
| `rk audit posture [slug]` | Mostrar o estado de auditoria de um repositório ou de todo o portfólio. |
| `rk audit findings` | Listar as descobertas pendentes em todo o portfólio. |
| `rk audit controls` | Listar os controles canônicos por domínio. |
| `rk audit unaudited` | Listar os repositórios que não tiveram auditorias executadas. |
| `rk audit failing <domain>` | Listar os repositórios que falharam em um domínio de auditoria específico. |

### Comandos dos Jogos Claude

| Comando | Descrição |
|---------|-------------|
| `rk games score <worklist>` | Calcular a pontuação de um arquivo REMEDIATION-WORKLIST.md e exibir a tabela de classificação. |

## Servidor MCP

O servidor MCP expõe 19 ferramentas para fluxos de trabalho integrados com IA. Adicione-o à configuração do seu cliente MCP:

**Claude Code (arquivo `.claude.json` específico do projeto):**
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

O servidor lê o arquivo `rk.config.json` do diretório de trabalho na inicialização. Certifique-se de que o arquivo `rk.config.json` exista no diretório onde o servidor está sendo executado.

### Ferramentas MCP

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Framework de Auditoria

O sistema de auditoria cobre 19 domínios com 80 controles:

| Domínio | Controles |
|--------|----------|
| inventário | Metadados do repositório, propriedade, classificação. |
| qualidade_do_código | Análise de código, formatação, complexidade. |
| segurança_sast | Análise estática, injeção, autenticação. |
| dependências_sca | Análise de vulnerabilidades, versão. |
| licenças | Conformidade e compatibilidade de licenças. |
| segredos | Detecção e rotação de segredos. |
| config_iac | Higiene de infraestrutura como código. |
| contêineres | Segurança e análise de imagens. |
| tempo_de_execução | Tratamento de erros, resiliência. |
| desempenho | Perfilamento, otimização. |
| observabilidade | Registro, rastreamento, métricas. |
| testes | Cobertura, tipos, integração com CI. |
| cicd | Segurança do pipeline, validações. |
| implantação | Processo de lançamento, reversão. |
| backup_dr | Planos de backup e recuperação. |
| monitoramento | Alertas, tempo de atividade. |
| conformidade_privacidade | Tratamento de dados, GDPR. |
| cadeia_de_suprimentos | SBOM, rastreabilidade. |
| integrações | Contratos de API, versionamento. |

Cada execução de auditoria gera evidências estruturadas: resultados dos controles (aprovado/reprovado/alerta/não aplicável), descobertas com severidade e correção, e métricas agregadas. O estado é derivado automaticamente: **saudável**, **requer atenção** ou **crítico**.

## Orquestração Multi-Agente: Os Jogos Claude

repo-knowledge inclui modelos para operações paralelas multi-Claude em grandes portfólios. Os Jogos Claude coordenam vários agentes de IA por meio de uma lista de trabalho compartilhada:

1. **Passo de Auditoria** — Cada agente seleciona repositórios da lista de trabalho, executa a auditoria de 80 controles e envia os resultados estruturados.
2. **Passo de Enriquecimento** — Os agentes adicionam teses, notas de arquitetura e mapeamentos de relacionamento.
3. **Passo de Correção** — Os agentes corrigem as descobertas usando um fluxo de trabalho pontuado de 8 etapas.

Veja [`templates/claude-games/`](templates/claude-games/) para o playbook completo.

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

Todos os dados são armazenados em um único banco de dados SQLite com pesquisa de texto completo FTS5 em documentos, notas e descrições de repositórios.

## Configuração

Crie o arquivo `rk.config.json` na raiz do seu espaço de trabalho (ou execute `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Todas as configurações são lidas do arquivo `rk.config.json` (criado por `rk init`). O servidor MCP também lê as configurações do diretório de trabalho.

## Licença

[MIT](LICENSE)

---

Desenvolvido por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
