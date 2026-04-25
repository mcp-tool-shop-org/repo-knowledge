<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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

## Por que

Os registros de pacotes e as APIs do GitHub informam o que um repositório _é_. Eles não informam para que ele _serve_, como ele se relaciona com seus outros repositórios, qual é a sua arquitetura, ou se ele passou na sua última auditoria de segurança. O repo-knowledge preenche essa lacuna: um único banco de dados local que armazena a arquitetura, a auditoria, evidências, relacionamentos e permite a busca de texto completo em todos eles.

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

**Permissões:** requer a CLI `gh` autenticada para sincronização com o GitHub; todos os dados permanecem locais.

**Sem telemetria, sem análise, sem envio de dados.**

## Início Rápido

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

## Referência da CLI

### Comandos Principais

| Comando | Descrição |
|---------|-------------|
| `rk init` | Inicializa a configuração, o banco de dados e define os controles de auditoria. |
| `rk sync` | Sincronização completa: organizações do GitHub + repositórios locais + índice de busca de texto completo. |
| `rk scan <path>` | Analisa um único diretório de repositório local. |
| `rk show <slug>` | Exibe o conhecimento completo do repositório, incluindo o status da auditoria. |
| `rk list` | Lista todos os repositórios (filtráveis por status, linguagem, estrutura). |
| `rk find <query>` | Busca de texto completo em todo o conteúdo indexado. |
| `rk related <slug>` | Exibe os repositórios relacionados a um determinado repositório. |
| `rk note <slug>` | Adiciona uma nota categorizada (tese, arquitetura, aviso, etc.). |
| `rk relate <from> <type> <to>` | Registra um relacionamento entre repositórios. |
| `rk stats` | Exibe estatísticas do banco de dados. |
| `rk reindex` | Reconstrói o índice de busca de texto completo. |

### Comandos de Auditoria

| Comando | Descrição |
|---------|-------------|
| `rk audit seed-controls` | Define/atualiza o catálogo canônico com 80 controles. |
| `rk audit import <dir>` | Importa resultados de auditoria de arquivos de contrato JSON. |
| `rk audit posture [slug]` | Exibe o status da auditoria para um repositório ou para todo o portfólio. |
| `rk audit findings` | Lista os problemas pendentes em todo o portfólio. |
| `rk audit controls` | Lista os controles canônicos por domínio. |
| `rk audit unaudited` | Lista os repositórios que não foram auditados. |
| `rk audit failing <domain>` | Lista os repositórios que falharam em um domínio de auditoria específico. |

## Servidor MCP

O servidor MCP expõe 20 ferramentas para fluxos de trabalho integrados com IA. Adicione-o à configuração do seu cliente MCP:

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

**.claude.json (escopo do projeto):**
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

### Ferramentas MCP

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Estrutura de Auditoria

O sistema de auditoria cobre 19 domínios com 80 controles:

| Domínio | Controles |
|--------|----------|
| inventário | Metadados do repositório, propriedade, classificação. |
| qualidade_do_código | Análise de código, formatação, complexidade. |
| segurança_sast | Análise estática, injeção, autenticação. |
| dependências_sca | Análise de vulnerabilidades, versão. |
| licenças | Conformidade de licenças, compatibilidade. |
| segredos | Detecção de segredos, rotação. |
| config_iac | Higiene de infraestrutura como código. |
| contêineres | Segurança da imagem, análise. |
| tempo_de_execução | Tratamento de erros, resiliência. |
| desempenho | Perfilamento, otimização. |
| Observabilidade | Registro, rastreamento, métricas |
| Testes | Cobertura, tipos, integração com CI |
| CI/CD | Segurança do pipeline, etapas de validação |
| Implantação | Processo de lançamento, reversão |
| Backup e recuperação de desastres | Planos de backup, recuperação |
| Monitoramento | Alertas, tempo de atividade |
| Conformidade e privacidade | Tratamento de dados, GDPR |
| Cadeia de suprimentos | SBOM, rastreabilidade |
| Integrações | Contratos de API, versionamento |

Cada execução de auditoria produz evidências estruturadas: resultados de controle (aprovado/reprovado/alerta/não aplicável), descobertas com severidade e correção, e métricas agregadas. A avaliação geral (postura) é derivada automaticamente: **saudável**, **requer atenção** ou **crítica**.

## Orquestração Multi-Agente: Os Jogos Claude

O conhecimento do repositório inclui modelos para operações paralelas multi-Claude em grandes portfólios. Os Jogos Claude coordenam vários agentes de IA através de uma lista de tarefas compartilhada:

1. **Fase de Auditoria:** Cada agente seleciona repositórios da lista de tarefas, executa a auditoria de 80 controles e envia resultados estruturados.
2. **Fase de Enriquecimento:** Os agentes adicionam análises, notas de arquitetura e mapeamentos de relacionamento.
3. **Fase de Correção:** Os agentes corrigem as descobertas usando um fluxo de trabalho de 8 etapas com pontuação.

Consulte [`templates/claude-games/`](templates/claude-games/) para obter o roteiro completo.

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

Crie um arquivo `rk.config.json` na raiz do seu espaço de trabalho (ou execute `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Variáveis de ambiente: `RK_DB_PATH`, `RK_OWNERS`, `RK_LOCAL_DIRS`.

## Licença

[MIT](LICENSE)

---

Desenvolvido por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a
