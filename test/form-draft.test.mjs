import assert from 'node:assert/strict';
import test from 'node:test';

import { applyDraft } from '../src/hooks/useFormDraft.ts';

test('restoring a draft fills the form it was written in', () => {
  const fields = [
    { name: 'title', value: '' },
    { name: 'body', value: '' },
    { name: 'thumbnailUrl', type: 'hidden', value: '' },
    { name: '', value: '건드리면 안 되는 이름 없는 칸' },
  ];

  applyDraft(fields, { title: '쓰다 만 제목', body: '쓰다 만 본문', thumbnailUrl: 'https://x/a.jpg' });

  assert.equal(fields[0].value, '쓰다 만 제목');
  assert.equal(fields[1].value, '쓰다 만 본문');
  // Images uploaded before the dialog closed keep their URL, so the post is not left half-illustrated.
  assert.equal(fields[2].value, 'https://x/a.jpg');
  assert.equal(fields[3].value, '건드리면 안 되는 이름 없는 칸');
});

test('an unchecked box stays unchecked when the draft is restored', () => {
  const fields = [
    { name: 'recruitmentEnabled', type: 'checkbox', value: 'on', checked: true },
    { name: 'popupEnabled', type: 'checkbox', value: 'on', checked: false },
  ];

  // FormData omits unchecked boxes entirely, so absence must mean off, not "leave as is".
  applyDraft(fields, { popupEnabled: 'on' });

  assert.equal(fields[0].checked, false);
  assert.equal(fields[1].checked, true);
});

test('a field the draft never saw keeps whatever it already had', () => {
  const fields = [{ name: 'cohort', value: '2' }];

  applyDraft(fields, { title: '다른 칸만 저장됨' });

  assert.equal(fields[0].value, '2');
});
