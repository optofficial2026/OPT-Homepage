alter table public.site_settings
  add column if not exists recruitment_popup_enabled boolean not null default true;
