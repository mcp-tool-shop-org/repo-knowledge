<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## ¿Por qué?

Los registros de paquetes y las API de GitHub le indican qué es un repositorio. No le indican para qué sirve, cómo se relaciona con sus otros repositorios, cuál es su tesis arquitectónica o si ha superado su última auditoría de seguridad. repo-knowledge llena esa brecha: una base de datos local que almacena tesis, arquitectura, evidencia de auditoría, relaciones y búsqueda de texto completo de todo ello.

## Instalación

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisitos:**
- Node.js 20+
- CLI `gh` (autenticado) para la sincronización con GitHub
- Herramientas de compilación de C/C++ para `better-sqlite3`, o se utilizarán automáticamente binarios precompilados en las plataformas compatibles.

## Modelo de seguridad

**Datos accedidos:** base de datos SQLite local, metadatos de la API de GitHub a través de la CLI `gh` (nombres de repositorios, descripciones, temas, estrellas; no se incluye el contenido del código fuente).

**Datos NO accedidos:** no se lee código fuente de GitHub, no se almacenan credenciales, no se envían datos a servicios externos.

**Permisos:** requiere la CLI `gh` autenticada para la sincronización con GitHub; todos los datos permanecen locales.

**Sin telemetría, sin análisis, sin conexión a servidores externos.**

## Primeros pasos

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

## Referencia de la CLI

### Comandos principales

| Comando | Descripción |
|---------|-------------|
| `rk init` | Inicializa la configuración, la base de datos y los controles de auditoría. |
| `rk sync` | Sincronización completa: organizaciones de GitHub + repositorios locales + índice de búsqueda de texto completo. |
| `rk scan <path>` | Escanea un directorio de repositorio local. |
| `rk show <slug>` | Muestra el conocimiento completo del repositorio con la postura de auditoría. |
| `rk list` | Lista todos los repositorios (filtrables por estado, lenguaje, estructura). |
| `rk find <query>` | Búsqueda de texto completo en todo el contenido indexado. |
| `rk related <slug>` | Muestra los repositorios relacionados con un repositorio determinado. |
| `rk note <slug>` | Añade una nota con tipo (tesis, arquitectura, advertencia, etc.). |
| `rk relate <from> <type> <to>` | Registra una relación entre repositorios. |
| `rk stats` | Muestra las estadísticas de la base de datos. |
| `rk reindex` | Reconstruye el índice de búsqueda de texto completo. |

### Comandos de auditoría

| Comando | Descripción |
|---------|-------------|
| `rk audit seed-controls` | Crea/actualiza el catálogo canónico de 80 controles. |
| `rk audit import <dir>` | Importa los resultados de la auditoría desde archivos de contrato JSON. |
| `rk audit posture [slug]` | Muestra la postura de auditoría para un repositorio o para todo el conjunto. |
| `rk audit findings` | Lista los hallazgos abiertos en todo el conjunto. |
| `rk audit controls` | Lista los controles canónicos por dominio. |
| `rk audit unaudited` | Lista los repositorios sin auditorías. |
| `rk audit failing <domain>` | Lista los repositorios que fallan en un dominio de auditoría específico. |

## Servidor MCP

El servidor MCP expone 20 herramientas para flujos de trabajo integrados con IA. Añádalo a la configuración de tu cliente MCP:

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

**.claude.json (de ámbito de proyecto):**
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

### Herramientas MCP

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Marco de auditoría

El sistema de auditoría cubre 19 dominios con 80 controles:

| Dominio | Controles |
|--------|----------|
| inventario | Metadatos del repositorio, propiedad, clasificación. |
| calidad_del_codigo | Análisis de estilo, formato, complejidad. |
| seguridad_sast | Análisis estático, inyección, autenticación. |
| dependencias_sca | Análisis de vulnerabilidades, versiones. |
| licencias | Cumplimiento de licencias, compatibilidad. |
| secretos | Detección de secretos, rotación. |
| config_iac | Higiene de la infraestructura como código. |
| contenedores | Seguridad de imágenes, análisis. |
| ejecucion | Manejo de errores, resiliencia. |
| rendimiento | Perfilado, optimización. |
| observabilidad | Registro, trazabilidad, métricas |
| pruebas | Cobertura, tipos, integración con CI |
| ciclo de desarrollo e implementación continua (CI/CD) | Seguridad de la canalización, controles |
| despliegue | Proceso de lanzamiento, reversión |
| copia de seguridad y recuperación ante desastres | copias de seguridad, recuperación |
| monitoreo | Alertas, tiempo de actividad |
| cumplimiento y privacidad | Manejo de datos, RGPD |
| cadena de suministro | SBOM (Software Bill of Materials), trazabilidad |
| integraciones | Contratos de API, versionado |

Cada ejecución de auditoría produce evidencia estructurada: resultados de los controles (aprobado/fallido/advertencia/no aplicable), hallazgos con severidad y corrección, y métricas agregadas. El estado se deriva automáticamente: **óptimo**, **requiere atención** o **crítico**.

## Orquestación Multi-Agente: Los Juegos de Claude

repo-knowledge incluye plantillas para operaciones multi-Claude en paralelo en grandes conjuntos de repositorios. Los Juegos de Claude coordinan múltiples agentes de IA a través de una lista de trabajo compartida:

1. **Fase de Auditoría:** Cada agente selecciona repositorios de la lista de trabajo, ejecuta la auditoría de 80 controles y envía resultados estructurados.
2. **Fase de Enriquecimiento:** Los agentes agregan tesis, notas de arquitectura y mapeos de relaciones.
3. **Fase de Corrección:** Los agentes corrigen los hallazgos utilizando un flujo de trabajo de 8 pasos con puntuación.

Consulte [`templates/claude-games/`](templates/claude-games/) para obtener el playbook completo.

## Modelo de Datos

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

Todos los datos se almacenan en una única base de datos SQLite con búsqueda de texto completo FTS5 en documentos, notas y descripciones de repositorios.

## Configuración

Cree `rk.config.json` en la raíz de su espacio de trabajo (o ejecute `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Variables de entorno: `RK_DB_PATH`, `RK_OWNERS`, `RK_LOCAL_DIRS`.

## Licencia

[MIT](LICENSE)

---

Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
