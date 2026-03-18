import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

mkdirSync(join(root, 'dist', 'db'), { recursive: true });

const sqlFiles = ['schema.sql', 'migration-002-audit.sql', 'migration-003-metrics-v2.sql'];
for (const f of sqlFiles) {
  cpSync(join(root, 'src', 'db', f), join(root, 'dist', 'db', f));
}

console.log(`Copied ${sqlFiles.length} SQL files to dist/db/`);
