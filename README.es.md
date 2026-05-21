<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## ¿Por qué?

Los registros de paquetes y las API de GitHub le indican qué es un repositorio. No le indican para qué sirve, cómo se relaciona con sus otros repositorios, cuál es su tesis arquitectónica o si ha superado su última auditoría de seguridad. repo-knowledge llena esa brecha: una base de datos local que contiene tesis, arquitectura, evidencia de auditoría, relaciones y búsqueda de texto completo de todo ello.

## Instalación

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisitos:**
- Node.js 20+
- CLI `gh` (autenticado) para la sincronización con GitHub
- Herramientas de compilación de C/C++ para `better-sqlite3`, o se utilizarán automáticamente binarios precompilados en plataformas compatibles.

## Modelo de seguridad

**Datos accedidos:** base de datos SQLite local, metadatos de la API de GitHub a través de la CLI `gh` (nombres de repositorios, descripciones, temas, estrellas; no se incluye el contenido del código fuente).

**Datos NO accedidos:** no se lee ningún código fuente de GitHub, no se almacenan credenciales, no se envían datos a servicios externos.

**Permisos:** requiere la CLI `gh` autenticada para la sincronización con GitHub; todos los datos permanecen locales.

**Sin telemetría, sin análisis, sin conexión a servidores externos.**

## Comienzo rápido

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

## Referencia de la CLI

### Comandos principales

| Comando | Descripción |
|---------|-------------|
| `rk init` | Inicializa la configuración, la base de datos y los controles de auditoría. |
| `rk sync` | Sincronización completa: organizaciones de GitHub + repositorios locales + índice de búsqueda de texto completo. |
| `rk scan <path>` | Escanea un directorio de repositorio local. |
| `rk show <slug>` | Muestra todo el conocimiento del repositorio con la postura de auditoría. |
| `rk list` | Lista todos los repositorios (filtrables por estado, lenguaje, estructura). |
| `rk find <query>` | Búsqueda de texto completo en todo el contenido indexado. |
| `rk related <slug>` | Muestra los repositorios relacionados con un repositorio determinado. |
| `rk note <slug>` | Agrega una nota con tipo (tesis, arquitectura, advertencia, etc.) con `--type` y `--content` (opcional `--title`). |
| `rk relate <from> <type> <to>` | Registra una relación entre repositorios (opcional `--note`). |
| `rk stats` | Muestra las estadísticas de la base de datos. |
| `rk reindex` | Reconstruye el índice de búsqueda de texto completo. |
| `rk sync-dogfood` | Importa la evidencia de "dogfood" de dogfood-lab/testing-os en los datos del repositorio. |
| `rk suggest-dogfood --repo <slug>` | Sugiere hallazgos conocidos de "dogfood" para un repositorio o una superficie. |

### Comandos del ciclo de vida (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk delete <slug> [--yes]` | Elimina en cascada un repositorio y todas las filas secundarias. |
| `rk archive <slug> [--reason <text>]` | Cambia el estado del ciclo de vida a "archivado" (conserva las notas/hallazgos). |
| `rk verify-local [--rig <id>] [--strict]` | Verifica que la ruta `local_path` exista para cada entorno; actualiza `repo_local_paths`. |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registra el entorno actual. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Elimina permanentemente los repositorios archivados durante más de N días (por defecto, 30). |

### Comandos de publicación de estado (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Panel de control de versiones publicadas entre diferentes canales (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Compara la versión de origen con la última versión del registro. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Establecedor de versión manual. |

### Comandos de estado (v2.0.0 - basados en investigación)

| Comando | Descripción |
|---------|-------------|
| `rk health` (por defecto = feed) | Cambia el feed: diferencias desde la última sincronización, intersección KEV, interrupciones de la cadena de CI, deriva de las acciones. |
| `rk health doctor <slug>` | Análisis profundo de un repositorio (auditoría de dependencias, acciones del flujo de trabajo, señal de CI, cadena de herramientas). |
| `rk health table [--json\ | --text]` | Tabla de estado del portafolio; JSON es el contrato de carga. |

### Comandos operativos (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Comprobación de la integridad de la base de datos; escribe una fila de auditoría en `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Historial de cambios de una entrada para un repositorio. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Lista las entradas recientes de `db_health_runs` / `sync_runs`. |
| `rk owners list` | Lista los propietarios de GitHub configurados. |
| `rk owners add <owner>` | Agrega a `rk.config.json` los propietarios. |
| `rk owners remove <owner>` | Elimina de `rk.config.json` los propietarios. |

