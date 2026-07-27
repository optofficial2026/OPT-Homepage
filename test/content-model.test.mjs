import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatStat,
  normalizeStat,
  sortTimelineNewestFirst,
  validateSlug,
} from '../src/data/content.ts';

test('statistics stay in the non-negative integer plus format', () => {
  assert.equal(normalizeStat(-2), 0);
  assert.equal(normalizeStat(4.8), 4);
  assert.equal(formatStat(11), '11+');
});

test('timeline is sorted newest first without mutating the input', () => {
  const input = [
    { id: 'old', occurredOn: '2025-01-01', title: 'old', description: '' },
    { id: 'new', occurredOn: '2026-01-01', title: 'new', description: '' },
  ];
  assert.deepEqual(sortTimelineNewestFirst(input).map(({ id }) => id), ['new', 'old']);
  assert.equal(input[0].id, 'old');
});

test('slugs reject empty and malformed values', () => {
  assert.equal(validateSlug('paper-pilot'), true);
  assert.equal(validateSlug(''), false);
  assert.equal(validateSlug('공백 있음'), false);
});
