import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defaultContent,
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

test('timeline understands the existing Korean period labels', () => {
  const items = [
    { id: 'summer', occurredOn: '2026년 여름방학', title: '', description: '' },
    { id: 'recruit', occurredOn: '2026.09', title: '', description: '' },
    { id: 'first-half', occurredOn: '2026년 상반기', title: '', description: '' },
  ];
  assert.deepEqual(sortTimelineNewestFirst(items).map(({ id }) => id), ['recruit', 'summer', 'first-half']);
});

test('slugs reject empty and malformed values', () => {
  assert.equal(validateSlug('paper-pilot'), true);
  assert.equal(validateSlug(''), false);
  assert.equal(validateSlug('공백 있음'), false);
});

test('default seminar archives preserve their material formats', () => {
  const formats = defaultContent.archives
    .filter(({ kind }) => kind === 'seminar')
    .map(({ detail }) => detail.format);
  assert.deepEqual(formats, ['SLIDE', 'SLIDE', 'NOTE', 'SLIDE', 'NOTE']);
});
