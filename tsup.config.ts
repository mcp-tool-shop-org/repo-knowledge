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
  esbuildOptions(options, context) {
    if (context.format === 'esm') {
      options.banner = {
        js: context.format === 'esm' ? '' : '',
      };
    }
  },
});
