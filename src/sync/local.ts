/**
 * Local repo scanner — reads package files, README, docs to extract knowledge.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import {
  upsertRepo, upsertTech, upsertFact, upsertDoc,
} from '../db/init.js';

export interface TechProfile {
  primary_language: string | null;
  languages: Record<string, boolean>;
  frameworks: string[];
  runtime: string | null;
  platform_targets: string[];
  package_manager: string | null;
  app_shape: string | null;
  deployment_shape: string | null;
}

export interface DocEntry {
  path: string;
  doc_type: string;
  title: string;
  content: string;
  checksum: string;
}

export interface ScannedRepo {
  owner: string;
  name: string;
  local_path: string;
  github_url: string | null;
  tech: TechProfile;
  docs: DocEntry[];
}

export interface ScanResult {
  scanned: number;
  skipped: number;
  errors: string[];
}

export interface IngestResult {
  repoId: number | bigint;
  name: string;
  docs: number;
}

function md5(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

function tryReadJson(path: string): any | null {
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
}

function tryReadText(path: string, maxBytes: number = 200_000): string | null {
  try {
    const stat = statSync(path);
    if (stat.size > maxBytes) return null;
    return readFileSync(path, 'utf-8');
  } catch { return null; }
}

/**
 * Detect the git remote URL to match with GitHub repos.
 */
function getGitRemote(repoPath: string): string | null {
  try {
    const result = execSync('git remote get-url origin', {
      cwd: repoPath, encoding: 'utf-8', timeout: 5000
    }).trim();
    return result;
  } catch { return null; }
}

/**
 * Extract owner/name from a GitHub remote URL.
 */
function parseRemote(url: string | null): { owner: string; name: string } | null {
  if (!url) return null;
  // SSH: git@github.com:owner/name.git
  const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (m) return { owner: m[1], name: m[2] };
  return null;
}

/**
 * Scan a single local repo directory and extract knowledge.
 */
export function scanLocalRepo(repoPath: string): ScannedRepo {
  if (!existsSync(repoPath)) {
    throw new Error(`Path not found: ${repoPath}`);
  }

  const remote = getGitRemote(repoPath);
  const parsed = parseRemote(remote);
  const repoName = parsed?.name || basename(repoPath);
  const repoOwner = parsed?.owner || 'local';

  const tech = detectTech(repoPath);
  const docs = indexDocs(repoPath);

  return {
    owner: repoOwner,
    name: repoName,
    local_path: repoPath,
    github_url: remote?.includes('github.com') ? `https://github.com/${repoOwner}/${repoName}` : null,
    tech,
    docs,
  };
}

/**
 * Detect tech stack from manifest files.
 */
