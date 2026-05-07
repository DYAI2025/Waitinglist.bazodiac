import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const html = await readFile('public/index.html', 'utf8');

// 1) Inline scripts must parse.
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
if (scripts.length === 0) throw new Error('No inline scripts found in public/index.html');
for (const [i, source] of scripts.entries()) {
  // eslint-disable-next-line no-new-func
  new Function(source);
  console.log(`public/index.html inline script ${i + 1}: syntax ok`);
}

// 2) Every HTML id is unique.
const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
const seen = new Set();
const duplicates = [];
for (const id of ids) {
  if (seen.has(id)) duplicates.push(id);
  seen.add(id);
}
if (duplicates.length) throw new Error(`Duplicate HTML ids found: ${[...new Set(duplicates)].join(', ')}`);
console.log(`public/index.html ids: ${ids.length} unique`);

// 3) body / .shell must not regress to overflow:hidden by default — that
//    bug killed desktop scrolling in Iteration 1.
const bodyRule = html.match(/(?:^|[^.])body\s*\{[^}]*\}/m);
if (bodyRule && /overflow(?:-y)?\s*:\s*hidden/.test(bodyRule[0])) {
  throw new Error('body rule must not have overflow:hidden by default');
}
const shellRule = html.match(/\.shell\s*\{[^}]*\}/m);
if (shellRule && /overflow(?:-y)?\s*:\s*hidden/.test(shellRule[0])) {
  throw new Error('.shell rule must not have overflow-y:hidden by default');
}
console.log('public/index.html scrolling: body and .shell unblocked');

// 4) Essential text selectors must not use font-size:8px (a11y regression).
const essentialSelectors = ['.stat .k', '.bento .ck .label', '.modal-foot .note', '.interpretation .kv span'];
for (const sel of essentialSelectors) {
  const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{[^}]*font-size\\s*:\\s*8px`, 's');
  if (re.test(html)) throw new Error(`${sel} must not use font-size:8px`);
}
console.log('public/index.html essential text: no 8px regressions');

// 5) Rich cursor FX must be opt-in via localStorage flag bazodiac.effects.
if (!/bazodiac\.effects/.test(html)) {
  throw new Error('Expected localStorage opt-in flag bazodiac.effects in motion-profile manager');
}
console.log('public/index.html rich FX: opt-in via bazodiac.effects flag');

// 6) server.mjs and src/ entry points must compile.
async function nodeCheck(target) {
  const child = spawn(process.execPath, ['--check', target], { stdio: 'inherit' });
  await new Promise((resolve, reject) => {
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`node --check ${target} exited with ${code}`))));
  });
  console.log(`${target}: syntax ok`);
}
await nodeCheck('server.mjs');
await nodeCheck('src/app.mjs');
