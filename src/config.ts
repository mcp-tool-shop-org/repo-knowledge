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

  return config;
}