### Comandos de auditoría

| Comando | Descripción |
|---------|-------------|
| `rk audit seed-controls` | Sembra/actualiza el catálogo canónico de 80 controles. |
| `rk audit import <dir>` | Importa los resultados de la auditoría desde los archivos de contrato JSON. |
| `rk audit posture [slug]` | Mostrar el estado de auditoría de un repositorio o de todo el conjunto de repositorios. |
| `rk audit findings` | Listar los hallazgos pendientes en todo el conjunto de repositorios. |
| `rk audit controls` | Listar los controles canónicos por dominio. |
| `rk audit unaudited` | Listar los repositorios que no tienen ejecuciones de auditoría. |
| `rk audit failing <domain>` | Listar los repositorios que fallan en un dominio de auditoría específico. |

### Comandos de Claude

| Comando | Descripción |
|---------|-------------|
| `rk games score <worklist>` | Calcular la puntuación de un archivo REMEDIATION-WORKLIST.md y mostrar la tabla de clasificación. |

## Servidor MCP

El servidor MCP expone 19 herramientas para flujos de trabajo integrados con IA. Agréguelo a la configuración de su cliente MCP:

**Claude Code (archivo `.claude.json` específico del proyecto):**
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

**Escritorio de Claude (`claude_desktop_config.json`):**
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

El servidor lee `rk.config.json` desde el directorio de trabajo al iniciarse. Asegúrese de que `rk.config.json` exista en el directorio donde se ejecuta el servidor.

### Herramientas MCP

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Marco de auditoría

El sistema de auditoría cubre 19 dominios con 80 controles:

| Dominio | Controles |
|--------|----------|
| inventario | Metadatos del repositorio, propiedad, clasificación. |
| calidad_del_código | Análisis estático, formato, complejidad. |
| seguridad_sast | Análisis estático, inyección, autenticación. |
| dependencias_sca | Análisis de vulnerabilidades, versiones. |
| licencias | Cumplimiento de licencias, compatibilidad. |
| secretos | Detección de secretos, rotación. |
| config_iac | Higiene de la infraestructura como código. |
| contenedores | Seguridad de la imagen, análisis. |
| ejecución | Manejo de errores, resistencia. |
| rendimiento | Perfilado, optimización. |
| observabilidad | Registro, seguimiento, métricas. |
| pruebas | Cobertura, tipos, integración de CI. |
| cicd | Seguridad de la canalización, puertas. |
| despliegue | Proceso de lanzamiento, reversión. |
| copia_seguridad_recuperacion | Planes de copia de seguridad, recuperación. |
| monitoreo | Alertas, tiempo de actividad. |
| cumplimiento_privacidad | Manejo de datos, RGPD. |
| cadena_de_suministro | SBOM, procedencia. |
| integraciones | Contratos de API, versionado. |

Cada ejecución de auditoría produce evidencia estructurada: resultados de los controles (aprobado/fallido/advertencia/no aplicable), hallazgos con severidad y remediación, y métricas agregadas. El estado se deriva automáticamente: **sano**, **necesita atención** o **crítico**.

## Orquestación multiagente: Los Juegos de Claude

repo-knowledge incluye plantillas para operaciones paralelas multi-Claude en grandes conjuntos de repositorios. Los Juegos de Claude coordinan múltiples agentes de IA a través de una lista de trabajo compartida:

1. **Paso de auditoría**: Cada agente reclama repositorios de la lista de trabajo, ejecuta la auditoría de 80 controles y envía resultados estructurados.
2. **Paso de enriquecimiento**: Los agentes agregan tesis, notas de arquitectura y mapeos de relaciones.
3. **Paso de remediación**: Los agentes corrigen los hallazgos utilizando un flujo de trabajo de 8 pasos con puntuación.

Consulte [`templates/claude-games/`](templates/claude-games/) para obtener el libro de jugadas completo.

## Modelo de datos

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

Todos los datos se almacenan en una sola base de datos SQLite con búsqueda de texto completo FTS en documentos, notas y descripciones de repositorios.

## Configuración

Cree el archivo `rk.config.json` en la raíz de su espacio de trabajo (o ejecute `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Todas las configuraciones provienen del archivo `rk.config.json` (creado por `rk init`). El servidor MCP también lee la configuración desde el directorio de trabajo.

## Licencia

[MIT](LICENSE)

---

Desarrollado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
