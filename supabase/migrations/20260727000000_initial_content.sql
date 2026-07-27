create extension if not exists pgcrypto;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  recruitment_enabled boolean not null default false,
  recruitment_cohort integer not null default 1 check (recruitment_cohort >= 0),
  recruitment_count integer not null default 0 check (recruitment_count >= 0),
  recruitment_form_url text not null default '',
  recruitment_closed_message text not null default '현재는 모집 중이 아닙니다. 다음 기수 지원 때 다시 찾아주세요.',
  activity_cohorts integer not null default 0 check (activity_cohorts >= 0),
  activity_members integer not null default 0 check (activity_members >= 0),
  activity_programs integer not null default 0 check (activity_programs >= 0),
  updated_at timestamptz not null default now()
);

create table public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  occurred_on text not null,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  tag text not null check (tag in ('STUDY', 'SEMINAR', 'EVENT')),
  cohort integer not null check (cohort >= 0),
  occurred_on date not null,
  title text not null,
  summary text not null default '',
  body text not null default '',
  thumbnail_url text not null default '',
  hero_image_url text not null default '',
  gallery_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.archive_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  kind text not null check (kind in ('seminar', 'hackathon')),
  cohort integer not null check (cohort >= 0),
  occurred_on date not null,
  title text not null,
  summary text not null default '',
  thumbnail_url text not null default '',
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_profiles where user_id = auth.uid()) $$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger site_settings_updated before update on public.site_settings
for each row execute function public.touch_updated_at();
create trigger timeline_items_updated before update on public.timeline_items
for each row execute function public.touch_updated_at();
create trigger activity_posts_updated before update on public.activity_posts
for each row execute function public.touch_updated_at();
create trigger archive_items_updated before update on public.archive_items
for each row execute function public.touch_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.timeline_items enable row level security;
alter table public.activity_posts enable row level security;
alter table public.archive_items enable row level security;

create policy "users can read their admin membership" on public.admin_profiles
for select using (user_id = auth.uid());

create policy "public reads settings" on public.site_settings for select using (true);
create policy "public reads timeline" on public.timeline_items for select using (true);
create policy "public reads activities" on public.activity_posts for select using (true);
create policy "public reads archives" on public.archive_items for select using (true);

create policy "admins update settings" on public.site_settings
for update using (public.is_admin()) with check (public.is_admin());
create policy "admins manage timeline" on public.timeline_items
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage activities" on public.activity_posts
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage archives" on public.archive_items
for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (
  recruitment_enabled, recruitment_cohort, recruitment_count,
  activity_cohorts, activity_members, activity_programs
) values (true, 2, 0, 1, 11, 4) on conflict (id) do nothing;

insert into public.timeline_items (occurred_on, title, description) values
  ('2026.09', '2기 부원 모집', '2026년 9월부터 활동 예정입니다.'),
  ('2026년 하반기', '후반부', '기술 세미나, 논문 세미나, 해커톤을 진행합니다.'),
  ('2026년 여름방학', '여름방학', '개별 스터디 모임, 바이브 코딩, AI 공모전 참가 등 다양한 소모임을 진행 중입니다.'),
  ('2026년 상반기', '전반부', '개념 스터디 4회를 진행합니다.'),
  ('2026.03.07', 'OPT 시작', '외대 유일의, 그리고 최고의 AI 학회가 되고자 모였습니다.');

