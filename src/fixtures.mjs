import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(here, '..', 'contracts', 'fixtures');

const cache = new Map();

export async function loadFixture(name) {
  if (cache.has(name)) return structuredClone(cache.get(name));
  const raw = await readFile(join(fixtureDir, name), 'utf8');
  const data = JSON.parse(raw);
  cache.set(name, data);
  return structuredClone(data);
}

export function clearFixtureCache() {
  cache.clear();
}

export const FIXTURE_NAMES = Object.freeze({
  fusionChartSuccess: 'fusion-chart.response.success.json',
  fusionInterpretationSuccess: 'fusion-interpretation.response.success.json',
  newsletterSuccess: 'newsletter-signup.response.success.json',
});
