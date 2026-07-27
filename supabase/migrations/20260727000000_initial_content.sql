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