export function detectTech(repoPath: string): TechProfile {
  const tech: TechProfile = {
    primary_language: null,
    languages: {},
    frameworks: [],
    runtime: null,
    platform_targets: [],
    package_manager: null,
    app_shape: null,
    deployment_shape: null,
  };

  // ── Node.js ──────────────────────────────────
  const pkg = tryReadJson(join(repoPath, 'package.json'));
  if (pkg) {
    tech.package_manager = existsSync(join(repoPath, 'pnpm-lock.yaml')) ? 'pnpm'
      : existsSync(join(repoPath, 'yarn.lock')) ? 'yarn' : 'npm';
    tech.runtime = 'node';

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const depNames = Object.keys(allDeps);

    if (depNames.includes('react')) tech.frameworks.push('react');
    if (depNames.includes('vue')) tech.frameworks.push('vue');
    if (depNames.includes('svelte')) tech.frameworks.push('svelte');
    if (depNames.includes('next')) tech.frameworks.push('next');
    if (depNames.includes('astro')) tech.frameworks.push('astro');
    if (depNames.includes('express')) tech.frameworks.push('express');
    if (depNames.includes('@tauri-apps/api') || depNames.includes('@tauri-apps/cli'))
      tech.frameworks.push('tauri');
    if (depNames.includes('electron')) tech.frameworks.push('electron');
    if (depNames.includes('@modelcontextprotocol/sdk')) tech.frameworks.push('mcp-sdk');
    if (depNames.includes('better-sqlite3')) tech.frameworks.push('sqlite');
    if (depNames.includes('commander') || depNames.includes('yargs'))
      tech.app_shape = tech.app_shape || 'cli';

    // Detect app shape from package.json
    if (pkg.bin) tech.app_shape = tech.app_shape || 'cli';
    if (tech.frameworks.includes('tauri')) {
      tech.app_shape = 'desktop';
      tech.platform_targets.push('windows', 'macos', 'linux');
    }
    if (tech.frameworks.includes('electron')) {
      tech.app_shape = 'desktop';
      tech.platform_targets.push('windows', 'macos', 'linux');
    }
    if (tech.frameworks.includes('astro') || tech.frameworks.includes('next')) {
      tech.app_shape = tech.app_shape || 'web';
    }
    if (tech.frameworks.includes('mcp-sdk')) {
      tech.app_shape = tech.app_shape || 'mcp-server';
    }

    // Deployment shape
    if (pkg.publishConfig || pkg.name?.startsWith('@')) {
      tech.deployment_shape = 'npm';
    }

    tech.languages.JavaScript = true;
    if (depNames.includes('typescript') || existsSync(join(repoPath, 'tsconfig.json'))) {
      tech.languages.TypeScript = true;
      tech.primary_language = 'TypeScript';
    } else {
      tech.primary_language = 'JavaScript';
    }
  }

  // ── Tauri detection (multiple possible locations) ──
  const tauriPaths = [
    join(repoPath, 'src-tauri', 'Cargo.toml'),
    join(repoPath, 'apps', 'desktop', 'src-tauri', 'Cargo.toml'),
    join(repoPath, 'app', 'src-tauri', 'Cargo.toml'),
  ];
  const foundTauri = tauriPaths.find(p => existsSync(p));
  if (foundTauri) {
    tech.frameworks.push('tauri');
    tech.languages.Rust = true;
    tech.app_shape = 'desktop';
    tech.platform_targets.push('windows', 'macos', 'linux');
  }

  // ── Rust / Cargo ──────────────────────────────
  const cargoToml = tryReadText(join(repoPath, 'Cargo.toml'));
  if (cargoToml) {
    tech.languages.Rust = true;
    if (!tech.primary_language || !pkg) tech.primary_language = 'Rust';
    if (!tech.package_manager) tech.package_manager = 'cargo';
    tech.runtime = tech.runtime || 'native';

    if (cargoToml.includes('tauri')) tech.frameworks.push('tauri');
    if (cargoToml.includes('axum')) tech.frameworks.push('axum');
    if (cargoToml.includes('tokio')) tech.frameworks.push('tokio');
    if (!tech.app_shape) {
      if (cargoToml.includes('[lib]')) tech.app_shape = 'library';
      else tech.app_shape = 'cli';
    }
    tech.deployment_shape = tech.deployment_shape || 'cargo';
  }

  // ── Python ────────────────────────────────────
  const pyproject = tryReadText(join(repoPath, 'pyproject.toml'));
  const setupPy = existsSync(join(repoPath, 'setup.py'));
  const requirementsTxt = existsSync(join(repoPath, 'requirements.txt'));
  if (pyproject || setupPy || requirementsTxt) {
    tech.languages.Python = true;
    if (!tech.primary_language) tech.primary_language = 'Python';
    tech.runtime = tech.runtime || 'python';
    tech.package_manager = tech.package_manager || (pyproject?.includes('uv') ? 'uv' : 'pip');

    if (pyproject) {
      if (pyproject.includes('fastapi')) tech.frameworks.push('fastapi');
      if (pyproject.includes('flask')) tech.frameworks.push('flask');
      if (pyproject.includes('django')) tech.frameworks.push('django');
      if (pyproject.includes('mcp')) tech.frameworks.push('mcp');
      if (pyproject.includes('torch')) tech.frameworks.push('pytorch');
    }
    tech.deployment_shape = tech.deployment_shape || 'pypi';
  }

  // ── .NET ──────────────────────────────────────
  const csproj = findFile(repoPath, '*.csproj', 2);
  if (csproj) {
    tech.languages['C#'] = true;
    if (!tech.primary_language) tech.primary_language = 'C#';
    tech.runtime = tech.runtime || 'dotnet';
    tech.package_manager = tech.package_manager || 'nuget';

    const content = tryReadText(csproj);
    if (content?.includes('WinUI')) tech.frameworks.push('winui');
    if (content?.includes('Maui')) tech.frameworks.push('maui');
    if (content?.includes('Avalonia')) tech.frameworks.push('avalonia');
    if (content?.includes('Exe')) tech.app_shape = tech.app_shape || 'desktop';
    tech.deployment_shape = tech.deployment_shape || 'nuget';
  }

  // Default app_shape
  if (!tech.app_shape) tech.app_shape = 'library';

  // Deduplicate frameworks
  tech.frameworks = [...new Set(tech.frameworks)];

  return tech;
}

