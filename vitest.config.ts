import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // F-TS-016: games was previously excluded because no scorer tests existed.
      // Stage A added games.test.ts which covers parser/scorer/render; the
      // module is now included so its coverage counts toward the floor.
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      // Thresholds keep test rot from silently lowering the floor. Pick numbers
      // that the current suite clears comfortably; raise them as the suite grows.
      thresholds: {
        lines: 50,
        branches: 40,
        functions: 50,
      },
    },
  },
});
