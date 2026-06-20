import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    'mcp/server': 'src/mcp/server.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  splitting: false,
  external: ['better-sqlite3'],
  // No esbuild banner: the CLI shebang comes from src/cli.ts line 1, and
  // esm is the only format — a banner block here would be a dead no-op.
});
