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

## ¿Por qué?

Los registros de paquetes y las API de GitHub te indican cuál es un repositorio. No te indican para qué sirve, cómo se relaciona con tus otros repositorios, cuál es su tesis arquitectónica o si superó tu última auditoría de seguridad. repo-knowledge llena ese vacío: una única base de datos local que contiene la tesis, la arquitectura, las pruebas de auditoría, las relaciones y la búsqueda de texto completo en todo ello.

## Instalación

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requisitos:**
- Node.js 20 o superior: el `engines.node` de este paquete es `>=20`. La lista de `engines` del complemento `better-sqlite3` bloqueado incluye las versiones principales del proveedor, y no pretende abarcar todas las versiones precompiladas.
- Interfaz de línea de comandos (CLI) `gh` (autenticada) para la sincronización de GitHub.
- Herramientas de compilación de C/C++ para `better-sqlite3` en caso de que falle una compilación previa. El script de instalación del complemento utiliza una ruta dual: `prebuild-install || node-gyp rebuild --release`. Se utiliza una compilación previa coincidente cuando está disponible; de lo contrario, `node-gyp` compila desde el código fuente. Esto no garantiza la compatibilidad con todas las plataformas. Si la instalación falla, consulte la [guía de solución de problemas](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md) en [better-sqlite3].

## Modelo de seguridad

**Datos afectados:** base de datos local SQLite, metadatos de la API GitHub a través de la CLI de `gh` (nombres de repositorios, descripciones, temas, estrellas; no se incluye el contenido del código fuente).

**Datos NO afectados:** no se lee ningún código fuente de GitHub, no se almacenan credenciales y no se envían datos a servicios externos.

**Permisos:** requiere que la CLI de `gh` esté autenticada para la sincronización de GitHub; todos los datos permanecen locales.

**Sin telemetría, sin análisis, sin comunicación con el servidor.**

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
| `rk init` | Inicializar la configuración, la base de datos y los controles de auditoría |
| `rk sync` | Sincronización completa: GitHub organizaciones + repositorios locales + índice FTS |
| `rk scan <path>` | Analizar un único directorio de repositorio local |
| `rk show <slug>` | Mostrar el conocimiento completo del repositorio con la postura de auditoría |
| `rk list` | Listar todos los repositorios (filtrables por estado, idioma, tipo) |
| `rk find <query>` | Búsqueda de texto completo en todo el contenido indexado |
| `rk related <slug>` | Mostrar los repositorios relacionados con un repositorio determinado |
| `rk note <slug>` | Agregar una nota tipificada (tesis, arquitectura, advertencia, etc.) con `--type` y `--content` (opcional `--title`); `--delete` retira una nota mediante `--type` + `--title` |
| `rk relate <from> <type> <to>` | Registrar una relación entre repositorios (opcional `--note`) |
| `rk stats` | Mostrar las estadísticas de la base de datos |
| `rk reindex` | Reconstruir el índice FTS |
| `rk sync-dogfood` | Sincronizar las pruebas de dogfood desde dogfood-lab/testing-os en los datos del repositorio |
| `rk suggest-dogfood --repo <slug>` | Sugerir hallazgos conocidos de dogfood para un repositorio o superficie |

> **`--json` donde sea relevante.** `list`, `find`, `show`, `related` y `stats`, además de las cinco lecturas de auditoría (`posture`, `findings`, `controls`, `unaudited`, `failing`), todas aceptan `--json` para obtener una salida legible por máquina. JSON es el contrato fundamental en los comandos principales: puedes dirigir cualquiera de ellos directamente a `jq`.

### Comandos del ciclo de vida (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk delete <slug> [--yes]` | Eliminar en cascada un repositorio y todas las filas secundarias |
| `rk archive <slug> [--reason <text>]` | Cambiar `lifecycle_status` a `archived` (conserva las notas/hallazgos) |
| `rk verify-local [--rig <id>] [--strict]` | Verificar que `local_path` existe por rig; actualiza `repo_local_paths` |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Registrar el rig actual |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Eliminar permanentemente los repositorios archivados hace más de N días (predeterminado: 30) |

### Comandos de estado de publicación (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Panel de control de versión publicada entre canales (npm/pypi/github_release) |
| `rk drift <slug> [--strict]` | Comparar la versión de la fuente de la verdad con la última versión del registro |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Establecedor de enlace manual |

### Comandos de estado (v2.0.0 — basados en la investigación)

| Comando | Descripción |
|---------|-------------|
| `rk health` (predeterminado = feed) | Cambiar el feed: deltas desde la última sincronización, intersección KEV, interrupciones de la secuencia de CI, desviación del pin de acción |
| `rk health doctor <slug>` | Análisis profundo de un solo repositorio (auditoría de dependencias, acciones de flujo de trabajo, señal de CI, cadena de herramientas) |
| `rk health table [--json\|--text]` | Tabla de estado del portafolio; JSON es el contrato fundamental |

### Comandos operativos (v2.0.0)

| Comando | Descripción |
|---------|-------------|
| `rk fsck [--strict] [--json]` | Comprobación de la integridad de la base de datos; escribe una fila de auditoría en `db_health_runs` |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Historial de cambios de entradas para un repositorio |
| `rk runs [--db-health\|--sync] [--limit <N>] [--json]` | Listar las entradas recientes de `db_health_runs` / `sync_runs` |
| `rk owners list` | Listar los propietarios configurados de GitHub |
| `rk owners add <owner>` | Agregar a los propietarios de `rk.config.json` |
| `rk owners remove <owner>` | Quitar de los propietarios de `rk.config.json` |

