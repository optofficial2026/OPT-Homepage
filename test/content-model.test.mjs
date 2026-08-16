import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeDetail,
  defaultContent,
  displayDate,
  emptyHackathonDetail,
  emptySeminarDetail,
  sortTimelineNewestFirst,
  timelineSortKey,
  validateSlug,
} from '../src/data/content.ts';

test('stored detail is completed so pages never map over a missing field', () => {
  const hackathon = completeDetail('hackathon', { tagline: '요약만 있는 행' });
  assert.deepEqual(hackathon, { ...emptyHackathonDetail, tagline: '요약만 있는 행' });
  assert.deepEqual(hackathon.techStack, []);
  assert.deepEqual(hackathon.features, []);

  assert.deepEqual(completeDetail('seminar', null), emptySeminarDetail);
  assert.deepEqual(completeDetail('seminar', []), emptySeminarDetail);
  assert.equal(completeDetail('seminar', { format: 'NOTE' }).format, 'NOTE');
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

test('timeline sorts mixed date delimiters chronologically', () => {
  const items = [
    { id: 'march', occurredOn: '2026.03.07', title: '', description: '' },
    { id: 'october', occurredOn: '2026-10-01', title: '', description: '' },
  ];
  assert.deepEqual(sortTimelineNewestFirst(items).map(({ id }) => id), ['october', 'march']);
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

test('stored dates use the compact public display format', () => {
  assert.equal(displayDate('2026-07-27'), '2026.07');
  assert.equal(displayDate('2026.07'), '2026.07');
});

test('timeline order follows the sort date, not the wording shown on screen', () => {
  const items = [
    { id: 'a', sortedOn: '2026-06-01', occurredOn: '아무렇게나 쓴 문구', title: '', description: '' },
    { id: 'b', sortedOn: '2026-12-01', occurredOn: '2026 겨울', title: '', description: '' },
    { id: 'c', sortedOn: '2026-09-01', occurredOn: '가을쯤', title: '', description: '' },
  ];

  assert.deepEqual(sortTimelineNewestFirst(items).map(({ id }) => id), ['b', 'c', 'a']);
});

test('rows saved before the sort date existed keep their old guessed order', () => {
  const legacy = [
    { id: 'start', sortedOn: '', occurredOn: '2026.03.07', title: '', description: '' },
    { id: 'first-half', sortedOn: '', occurredOn: '2026년 상반기', title: '', description: '' },
    { id: 'second-half', sortedOn: '', occurredOn: '2026년 하반기', title: '', description: '' },
  ];

  assert.deepEqual(sortTimelineNewestFirst(legacy).map(({ id }) => id), ['second-half', 'first-half', 'start']);
  // A saved date wins over the wording even when the two disagree.
  assert.equal(timelineSortKey({ sortedOn: '2026-01-01', occurredOn: '2026년 하반기' }), '20260101');
});
