<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## ¿Por qué?

Los registros de paquetes y las API de GitHub te indican cuál es la naturaleza de un repositorio. No te dicen para qué sirve, cómo se relaciona con tus otros repositorios, cuál es su tesis arquitectónica o si superó tu última auditoría de seguridad. Repo-knowledge llena ese vacío: una única base de datos local que contiene la tesis, la arquitectura, las pruebas de auditoría, las relaciones y la búsqueda de texto completo en todo ello.

## Instalación

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisitos:**
- Node.js 20+
- CLI `gh` (autenticado) para la sincronización con GitHub
- Herramientas de compilación de C/C++ para `better-sqlite3`, o se utilizarán automáticamente binarios precompilados en las plataformas compatibles.

## Modelo de seguridad

**Datos afectados:** base de datos SQLite local, metadatos de la API de GitHub a través de la CLI `gh` (nombres de repositorios, descripciones, temas, estrellas; no se accede al contenido del código fuente).

**Datos NO afectados:** no se lee ningún código fuente de GitHub, no se almacenan credenciales y no se envían datos a servicios externos.

**Permisos:** requiere que la CLI `gh` esté autenticada para la sincronización con GitHub; todos los datos permanecen locales.

**Sin telemetría, sin análisis, sin comunicación con servidores externos.**

## Primeros pasos

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
| `rk init` | Inicializar la configuración, la base de datos y los controles de auditoría. |
| `rk sync` | Sincronización completa: organizaciones de GitHub + repositorios locales + índice FTS. |
| `rk scan <path>` | Analizar un único directorio de repositorio local. |
| `rk show <slug>` | Mostrar el conocimiento completo del repositorio con la postura de auditoría. |
| `rk list` | Listar todos los repositorios (filtrables por estado, lenguaje, estructura). |
| `rk find <query>` | Búsqueda de texto completo en todo el contenido indexado. |
| `rk related <slug>` | Mostrar los repositorios relacionados con un repositorio determinado. |
| `rk note <slug>` | Agregue una nota escrita (tesis, arquitectura, advertencia, etc.) con `--type` y `--content` (opcionalmente `--title`); `--delete` elimina una nota mediante `--type` + `--title`. |
| `rk relate <from> <type> <to>` | Registrar una relación entre repositorios (opcionalmente `--note`). |
| `rk stats` | Mostrar las estadísticas de la base de datos. |
| `rk reindex` | Reconstruir el índice FTS. |
| `rk sync-dogfood` | Sincronizar pruebas del proyecto dogfood-lab/testing-os en los datos del repositorio. |
| `rk suggest-dogfood --repo <slug>` | Sugerir hallazgos conocidos de dogfood para un repositorio o superficie. |

> **`--json` donde sea relevante.** `list`, `find`, `show`, `related` y `stats`, además de las cinco lecturas de auditoría (`posture`, `findings`, `controls`, `unaudited`, `failing`), todas aceptan `--json` para obtener una salida legible por máquina. JSON es el contrato fundamental en los comandos principales: puedes dirigir la salida de cualquiera de ellos directamente a `jq`.

### Comandos del ciclo de vida (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk delete <slug> [--yes]` | Eliminar en cascada un repositorio y todas sus filas secundarias. |
| `rk archive <slug> [--reason <text>]` | Cambiar el valor de `lifecycle_status` a `archived` (conserva las notas/hallazgos). |
| `rk verify-local [--rig <id>] [--strict]` | Verificar que exista `local_path` por entorno; actualiza `repo_local_paths`. |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registrar el entorno actual. |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Eliminar de forma definitiva los repositorios archivados hace más de N días (por defecto, 30). |

### Comandos del estado de publicación (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Panel de control de versiones publicadas en varios canales (npm/pypi/github_release). |
| `rk drift <slug> [--strict]` | Comparar la versión de origen de la verdad con la última versión del registro. |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Configurador manual de enlaces. |

### Comandos de estado (v2.0.0, basados en investigaciones)

| Comando | Descripción |
|---------|-------------|
| `rk health` (por defecto = feed). | Cambiar el feed: cambios desde la última sincronización, intersección KEV, interrupciones de la secuencia de CI, desviación del pin de acción. |
| `rk health doctor <slug>` | Análisis profundo de un solo repositorio (auditoría de dependencias, acciones de flujo de trabajo, señal de CI, cadena de herramientas). |
| `rk health table [--json\ | --text]` | Tabla de estado del portafolio; JSON es el contrato fundamental. |

### Comandos operativos (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Verificación de la integridad de la base de datos; escribe una fila de auditoría en `db_health_runs`. |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Historial de cambios de entrada para un repositorio. |
| `rk runs [--db-health\ | --sync] [--limit <N>] [--json]` | Listar las entradas recientes de `db_health_runs` / `sync_runs`. |
| `rk owners list` | Listar los propietarios configurados de GitHub. |
| `rk owners add <owner>` | Agregar propietarios a `rk.config.json`. |
| `rk owners remove <owner>` | Eliminar propietarios de `rk.config.json`. |

### Copia de seguridad, restauración y preverificación (v2.1.0)

