import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('public/index.html', 'utf8');

test('inline <script> blocks are syntactically valid JavaScript', () => {
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  assert.ok(scripts.length > 0, 'expected at least one inline script');
  for (const [i, source] of scripts.entries()) {
    // Constructing a Function throws on syntax errors — same trick scripts/check.mjs uses.
    assert.doesNotThrow(() => new Function(source), `inline script ${i + 1} parse`);
  }
});

test('every HTML id is unique (the active form/chart contract depends on it)', () => {
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  const dupes = [];
  for (const id of ids) {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  assert.deepEqual(dupes, [], `duplicate ids: ${[...new Set(dupes)].join(', ')}`);
});

test('frontend references every chart field name from the public contract', () => {
  // If a renaming on the backend silently dropped one of these, the
  // matching tile would render "—" forever; this test catches that.
  for (const field of ['sunSign', 'moonSign', 'ascendant', 'baziYearAnimal', 'baziDaymaster', 'dominantElement']) {
    assert.match(html, new RegExp(`\\b${field}\\b`), `expected ${field} reference in inline JS`);
  }
});

test('default desktop CSS does not block vertical scrolling on body or .shell', () => {
  // Pull the first matching block for each selector; the regression we
  // are guarding against is `body { ... overflow: hidden }` and a
  // `.shell { overflow: hidden }` that swallows the page's main scroll.
  const bodyRule = html.match(/(?:^|[^.])body\s*\{[^}]*\}/m);
  if (bodyRule) {
    assert.doesNotMatch(
      bodyRule[0],
      /overflow(?:-y)?\s*:\s*hidden/,
      'body rule must not have overflow:hidden by default',
    );
  }
  const shellRule = html.match(/\.shell\s*\{[^}]*\}/m);
  if (shellRule) {
    assert.doesNotMatch(
      shellRule[0],
      /overflow(?:-y)?\s*:\s*hidden/,
      '.shell rule must not have overflow-y:hidden by default',
    );
  }
});

test('rich cursor FX (custom_cursor / cursor_glow / image_trail) is opt-in via localStorage', () => {
  // The motion-profile manager must check a localStorage flag named
  // bazodiac.effects==='rich' before exposing those features. Anything
  // looser regresses to the always-on cursor FX that wedged the page
  // on small windows.
  assert.match(html, /bazodiac\.effects/i, 'expected the bazodiac.effects opt-in flag');
});

test('essential text tokens replace the 8px font-size sizes', () => {
  // Pure regex check: any selector that includes one of these classes
  // must not also declare font-size:8px in the same rule. Catches the
  // accessibility regression called out in the Iteration 2 report.
  const ESSENTIAL = ['\\.stat \\.k', '\\.bento \\.ck \\.label', '\\.modal-foot \\.note', '\\.interpretation \\.kv span'];
  for (const sel of ESSENTIAL) {
    const re = new RegExp(`${sel}\\s*\\{[^}]*font-size\\s*:\\s*8px`, 's');
    assert.doesNotMatch(html, re, `${sel.replace(/\\\\/g, '')} must not use font-size:8px`);
  }
});
