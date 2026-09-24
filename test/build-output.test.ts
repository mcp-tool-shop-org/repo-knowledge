/**
 * Pins the shape of the build in dist/, which the published package is.
 *
 * Gates on dist/ itself rather than on dist/cli.js: the suites that run the
 * CLI and the MCP server skip when their entry file is missing, so a build
 * that emitted differently named files (.mjs, a shared chunk) would
 * otherwise pass with those suites silently skipped.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));

const describeIfBuilt = existsSync(DIST) ? describe : describe.skip;

function filesUnder(dir: string): string[] {
  return (readdirSync(dir, { recursive: true }) as string[])
    .filter((p) => statSync(join(dir, p)).isFile())
    .map((p) => p.split('\\').join('/'))
    .sort();
}

describeIfBuilt('build output', () => {
  it('emits every file package.json points at', () => {
    const targets: string[] = [
      pkg.main,
      pkg.types,
      ...Object.values(pkg.bin as Record<string, string>),
      ...Object.values(pkg.exports as Record<string, Record<string, string>>)
        .flatMap((conditions) => Object.values(conditions)),
    ];
    for (const target of targets) {
      expect(existsSync(join(ROOT, target)), target).toBe(true);
    }
  });

  it('emits one self-contained bundle per entry and no shared chunks', () => {
    // src/cli.ts and src/mcp/server.ts resolve package.json relative to their
    // own bundle, so code moved into a chunk would resolve the wrong file.
    const emitted = filesUnder(DIST).filter((f) => !f.startsWith('db/'));
    expect(emitted).toEqual([
      'cli.d.ts', 'cli.js', 'cli.js.map',
      'index.d.ts', 'index.js', 'index.js.map',
      'mcp/server.d.ts', 'mcp/server.js', 'mcp/server.js.map',
    ]);
  });

  it('keeps the shebang on the rk bin', () => {
    const bin = readFileSync(join(ROOT, pkg.bin.rk), 'utf-8');
    expect(bin.startsWith('#!/usr/bin/env node\n')).toBe(true);
  });

  it('bundles the declarations: no relative import survives', () => {
    // A relative specifier in a published .d.ts must carry an extension to
    // resolve under NodeNext; a bundled file carries none.
    for (const file of ['index.d.ts', 'cli.d.ts', 'mcp/server.d.ts']) {
      const dts = readFileSync(join(DIST, file), 'utf-8');
      expect(dts, file).not.toMatch(/(?:from|import)\s*\(?\s*['"]\.\.?\//);
    }
  });

  it('ships every SQL file from src/db next to the bundles', () => {
    const sql = readdirSync(join(ROOT, 'src', 'db')).filter((f) => f.endsWith('.sql')).sort();
    expect(sql.length).toBeGreaterThan(0);
    expect(filesUnder(join(DIST, 'db'))).toEqual(sql);
  });
});
