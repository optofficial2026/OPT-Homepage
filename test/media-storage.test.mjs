import assert from 'node:assert/strict';
import test from 'node:test';

import { mediaError, safeMediaPath } from '../src/lib/media-storage.ts';

test('media validation accepts web images up to five megabytes', () => {
  assert.equal(mediaError({ type: 'image/webp', size: 5 * 1024 * 1024 }), '');
  assert.match(mediaError({ type: 'image/gif', size: 100 }), /JPEG/);
  assert.match(mediaError({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }), /5MB/);
});

test('storage paths do not reuse user filenames', () => {
  const path = safeMediaPath('activity', 'image/png', 'fixed-id');
  assert.equal(path, 'activity/fixed-id.png');
  assert.doesNotMatch(path, /\.\./);
});
