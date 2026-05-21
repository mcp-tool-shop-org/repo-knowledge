import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface RkConfig {
  dbPath: string;
  owners: string[];
  localDirs: string[];
  artifactsRoot: string;
}

const DEFAULTS: RkConfig = {
  dbPath: join(process.cwd(), 'data', 'knowledge.db'),
  owners: [],
  localDirs: ['.'],
  artifactsRoot: join(process.cwd(), 'data', 'artifacts'),
};

export function resolveConfig(overrides?: Partial<RkConfig>): RkConfig {
  // 1. Start with defaults
  let config = { ...DEFAULTS };

  // 2. Load rk.config.json from CWD if it exists
  const configPath = join(process.cwd(), 'rk.config.json');
  if (existsSync(configPath)) {
    try {
      const file = JSON.parse(readFileSync(configPath, 'utf-8'));
      config = { ...config, ...file };
    } catch { /* ignore malformed config */ }
  }

  // 3. Apply explicit overrides
  if (overrides) {
    config = { ...config, ...overrides };
  }

  // Resolve relative paths
  config.dbPath = resolve(config.dbPath);
  config.artifactsRoot = resolve(config.artifactsRoot);
  config.localDirs = config.localDirs.map(d => resolve(d));

  // F-BE-023: path-traversal advisory. We don't block — users may legitimately
  // want to scan a sibling tree (e.g., F:/AI from a repo under E:/AI/...). But
  // emit a stderr line so a localDir that escapes CWD via `..` is visible at
  // resolve time and not just buried in scan output.
  const cwd = process.cwd();
  for (const resolved of config.localDirs) {
    if (!isInside(cwd, resolved)) {
      console.error(`[rk] Warning: localDir resolves outside CWD: ${resolved}`);
    }
  }

  return config;
}

// True iff `child` is `parent` or a descendant of `parent`. Avoids the
// startsWith() false-positive where /foo/barbaz appears to be inside /foo/bar.
function isInside(parent: string, child: string): boolean {
  if (parent === child) return true;
  const sep = parent.endsWith('/') || parent.endsWith('\\') ? '' : '/';
  const withSep = parent + sep;
  const withBackSep = parent + (sep === '' ? '' : '\\');
  return child.startsWith(withSep) || child.startsWith(withBackSep);
}
