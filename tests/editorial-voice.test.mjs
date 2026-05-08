import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/check-editorial-voice.mjs', import.meta.url));

function runScript(args) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [SCRIPT, ...args]);
    let stdout = '', stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function setupFixtures(voiceContent, targetContent) {
  const dir = await mkdtemp(join(tmpdir(), 'editorial-voice-'));
  const voice = join(dir, 'voice.md');
  const target = join(dir, 'target.html');
  await writeFile(voice, voiceContent);
  await writeFile(target, targetContent);
  return { dir, voice, target };
}

test('emits hint and exits 0 when watchword appears in target', async (t) => {
  const { dir, voice, target } = await setupFixtures(
    `# x\n\n## Watchwords\n\n- Horoskop / horoscope\n- Schicksal\n\n## End\n`,
    `<p>Kein Horoskop-Versprechen.</p>\n<p>Ohne Schicksalsdeutung.</p>\n`,
  );
  t.after(() => rm(dir, { recursive: true }));

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0, 'script must exit 0 even when hits are found');
  assert.match(stdout, /watchword: "Horoskop"/);
  assert.match(stdout, /watchword: "Schicksal"/);
  assert.match(stdout, /Kein Horoskop-Versprechen/);
  assert.match(stdout, /Schicksalsdeutung/);
});

test('exits 0 with informational message when no watchword hits', async (t) => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n- Horoskop\n\n## End\n`,
    `<p>Bazodiac is a reflection model.</p>\n`,
  );
  t.after(() => rm(dir, { recursive: true }));

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0);
  assert.match(stdout, /no watchword hits/);
});

test('splits slash-delimited watchwords into separate entries', async (t) => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n- fate / destiny / Schicksal\n\n## End\n`,
    `<p>your destiny awaits</p>\n<p>Schicksal is heavy</p>\n<p>fate is not a fact</p>\n`,
  );
  t.after(() => rm(dir, { recursive: true }));

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0);
  assert.match(stdout, /watchword: "fate"/);
  assert.match(stdout, /watchword: "destiny"/);
  assert.match(stdout, /watchword: "Schicksal"/);
});

test('exits 2 when voice doc is missing the Watchwords heading', async (t) => {
  const { dir, voice, target } = await setupFixtures(
    `# Editorial Voice\n\n## Other\n\n- thing\n`,
    `<p>x</p>`,
  );
  t.after(() => rm(dir, { recursive: true }));

  const { code, stderr } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 2);
  assert.match(stderr, /Watchwords/);
  assert.match(stderr, new RegExp(voice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('exits 2 when Watchwords section is empty', async (t) => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n## End\n`,
    `<p>x</p>`,
  );
  t.after(() => rm(dir, { recursive: true }));

  const { code, stderr } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 2);
  assert.match(stderr, /zero entries/);
});

test('extracts watchwords when ## Watchwords is the last section in the doc', async (t) => {
  const { dir, voice, target } = await setupFixtures(
    `# Doc\n\n## Other\n\nSome prose.\n\n## Watchwords\n\n- Horoskop\n- Schicksal\n`,
    `<p>Kein Horoskop hier.</p>\n<p>Schicksalsanker.</p>\n`,
  );
  t.after(() => rm(dir, { recursive: true }));

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0);
  assert.match(stdout, /watchword: "Horoskop"/);
  assert.match(stdout, /watchword: "Schicksal"/);
});

test('strips control characters from excerpts before printing', async (t) => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n- Horoskop\n\n## End\n`,
    `<p>before \x1B[31mHoroskop\x1B[0m after</p>\n`,
  );
  t.after(() => rm(dir, { recursive: true }));

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0);
  // The escape sequence (0x1B) must not appear in the output excerpt.
  assert.doesNotMatch(stdout, /\x1B/);
  // The placeholder should appear instead.
  assert.match(stdout, /\?\[31mHoroskop\?\[0m/);
});
