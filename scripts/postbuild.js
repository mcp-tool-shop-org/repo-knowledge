import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

mkdirSync(join(root, 'dist', 'db'), { recursive: true });

// F-CD-002: discover SQL files dynamically rather than maintaining a
// hardcoded list. Hardcoding meant every new migration required a
// matching postbuild edit; missing one would ship a published package
// without the migration file and only fail at runtime on the first
// fresh install. Now any .sql file in src/db/ gets copied on build.
const srcDbDir = join(root, 'src', 'db');
const sqlFiles = readdirSync(srcDbDir).filter(f => f.endsWith('.sql'));
for (const f of sqlFiles) {
  cpSync(join(srcDbDir, f), join(root, 'dist', 'db', f));
}

console.log(`Copied ${sqlFiles.length} SQL files to dist/db/`);