| Comando | Descripción |
|---------|-------------|
| `rk backup [--out <path>]` | Crear una instantánea de la base de datos del conocimiento en una copia "vacuumed" (`VACUUM INTO`) en `data/backups/` o `--out`. |
| `rk restore <path> [--yes]` | Restaurar la base de datos a partir de una instantánea: validación del esquema, intercambio atómico, confirmación obligatoria (rechaza una copia de seguridad con un esquema más reciente). |
| `rk doctor [--json] [--strict]` | Preverificación del entorno: configuración, base de datos, versión del esquema, autenticación de `gh`, entorno actual, ejecuciones recientes de sincronización/fsck. |
| `rk config [--json]` | Mostrar la configuración efectiva resuelta con el origen de cada campo. |
| `rk config validate [--json]` | Validar `rk.config.json`: se detiene si hay propietarios marcadores de posición, estructuras incorrectas o rutas irresolubles. |

### Clasificación (v2.1.1)

| Comando | Descripción |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | Establezca los campos del ciclo de vida seleccionados: `status` (`active`/`paused`/`archived`/`unknown`), `stage` de formato libre (por ejemplo, `shipped`, `Phase 1`) y `category` (`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`). Estos campos no se rellenan con `sync` o `scan`; utilice `""` para borrar `stage`/`category`. |

### Comandos de auditoría

| Comando | Descripción |
|---------|-------------|
| `rk audit seed-controls` | Crear/actualizar el catálogo canónico de 80 controles. |
| `rk audit import <dir>` | Importar los resultados de la auditoría desde archivos con formato JSON. |
| `rk audit posture [slug]` | Mostrar la postura de auditoría para un repositorio o todo el portafolio. |
| `rk audit findings` | Listar los hallazgos abiertos en todo el portafolio. |
| `rk audit controls` | Listar los controles canónicos por dominio. |
| `rk audit unaudited` | Listar los repositorios que no tienen ejecuciones de auditoría. |
| `rk audit failing <domain>` | Listar los repositorios que fallan en un dominio de auditoría específico. |

### Comandos de juegos

| Comando | Descripción |
|---------|-------------|
| `rk games score <worklist>` | Calificar un archivo REMEDIATION-WORKLIST.md y mostrar la tabla de clasificación. |

## Servidor MCP

El servidor MCP expone 30 herramientas para flujos de trabajo integrados con IA. Agrégalo a la configuración de tu cliente MCP:

**Claude Code (ámbito del proyecto `.claude.json`):**
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

El servidor lee `rk.config.json` desde el directorio de trabajo al inicio. Asegúrate de que `rk.config.json` exista en el directorio donde se ejecuta el servidor.

### Herramientas MCP

**Conocimiento y sincronización:**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**Auditoría:**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**Salud del entorno de desarrollo** (solo lecturas desde la base de datos, sin actualización de red):
`health_feed` `health_doctor` `health_portfolio`

**Higiene operativa:**
`db_fsck` `repo_diff` `ops_runs`

**Ciclo de vida y publicación:**
`archive_repo` `delete_repo` `repo_versions`

**Pruebas internas y simulacro de auditoría:**
`suggest_dogfood` `audit_failing`

## Marco de auditoría

El sistema de auditoría cubre 19 dominios con 80 controles:

| Dominio | Controles |
|--------|----------|
| inventario | Metadatos del repositorio, propiedad, clasificación |
| calidad_del_codigo | Análisis de código estático, formato, complejidad |
| seguridad_sast | Análisis estático, inyección, autenticación |
| dependencias_sca | Escaneo de vulnerabilidades, actualidad |
| licencias | Cumplimiento de licencias, compatibilidad |
| secretos | Detección de secretos, rotación |
| config_iac | Higiene de la infraestructura como código |
| contenedores | Seguridad de la imagen, escaneo |
| tiempo_de_ejecucion | Manejo de errores, resiliencia |
| rendimiento | Perfilado, optimización |
| observabilidad | Registro, seguimiento, métricas |
| pruebas | Cobertura, tipos, integración de CI |
| cicd | Seguridad del flujo de trabajo, puertas de enlace |
| despliegue | Proceso de lanzamiento, reversión |
| copia_de_seguridad_dr | Planes de copia de seguridad, recuperación |
| monitoreo | Alertas, tiempo de actividad |
| cumplimiento_privacidad | Manejo de datos, RGPD |
| cadena_de_suministro | SBOM, procedencia |
| integraciones | Contratos API, control de versiones |

Cada ejecución de auditoría produce evidencia estructurada: resultados de los controles (aprobado/fallido/advertencia/no aplicable), hallazgos con gravedad y remediación, y métricas agregadas. La situación se deriva automáticamente: **saludable**, **necesita atención** o **crítica**.

## Orquestación multiagente: Los juegos de Claude

repo-knowledge incluye plantillas para operaciones paralelas multi-Claude en grandes portafolios. Los juegos de Claude coordinan múltiples agentes de IA a través de una lista de tareas compartida:

1. **Fase de auditoría:** Cada agente selecciona repositorios de la lista de tareas, ejecuta la auditoría con los 80 controles y envía los resultados estructurados.
2. **Fase de enriquecimiento:** Los agentes añaden tesis, notas sobre la arquitectura y mapeos de relaciones.
3. **Fase de remediación:** Los agentes corrigen los hallazgos utilizando un flujo de trabajo de 8 pasos con puntuación.

Consulte [`templates/claude-games/`](templates/claude-games/) para obtener el manual completo.

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

Todos los datos se almacenan en una única base de datos SQLite con búsqueda de texto completo FTS5 en documentos, notas y descripciones de repositorios.

## Configuración

Cree `rk.config.json` en el directorio raíz de su espacio de trabajo (o ejecute `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Todos los ajustes provienen de `rk.config.json` (creado por `rk init`). El servidor MCP también lee la configuración desde el directorio de trabajo.

## Licencia

[MIT](LICENSE)

---

Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
