import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    'mcp/server': 'src/mcp/server.ts',
  },
  format: ['esm'],
  dts: {
    // tsup forces `baseUrl: "."` into its declaration build (8.5.1,
    // dist/rollup.js: `baseUrl: compilerOptions.baseUrl || "."`), and
    // TypeScript 6 fails any baseUrl as deprecated (TS5101). tsconfig.json
    // sets no baseUrl, and `npm run typecheck` still fails on deprecated
    // options there — this silences only tsup's own injection. It does not
    // carry to TypeScript 7, where baseUrl stops working.
    compilerOptions: { ignoreDeprecations: '6.0' },
  },
  clean: true,
  sourcemap: true,
  target: 'node20',
  splitting: false,
  external: ['better-sqlite3'],
  // No esbuild banner: the CLI shebang comes from src/cli.ts line 1, and
  // esm is the only format — a banner block here would be a dead no-op.
});
