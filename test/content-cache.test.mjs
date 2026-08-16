import assert from 'node:assert/strict';
import test from 'node:test';

import { readContentCache, writeContentCache } from '../src/lib/content-cache.ts';
import { defaultContent } from '../src/data/content.ts';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test('cache round-trips current content', () => {
  const storage = memoryStorage();
  writeContentCache(storage, defaultContent);
  assert.deepEqual(readContentCache(storage), defaultContent);
});

test('cache ignores malformed or old data', () => {
  const malformed = { getItem: () => '{', setItem() {} };
  const old = { getItem: () => JSON.stringify({ version: 0, data: defaultContent }), setItem() {} };
  const invalidShape = {
    getItem: () => JSON.stringify({
      version: 1,
      data: { settings: null, timeline: {}, activities: [], archives: 'invalid' },
    }),
    setItem() {},
  };
  assert.equal(readContentCache(malformed), null);
  assert.equal(readContentCache(old), null);
  assert.equal(readContentCache(invalidShape), null);
});

test('legacy cache fills newly added recruitment popup setting from defaults', () => {
  const legacySettings = { ...defaultContent.settings };
  delete legacySettings.recruitmentPopupEnabled;
  const storage = memoryStorage();
  storage.setItem('opt-site-content-v1', JSON.stringify({
    version: 1,
    data: { ...defaultContent, settings: legacySettings },
  }));

  assert.equal(readContentCache(storage)?.settings.recruitmentPopupEnabled, true);
});

test('storage errors never escape', () => {
  const broken = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('full'); },
  };
  assert.equal(readContentCache(broken), null);
  assert.doesNotThrow(() => writeContentCache(broken, defaultContent));
});
