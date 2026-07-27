import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_SEMINAR_RESOURCES,
  resourceAction,
  resourceLimitError,
  visibleSeminarResources,
} from '../src/lib/seminar-resources.ts';
import { resourceFileError } from '../src/lib/resource-storage.ts';

test('seminar resources are limited to five', () => {
  assert.equal(MAX_SEMINAR_RESOURCES, 5);
  assert.equal(resourceLimitError(4), '');
  assert.match(resourceLimitError(5), /최대 5개/);
});

test('resource uploads accept only PDF and PowerPoint files up to twenty megabytes', () => {
  assert.equal(resourceFileError({ type: 'application/pdf', size: 20 * 1024 * 1024 }), '');
  assert.match(resourceFileError({ type: 'video/mp4', size: 100 }), /PDF/);
  assert.match(resourceFileError({ type: 'application/pdf', size: 20 * 1024 * 1024 + 1 }), /20MB/);
});

test('legacy seminar links remain visible as web resources', () => {
  assert.deepEqual(visibleSeminarResources({ resources: [], resourceUrl: 'https://example.com/old' }), [{
    id: 'legacy-resource',
    title: '외부 자료',
    kind: 'WEB',
    description: '기존에 등록된 세미나 자료입니다.',
    url: 'https://example.com/old',
  }]);
});

test('resource actions describe what will open', () => {
  assert.equal(resourceAction('PDF'), 'PDF 열기');
  assert.equal(resourceAction('SLIDE'), '슬라이드 다운로드');
  assert.equal(resourceAction('VIDEO'), '영상 보기');
  assert.equal(resourceAction('WEB'), '웹 자료 보기');
  assert.equal(resourceAction('CODE'), '코드 보기');
});
