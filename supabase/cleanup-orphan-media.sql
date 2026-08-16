-- 어떤 글에도 연결되지 않고 스토리지에만 남은 파일 정리.
--
-- 삭제 시 파일을 같이 지우는 기능이 들어가기 전에 쌓인 것들을 비우기 위한 스크립트다.
-- Supabase 대시보드 → SQL Editor 에서 1단계를 먼저 실행해 목록을 눈으로 확인하고,
-- 문제 없으면 2단계를 실행한다. 되돌릴 수 없으니 1단계를 건너뛰지 말 것.
--
-- 편집 중 업로드했지만 아직 저장하지 않은 파일을 지우지 않도록,
-- 올라온 지 1시간이 지난 파일만 대상으로 삼는다.

-- 1단계: 지워질 파일 목록 확인
select
  o.name,
  round(((o.metadata ->> 'size')::numeric) / 1024 / 1024, 2) as mb,
  o.created_at
from storage.objects o
where o.bucket_id = 'content-media'
  and o.created_at < now() - interval '1 hour'
  and not exists (
    select 1 from public.activity_posts a
    where a.thumbnail_url like '%' || o.name
       or a.hero_image_url like '%' || o.name
       or a.gallery_urls::text like '%' || o.name || '%'
  )
  and not exists (
    select 1 from public.archive_items r
    where r.thumbnail_url like '%' || o.name
       or r.detail::text like '%' || o.name || '%'
  )
order by o.created_at;

-- 2단계: 위 목록이 맞으면 실행
-- delete from storage.objects o
-- where o.bucket_id = 'content-media'
--   and o.created_at < now() - interval '1 hour'
--   and not exists (
--     select 1 from public.activity_posts a
--     where a.thumbnail_url like '%' || o.name
--        or a.hero_image_url like '%' || o.name
--        or a.gallery_urls::text like '%' || o.name || '%'
--   )
--   and not exists (
--     select 1 from public.archive_items r
--     where r.thumbnail_url like '%' || o.name
--        or r.detail::text like '%' || o.name || '%'
--   );