### Copia de seguridad, restauración y preverificación (v2.1.0)

| Comando | Descripción |
|---------|-------------|
| `rk backup [--out <path>]` | Crear una instantánea de la base de datos de conocimiento en una copia depurada (`VACUUM INTO`) en `data/backups/` o `--out` |
| `rk restore <path> [--yes]` | Restaurar la base de datos desde una instantánea: validación del esquema, intercambio atómico, confirmación obligatoria (rechaza una copia de seguridad con un esquema más reciente) |
| `rk doctor [--json] [--strict]` | Preverificación del entorno: configuración, base de datos, versión del esquema, autenticación de `gh`, rig actual, ejecuciones recientes de sincronización/fsck |
| `rk config [--json]` | Mostrar la configuración efectiva resuelta con el origen de cada campo |
| `rk config validate [--json]` | Validar `rk.config.json`; sale con un código de error distinto de cero si hay propietarios de marcador de posición, formas incorrectas o rutas irresolubles |

### Clasificación (v2.1.1)

| Comando | Descripción |
|---------|-------------|
| `rk classify <slug> [--status <s>] [--stage <s>] [--category <c>]` | Establecer los campos del ciclo de vida seleccionados: `status` (`active`/`paused`/`archived`/`unknown`), `stage` de formato libre (por ejemplo, `shipped`, `Phase 1`) y `category` (`product`/`tool`/`library`/`experiment`/`blueprint`/`marketing`). Estos no se rellenan con `sync` o `scan`; pasa `""` para borrar `stage`/`category` |

### Comandos de auditoría

| Comando | Descripción |
|---------|-------------|
| `rk audit seed-controls` | Sembrar/actualizar el catálogo canónico de 80 controles |
| `rk audit import <dir>` | Importar los resultados de la auditoría desde archivos con contrato JSON |
| `rk audit posture [slug]` | Mostrar la postura de auditoría de un repositorio o de todo el portafolio |
| `rk audit findings` | Listar los hallazgos abiertos en todo el portafolio |
| `rk audit controls` | Listar los controles canónicos por dominio |
| `rk audit unaudited` | Listar los repositorios que no tienen ejecuciones de auditoría |
| `rk audit failing <domain>` | Listar los repositorios que no superan un dominio de auditoría específico |

### Comandos de juegos

| Comando | Descripción |
|---------|-------------|
| `rk games score <worklist>` | Calificar un REMEDIATION-WORKLIST.md y mostrar la clasificación |

## Servidor MCP

El servidor MCP expone 30 herramientas para flujos de trabajo integrados con IA. Agregue esto a la configuración de su cliente MCP:

**Claude Code (`.claude.json` con ámbito de proyecto):**
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

El servidor lee `rk.config.json` del directorio de trabajo al inicio. Asegúrate de que `rk.config.json` exista en el directorio donde se ejecuta el servidor.

### Herramientas MCP

**Conocimiento y sincronización:**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**Auditoría:**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**Evaluación de la salud del entorno** (solo lecturas de la base de datos, sin actualización de la red):
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
| dependencias_sca | Análisis de vulnerabilidades, actualidad |
| licencias | Cumplimiento de la licencia, compatibilidad |
| secretos | Detección de secretos, rotación |
| config_iac | Higiene de la infraestructura como código |
| contenedores | Seguridad de la imagen, análisis |
| tiempo_de_ejecucion | Manejo de errores, resiliencia |
| rendimiento | Perfilado, optimización |
| observabilidad | Registro, seguimiento, métricas |
| pruebas | Cobertura, tipos, integración de CI |
| cicd | Seguridad de la canalización, puertas de enlace |
| despliegue | Proceso de lanzamiento, reversión |
| copia_de_seguridad_dr | Planes de copia de seguridad, recuperación |
| monitoreo | Alertas, tiempo de actividad |
| cumplimiento_privacidad | Manejo de datos, RGPD |
| cadena_de_suministro | SBOM, procedencia |
| integraciones | Contratos de API, control de versiones |

Cada ejecución de auditoría produce evidencia estructurada: resultados de los controles (aprobado/fallido/advertencia/no aplicable), hallazgos con gravedad y remediación, y métricas agregadas. El estado se deriva automáticamente: **saludable**, **necesita atención** o **crítico**.

## Orquestación multiagente: Los juegos de Claude

repo-knowledge incluye plantillas para operaciones paralelas multi-Claude en grandes carteras. Los juegos de Claude coordinan múltiples agentes de IA a través de una lista de tareas compartida:

1. **Paso de auditoría:** Cada agente selecciona repositorios de la lista de tareas, ejecuta la auditoría de 80 controles y envía los resultados estructurados.
2. **Paso de enriquecimiento:** Los agentes agregan tesis, notas de arquitectura y mapeos de relaciones.
3. **Paso de remediación:** Los agentes corrigen los hallazgos utilizando un flujo de trabajo de 8 pasos con puntuación.

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

Cree `rk.config.json` en la raíz de su espacio de trabajo (o ejecute `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Toda la configuración proviene de `rk.config.json` (creado por `rk init`). El servidor MCP también lee la configuración del directorio de trabajo.

## Licencia

[MIT](LICENSE)

---

Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
