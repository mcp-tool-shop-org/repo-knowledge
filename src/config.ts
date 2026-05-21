import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
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

  // 3. Apply explicit overrides — but only fields the caller explicitly
  //    passed. The naive `{ ...config, ...overrides }` clobbered any
  //    field set to `undefined` in the overrides object (e.g. when CLI
  //    sync forwards an unset --owners flag through SyncConfig), wiping
  //    the file-supplied owners. FT-5 fix: skip undefined fields so the
  //    file-provided value wins.
  if (overrides) {
    for (const k of Object.keys(overrides) as (keyof RkConfig)[]) {
      const v = overrides[k];
      if (v !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any)[k] = v;
      }
    }
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

// ─── FT-5: rk.config.json read / atomic write helpers ───────────────────────

/**
 * Path to the rk.config.json in the current working directory. Centralized
 * so both reader and writer use the same resolution rule.
 */
function configPath(): string {
  return join(process.cwd(), 'rk.config.json');
}

/**
 * Read the raw rk.config.json (un-merged with defaults). Returns an
 * empty object if the file is missing OR malformed — the caller decides
 * whether to treat that as an error (the owners-write helpers create a
 * fresh shape when missing, which matches `rk init`'s template).
 */
export function readRkConfigFile(): Partial<RkConfig> {
  const p = configPath();
  if (!existsSync(p)) return {};
  try {
    const parsed = JSON.parse(readFileSync(p, 'utf-8'));
    return parsed && typeof parsed === 'object' ? parsed as Partial<RkConfig> : {};
  } catch {
    return {};
  }
}

/**
 * Write rk.config.json atomically (write to <path>.tmp, then rename).
 * The rename is atomic on POSIX and on NTFS (Windows); a crash mid-write
 * cannot corrupt the original file — at worst a stale .tmp is left
 * behind, which subsequent runs ignore.
 *
 * The full merged config is written in stable key order so diffs stay
 * readable. Trailing newline matches `rk init`.
 */
export function writeRkConfigFile(next: Partial<RkConfig>): void {
  const p = configPath();
  // Preserve any unknown keys in the existing file (forward compatibility
  // with future config additions written by other tooling). Read the raw
  // file again rather than reusing readRkConfigFile so any caller-side
  // typing constraint doesn't strip keys.
  const existing = readRkConfigFile() as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...existing };
  for (const [k, v] of Object.entries(next)) {
    merged[k] = v;
  }
  const tmp = p + '.tmp';
  writeFileSync(tmp, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  renameSync(tmp, p);
}

/**
 * Read the current owners list from rk.config.json. Falls back to the
 * DEFAULTS.owners value (empty array) if the file is missing or the
 * `owners` key is absent. Always returns a fresh array (callers may
 * mutate the result).
 */
export function listOwners(): string[] {
  const file = readRkConfigFile();
  const owners = Array.isArray(file.owners) ? file.owners.slice() : [];
  return owners;
}

/**
 * Add an owner to rk.config.json. Returns `{ added: false }` if the
 * owner was already in the list (case-sensitive match — GitHub owner
 * names are case-insensitive at the API layer but the on-disk shape
 * preserves the operator's spelling, so we don't fold case).
 *
 * Persisted atomically via writeRkConfigFile.
 */
export function addOwner(owner: string): { added: boolean; owners: string[] } {
  const file = readRkConfigFile();
  const owners = Array.isArray(file.owners) ? file.owners.slice() : [];
  if (owners.includes(owner)) return { added: false, owners };
  owners.push(owner);
  writeRkConfigFile({ ...file, owners });
  return { added: true, owners };
}

/**
 * Remove an owner from rk.config.json. Returns `{ removed: false }` if
 * the owner was not present (case-sensitive).
 */
export function removeOwner(owner: string): { removed: boolean; owners: string[] } {
  const file = readRkConfigFile();
  const owners = Array.isArray(file.owners) ? file.owners.slice() : [];
  const idx = owners.indexOf(owner);
  if (idx === -1) return { removed: false, owners };
  owners.splice(idx, 1);
  writeRkConfigFile({ ...file, owners });
  return { removed: true, owners };
}
