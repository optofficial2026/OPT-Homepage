-- Seminar resource files (PDF, PPT, PPTX) share the content-media bucket,
-- which was created for images only and rejected them.
update storage.buckets set
  file_size_limit = 20971520,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
where id = 'content-media';
