import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadFixture, FIXTURE_NAMES, clearFixtureCache } from '../src/fixtures.mjs';

test('fusion-chart success fixture matches the public contract envelope', async () => {
  clearFixtureCache();
  const fx = await loadFixture(FIXTURE_NAMES.fusionChartSuccess);
  assert.equal(fx.ok, true);
  assert.equal(typeof fx.chartSessionId, 'string');
  assert.ok(fx.chartSessionId.length > 0, 'chartSessionId must be non-empty');
  assert.equal(typeof fx.chart, 'object');
  for (const key of ['sunSign', 'moonSign', 'ascendant', 'baziYearAnimal', 'baziDaymaster', 'dominantElement']) {
    assert.equal(typeof fx.chart[key], 'string', `chart.${key} must be a string`);
  }
  assert.equal(typeof fx.chart.coherenceIndex, 'number');
  assert.ok(fx.chart.coherenceIndex >= 0 && fx.chart.coherenceIndex <= 1, 'coherenceIndex in [0,1]');
});

test('fusion-chart wuXing has exactly five keys summing to ~1.0', async () => {
  const fx = await loadFixture(FIXTURE_NAMES.fusionChartSuccess);
  const keys = Object.keys(fx.chart.wuXing).sort();
  assert.deepEqual(keys, ['earth', 'fire', 'metal', 'water', 'wood']);
  for (const v of Object.values(fx.chart.wuXing)) {
    assert.equal(typeof v, 'number');
    assert.ok(v >= 0 && v <= 1, 'each wuXing value must be in [0,1]');
  }
  const sum = Object.values(fx.chart.wuXing).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) <= 0.01, `wuXing must sum to ~1.0 (got ${sum})`);
});

test('fusion-interpretation success fixture has headline, body, stats, downloads', async () => {
  const fx = await loadFixture(FIXTURE_NAMES.fusionInterpretationSuccess);
  assert.equal(fx.ok, true);
  const i = fx.interpretation;
  assert.equal(typeof i.headline, 'string');
  assert.ok(i.headline.length > 0);
  assert.equal(typeof i.body, 'string');
  assert.ok(i.body.length > 0);
  assert.ok(Array.isArray(i.stats) && i.stats.length > 0);
  for (const s of i.stats) {
    assert.equal(typeof s.label, 'string');
    assert.equal(typeof s.value, 'string');
  }
  assert.equal(typeof i.downloads, 'object');
  assert.ok(['string', 'object'].includes(typeof i.downloads.txt) || i.downloads.txt === null);
});

test('newsletter signup success fixture confirms the subscription', async () => {
  const fx = await loadFixture(FIXTURE_NAMES.newsletterSuccess);
  assert.equal(fx.ok, true);
  assert.equal(fx.subscribed, true);
  assert.equal(typeof fx.subscription.email, 'string');
  assert.equal(typeof fx.subscription.confirmedAt, 'string');
  assert.equal(typeof fx.subscription.doubleOptInRequired, 'boolean');
});

test('loadFixture returns independent clones (no shared mutation)', async () => {
  const a = await loadFixture(FIXTURE_NAMES.fusionChartSuccess);
  a.chart.sunSign = 'MUTATED';
  const b = await loadFixture(FIXTURE_NAMES.fusionChartSuccess);
  assert.notEqual(b.chart.sunSign, 'MUTATED');
});