/**
 * Find a file by glob pattern in the repo (shallow).
 */
function findFile(dir: string, pattern: string, maxDepth: number = 2): string | null {
  const ext = pattern.replace('*', '');
  function search(d: string, depth: number): string | null {
    if (depth > maxDepth) return null;
    try {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const full = join(d, entry.name);
        if (entry.isFile() && entry.name.endsWith(ext)) return full;
        if (entry.isDirectory() && depth < maxDepth) {
          const found = search(full, depth + 1);
          if (found) return found;
        }
      }
    } catch { /* permission errors, etc */ }
    return null;
  }
  return search(dir, 0);
}

/**
 * Index documentation files from a repo.
 */
export function indexDocs(repoPath: string): DocEntry[] {
  const docs: DocEntry[] = [];
  const docFiles: { file: string; type: string }[] = [
    { file: 'README.md', type: 'readme' },
    { file: 'CHANGELOG.md', type: 'changelog' },
    { file: 'LICENSE', type: 'license' },
    { file: 'LICENSE.md', type: 'license' },
    { file: 'SECURITY.md', type: 'docs' },
    { file: 'CONTRIBUTING.md', type: 'docs' },
    { file: 'SHIP_GATE.md', type: 'audit' },
    { file: '.claude/CLAUDE.md', type: 'docs' },
  ];

  for (const { file, type } of docFiles) {
    const fullPath = join(repoPath, file);
    const content = tryReadText(fullPath);
    if (content) {
      docs.push({
        path: file,
        doc_type: type,
        title: file.replace(/\.md$/i, ''),
        content,
        checksum: md5(content),
      });
    }
  }

  // Also check docs/ directory
  const docsDir = join(repoPath, 'docs');
  if (existsSync(docsDir)) {
    try {
      for (const entry of readdirSync(docsDir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = tryReadText(join(docsDir, entry.name));
          if (content) {
            docs.push({
              path: `docs/${entry.name}`,
              doc_type: 'docs',
              title: entry.name.replace(/\.md$/i, ''),
              content,
              checksum: md5(content),
            });
          }
        }
      }
    } catch { /* ignore */ }
  }

  return docs;
}

/**
 * Scan a local repo and ingest everything into the database.
 */
export function ingestLocalRepo(repoPath: string): IngestResult {
  const scanned = scanLocalRepo(repoPath);

  // Upsert repo (merge with existing GitHub data if present)
  const repoId = upsertRepo({
    owner: scanned.owner,
    name: scanned.name,
    local_path: scanned.local_path,
    github_url: scanned.github_url,
  });

  // Tech fingerprint
  upsertTech(repoId, scanned.tech);

  // Language facts
  for (const [lang] of Object.entries(scanned.tech.languages)) {
    upsertFact(repoId, 'language', lang, 'true', 'detected');
  }
  for (const fw of scanned.tech.frameworks) {
    upsertFact(repoId, 'framework', fw, 'true', 'detected');
  }
  if (scanned.tech.package_manager) {
    upsertFact(repoId, 'package_manager', scanned.tech.package_manager, 'true', 'detected');
  }

  // Documents
  for (const doc of scanned.docs) {
    upsertDoc(repoId, doc.path, doc.doc_type, doc.title, doc.content, doc.checksum);
  }

  return { repoId, name: `${scanned.owner}/${scanned.name}`, docs: scanned.docs.length };
}

/**
 * Scan all directories under a parent that look like git repos.
 */
export function scanDirectory(parentDir: string): ScanResult {
  const results: ScanResult = { scanned: 0, skipped: 0, errors: [] };

  for (const entry of readdirSync(parentDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const repoPath = join(parentDir, entry.name);
    const isGit = existsSync(join(repoPath, '.git'));
    if (!isGit) {
      results.skipped++;
      continue;
    }

    try {
      ingestLocalRepo(repoPath);
      results.scanned++;
      process.stdout.write('.');
    } catch (e: any) {
      results.errors.push(`${entry.name}: ${e.message}`);
    }
  }
  console.log();

  return results;
}
