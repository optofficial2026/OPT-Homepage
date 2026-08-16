import type { ActivityPost, ArchiveItem, SiteSettings, TimelineItem } from '../data/types';
import { supabase } from './supabase';

const client = () => {
  if (!supabase) throw new Error('Supabase가 연결되지 않았습니다.');
  return supabase;
};

const fail = ({ error, data }: { error: { message: string } | null; data: unknown[] | null }) => {
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('권한이 없거나 대상이 존재하지 않습니다.');
};

export async function updateSiteSettings(value: SiteSettings) {
  const result = await client().from('site_settings').update({
    recruitment_enabled: value.recruitmentEnabled,
    recruitment_popup_enabled: value.recruitmentPopupEnabled,
    recruitment_cohort: value.recruitmentCohort,
    recruitment_form_url: value.recruitmentFormUrl,
    recruitment_closed_message: value.recruitmentClosedMessage,
    activity_cohorts: value.activityCohorts,
    activity_members: value.activityMembers,
    activity_programs: value.activityPrograms,
  }).eq('id', true).select('id');
  fail(result);
}

export async function saveTimelineItem(value: TimelineItem) {
  const row = { occurred_on: value.occurredOn, title: value.title, description: value.description };
  const query = value.id.startsWith('timeline-')
    ? client().from('timeline_items').insert(row)
    : client().from('timeline_items').update(row).eq('id', value.id);
  fail(await query.select('id'));
}

export async function deleteTimelineItem(id: string) {
  fail(await client().from('timeline_items').delete().eq('id', id).select('id'));
}

export async function saveActivityPost(value: ActivityPost) {
  const row = {
    slug: value.slug, tag: value.tag, cohort: value.cohort, occurred_on: value.occurredOn,
    title: value.title, summary: value.summary, body: value.body,
    thumbnail_url: value.thumbnailUrl, hero_image_url: value.heroImageUrl, gallery_urls: value.galleryUrls,
  };
  const query = value.id.startsWith('new-')
    ? client().from('activity_posts').insert(row)
    : client().from('activity_posts').update(row).eq('id', value.id);
  fail(await query.select('id'));
}

export async function deleteActivityPost(id: string) {
  fail(await client().from('activity_posts').delete().eq('id', id).select('id'));
}

export async function saveArchiveItem(value: ArchiveItem) {
  const row = {
    slug: value.slug, kind: value.kind, cohort: value.cohort, occurred_on: value.occurredOn,
    title: value.title, summary: value.summary, thumbnail_url: value.thumbnailUrl, detail: value.detail,
  };
  const query = value.id.startsWith('new-')
    ? client().from('archive_items').insert(row)
    : client().from('archive_items').update(row).eq('id', value.id);
  fail(await query.select('id'));
}

export async function deleteArchiveItem(id: string) {
  fail(await client().from('archive_items').delete().eq('id', id).select('id'));
}
