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

/**
 * Strip keys whose value is `undefined` so they don't clobber lower-precedence
 * sources during a spread. Without this, a caller passing `{ dbPath: undefined }`
 * silently erases the default and downstream `path.resolve(undefined)` crashes —
 * a failure mode that escaped detection until 2026-05-01 because the rejection
 * was swallowed by commander's sync parse path.
 */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj) as Array<[keyof T, T[keyof T]]>) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function resolveConfig(overrides?: Partial<RkConfig>): RkConfig {
  // 1. Start with defaults
  let config: RkConfig = { ...DEFAULTS };

  // 2. Load rk.config.json from CWD if it exists
  const configPath = join(process.cwd(), 'rk.config.json');
  if (existsSync(configPath)) {
    try {
      const file = JSON.parse(readFileSync(configPath, 'utf-8'));
      config = { ...config, ...stripUndefined(file) };
    } catch { /* ignore malformed config */ }
  }

  // 3. Apply explicit overrides (ignoring undefined values so callers can
  //    safely pass through optional CLI flags without erasing defaults)
  if (overrides) {
    config = { ...config, ...stripUndefined(overrides) };
  }

  // Validate required fields loudly. Anything that slips past stripUndefined
  // (e.g. an explicit `null` from a malformed config file) should fail here
  // rather than at a generic `path.resolve` call site.
  if (typeof config.dbPath !== 'string' || config.dbPath.length === 0) {
    throw new Error(
      `resolveConfig: dbPath must be a non-empty string (got ${typeof config.dbPath}). ` +
      `Check rk.config.json or the override passed to resolveConfig().`
    );
  }
  if (typeof config.artifactsRoot !== 'string' || config.artifactsRoot.length === 0) {
    throw new Error(
      `resolveConfig: artifactsRoot must be a non-empty string (got ${typeof config.artifactsRoot}).`
    );
  }
  if (!Array.isArray(config.localDirs)) {
    throw new Error(
      `resolveConfig: localDirs must be an array (got ${typeof config.localDirs}).`
    );
  }

  // Resolve relative paths
  config.dbPath = resolve(config.dbPath);
  config.artifactsRoot = resolve(config.artifactsRoot);
  config.localDirs = config.localDirs.map(d => resolve(d));

  return config;
}
