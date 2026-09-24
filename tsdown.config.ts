import { defineConfig, type UserConfig } from 'tsdown';

// One build per entry, so no code is hoisted into shared chunk files
// (tsup's `splitting: false`). The layout is load-bearing: src/cli.ts and
// src/mcp/server.ts resolve package.json relative to their own bundle
// through createRequire(import.meta.url).
function entry(name: string, source: string, onlyBundle: string[] = []): UserConfig {
  return {
    entry: { [name]: source },
    format: 'esm',
    platform: 'node',
    target: 'node20',
    sourcemap: true,
    dts: true,
    // .js / .d.ts rather than the node-platform default .mjs / .d.mts:
    // package.json's main, types, bin and exports all name .js files.
    fixedExtension: false,
    // A package from node_modules that is bundled without being listed in
    // onlyBundle fails the build.
    deps: { neverBundle: ['better-sqlite3'], onlyBundle },
    // No CLI shebang option: rolldown keeps it from src/cli.ts line 1.
  };
}

export default defineConfig([
  entry('index', 'src/index.ts'),
  entry('cli', 'src/cli.ts'),
  // src/mcp/server.ts imports zod, which arrives through
  // @modelcontextprotocol/sdk rather than as a declared dependency, so it is
  // bundled here, as tsup also did.
  entry('mcp/server', 'src/mcp/server.ts', ['zod']),
]);
