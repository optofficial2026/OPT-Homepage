import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_GALLERY_IMAGES,
  galleryLimitError,
  mediaError,
  mediaPathFromUrl,
  safeMediaPath,
} from '../src/lib/media-storage.ts';

test('media validation accepts web images up to five megabytes', () => {
  assert.equal(mediaError({ type: 'image/webp', size: 5 * 1024 * 1024 }), '');
  assert.match(mediaError({ type: 'image/gif', size: 100 }), /JPEG/);
  assert.match(mediaError({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }), /5MB/);
});

test('gallery accepts no more than five images', () => {
  assert.equal(MAX_GALLERY_IMAGES, 5);
  assert.equal(galleryLimitError(2, 3), '');
  assert.match(galleryLimitError(3, 3), /최대 5장/);
});

test('storage paths do not reuse user filenames', () => {
  const path = safeMediaPath('activity', 'image/png', 'fixed-id');
  assert.equal(path, 'activity/fixed-id.png');
  assert.doesNotMatch(path, /\.\./);
});

test('public media URLs resolve to their storage object paths', () => {
  assert.equal(
    mediaPathFromUrl('https://example.supabase.co/storage/v1/object/public/content-media/activity/fixed-id.png'),
    'activity/fixed-id.png',
  );
  assert.equal(mediaPathFromUrl('https://example.com/image.png'), '');
});
