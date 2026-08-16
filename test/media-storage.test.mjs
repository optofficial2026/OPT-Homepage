import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_SIZE_MB,
  galleryLimitError,
  mediaError,
  mediaPathFromUrl,
  mediaUrlsOf,
  safeMediaPath,
  thumbnailCropRect,
} from '../src/lib/media-storage.ts';

test('media validation accepts web images up to ten megabytes', () => {
  const tenMegabytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  assert.equal(MAX_IMAGE_SIZE_MB, 10);
  assert.equal(mediaError({ type: 'image/webp', size: tenMegabytes }), '');
  assert.equal(mediaError({ type: 'image/jpeg', size: tenMegabytes }), '');
  assert.match(mediaError({ type: 'image/gif', size: 100 }), /JPEG/);
  assert.match(mediaError({ type: 'image/png', size: tenMegabytes + 1 }), /10MB/);
});

test('gallery accepts no more than five images', () => {
  assert.equal(MAX_GALLERY_IMAGES, 5);
  assert.equal(galleryLimitError(2, 3), '');
  assert.match(galleryLimitError(3, 3), /최대 5장/);
});

test('thumbnail crop keeps a centered sixteen-by-nine frame', () => {
  assert.deepEqual(thumbnailCropRect(1600, 1200), {
    x: 0, y: 150, width: 1600, height: 900,
  });
  assert.deepEqual(thumbnailCropRect(2400, 900), {
    x: 400, y: 0, width: 1600, height: 900,
  });
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

test('a deleted record hands over every file it owns, and nothing it merely links to', () => {
  const activity = {
    thumbnailUrl: 'https://x.supabase.co/storage/v1/object/public/content-media/activity/a.jpg',
    heroImageUrl: 'https://x.supabase.co/storage/v1/object/public/content-media/activity/b.jpg',
    galleryUrls: ['https://x.supabase.co/storage/v1/object/public/content-media/activity/c.jpg'],
  };
  assert.deepEqual(mediaUrlsOf(activity), [
    activity.thumbnailUrl, activity.heroImageUrl, ...activity.galleryUrls,
  ]);

  const seminar = {
    thumbnailUrl: 'https://x.supabase.co/storage/v1/object/public/content-media/archive/t.jpg',
    detail: {
      heroImageUrl: 'https://x.supabase.co/storage/v1/object/public/content-media/archive/h.jpg',
      galleryUrls: ['https://x.supabase.co/storage/v1/object/public/content-media/archive/g.jpg'],
      resourceUrl: '',
      resources: [
        { url: 'https://x.supabase.co/storage/v1/object/public/content-media/resources/s.pdf' },
        { url: 'https://notion.so/some-page' },
      ],
    },
  };
  const urls = mediaUrlsOf(seminar);
  assert.equal(urls.length, 5);
  assert.ok(urls.includes(seminar.detail.resources[0].url));

  // External links survive the round trip but resolve to no storage path, so removal skips them.
  assert.ok(urls.includes('https://notion.so/some-page'));
  assert.equal(mediaPathFromUrl('https://notion.so/some-page'), '');

  // An empty record must not hand over blank strings to the delete call.
  assert.deepEqual(mediaUrlsOf({ thumbnailUrl: '', galleryUrls: [] }), []);
});
