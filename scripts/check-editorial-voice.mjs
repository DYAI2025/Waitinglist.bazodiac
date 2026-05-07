#!/usr/bin/env node
// scripts/check-editorial-voice.mjs
//
// Editorial-voice soft-hint linter (DEC-zero-runtime-deps).
// Reads `1-spec/editorial-voice.md`, extracts the `## Watchwords` bullet list,
// scans `public/index.html`, emits non-fatal hints for each match.
// Always exits 0 on content findings — never fails the build.
// Exits 2 only on parser/file-read errors (loud failure for infrastructure faults).

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');

function parseArgs(argv) {
  const args = { voice: null, target: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--voice' && argv[i + 1]) { args.voice = argv[++i]; }
    else if (argv[i] === '--target' && argv[i + 1]) { args.target = argv[++i]; }
  }
  return args;
}

function extractWatchwords(voiceMd) {
  const re = /^## Watchwords\s*$([\s\S]*?)(?=^## |\Z)/m;
  const match = voiceMd.match(re);
  if (!match) {
    throw new Error("editorial-voice doc is missing a `## Watchwords` heading");
  }
  const block = match[1];
  const watchwords = [];
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*-\s*(.+?)\s*$/);
    if (!m) continue;
    const tokens = m[1].split('/').map((s) => s.trim()).filter(Boolean);
    watchwords.push(...tokens);
  }
  if (watchwords.length === 0) {
    throw new Error('editorial-voice doc Watchwords section yielded zero entries');
  }
  return watchwords;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findHints(html, watchwords) {
  const lines = html.split('\n');
  const hints = [];
  for (const watchword of watchwords) {
    const re = new RegExp(escapeRegex(watchword), 'i');
    for (let i = 0; i < lines.length; i++) {
      const idx = lines[i].search(re);
      if (idx === -1) continue;
      const start = Math.max(0, idx - 30);
      const end = Math.min(lines[i].length, idx + watchword.length + 40);
      const prefix = start > 0 ? '...' : '';
      const suffix = end < lines[i].length ? '...' : '';
      const excerpt = `${prefix}${lines[i].slice(start, end).trim()}${suffix}`;
      hints.push({ line: i + 1, watchword, excerpt });
    }
  }
  return hints;
}

async function main() {
  const args = parseArgs(process.argv);
  const voicePath = args.voice
    ? resolve(args.voice)
    : resolve(REPO_ROOT, '1-spec/editorial-voice.md');
  const targetPath = args.target
    ? resolve(args.target)
    : resolve(REPO_ROOT, 'public/index.html');

  const voiceMd = await readFile(voicePath, 'utf-8');
  const watchwords = extractWatchwords(voiceMd);
  const html = await readFile(targetPath, 'utf-8');
  const hints = findHints(html, watchwords);

  if (hints.length === 0) {
    console.log(
      `editorial-voice: no watchword hits in ${targetPath} (${watchwords.length} watchword(s) scanned).`,
    );
    return;
  }

  for (const h of hints) {
    console.log(`hint  ${targetPath}:${h.line}  "${h.excerpt}"`);
    console.log(`      watchword: "${h.watchword}" → review: negating/redefining/contrastive?`);
  }
  console.log(`\n(${hints.length} hint(s) total — soft suggestions, not failures.)`);
}

main().catch((err) => {
  console.error(`editorial-voice: ${err.message}`);
  process.exit(2);
});