insert into public.activity_posts (slug, tag, cohort, occurred_on, title, summary, body) values
  ('transformer-review', 'SEMINAR', 1, '2025-11-01', 'Transformer 구조 뜯어보기', '어텐션부터 인코더·디코더까지 함께 파봤습니다.', '어텐션부터 인코더·디코더까지 함께 파봤습니다.'),
  ('deep-learning-study', 'STUDY', 1, '2025-10-01', '밑바닥부터 시작하는 딥러닝', '3주차 · 신경망 학습과 역전파.', '3주차 · 신경망 학습과 역전파.'),
  ('demo-day', 'EVENT', 1, '2025-12-01', '5기 데모데이 현장', '한 학기 결과물을 함께 발표했습니다.', '한 학기 결과물을 함께 발표했습니다.'),
  ('diffusion-review', 'SEMINAR', 1, '2025-09-01', 'Diffusion 모델 리뷰', '생성모델의 원리를 뜯어봤습니다.', '생성모델의 원리를 뜯어봤습니다.'),
  ('linear-algebra-study', 'STUDY', 1, '2025-09-02', 'AI를 위한 선형대수', '이론 스터디를 위한 수학 기초 다지기.', '이론 스터디를 위한 수학 기초 다지기.'),
  ('summer-idea-session', 'EVENT', 1, '2025-08-01', '여름 아이디어 세션', '해커톤 준비 브레인스토밍 — 업데이트 예정.', '해커톤 준비 브레인스토밍 — 업데이트 예정.');

insert into public.archive_items (slug, kind, cohort, occurred_on, title, summary, detail) values
  ('transformer-seminar', 'seminar', 1, '2025-11-01', 'Transformer 구조 뜯어보기', 'SLIDE 자료', '{"body":"세미나 상세 내용이 준비 중입니다.","heroImageUrl":"","galleryUrls":[],"resourceUrl":""}'),
  ('diffusion-seminar', 'seminar', 1, '2025-09-01', 'Diffusion 모델 리뷰', 'SLIDE 자료', '{"body":"세미나 상세 내용이 준비 중입니다.","heroImageUrl":"","galleryUrls":[],"resourceUrl":""}'),
  ('reinforcement-learning-seminar', 'seminar', 1, '2025-06-01', '강화학습 기초 세미나', 'NOTE 자료', '{"body":"세미나 상세 내용이 준비 중입니다.","heroImageUrl":"","galleryUrls":[],"resourceUrl":""}'),
  ('cnn-vit-seminar', 'seminar', 1, '2025-04-01', 'CNN부터 ViT까지', 'SLIDE 자료', '{"body":"세미나 상세 내용이 준비 중입니다.","heroImageUrl":"","galleryUrls":[],"resourceUrl":""}'),
  ('statistics-seminar', 'seminar', 1, '2025-03-01', '확률·통계 리마인드 세션', 'NOTE 자료', '{"body":"세미나 상세 내용이 준비 중입니다.","heroImageUrl":"","galleryUrls":[],"resourceUrl":""}'),
  ('paper-pilot', 'hackathon', 1, '2025-12-01', 'PaperPilot', '논문 PDF를 요약하고 핵심을 질문할 수 있는 리서치 보조 도구.', '{"tagline":"논문 PDF를 요약하고 핵심을 질문할 수 있는 리서치 보조 도구.","award":"","heroImageUrl":"","problem":"","solution":"","features":[],"galleryUrls":[],"process":[],"architecture":"","retrospective":"","result":"","techStack":["Python","LangChain","React"],"teamName":"","teamMembers":[],"githubUrl":"","demoUrl":"","presentationUrl":""}'),
  ('study-loop', 'hackathon', 1, '2025-08-01', 'StudyLoop', '스터디 진도와 회고를 기록하는 학습 트래커.', '{"tagline":"스터디 진도와 회고를 기록하는 학습 트래커.","award":"","heroImageUrl":"","problem":"","solution":"","features":[],"galleryUrls":[],"process":[],"architecture":"","retrospective":"","result":"","techStack":["Next.js","Supabase"],"teamName":"","teamMembers":[],"githubUrl":"","demoUrl":"","presentationUrl":""}');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media', 'content-media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads content media" on storage.objects
for select using (bucket_id = 'content-media');
create policy "admins upload content media" on storage.objects
for insert with check (bucket_id = 'content-media' and public.is_admin());
create policy "admins update content media" on storage.objects
for update using (bucket_id = 'content-media' and public.is_admin());
create policy "admins delete content media" on storage.objects
for delete using (bucket_id = 'content-media' and public.is_admin());
