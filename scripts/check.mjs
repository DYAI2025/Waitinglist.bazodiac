import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const html = await readFile('public/index.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
if (scripts.length === 0) throw new Error('No inline scripts found in public/index.html');
for (const [index, source] of scripts.entries()) {
  new Function(source);
  console.log(`public/index.html inline script ${index + 1}: syntax ok`);
}

const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length > 0) throw new Error(`Duplicate HTML ids found: ${[...new Set(duplicates)].join(', ')}`);
console.log(`public/index.html ids: ${ids.length} unique`);

const server = spawn(process.execPath, ['--check', 'server.mjs'], { stdio: 'inherit' });
await new Promise((resolve, reject) => {
  server.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`node --check server.mjs exited with ${code}`)));
});
console.log('server.mjs: syntax ok');
