import type { ActivityPost, ArchiveItem, SiteSettings, TimelineItem } from '../data/types';
import { removeAllMedia } from './media-storage.ts';
import { supabase } from './supabase.ts';

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

/**
 * 정렬용 날짜 칸을 아직 추가하지 않은 데이터베이스가 내는 오류.
 * 운영자가 마이그레이션을 실행하기 전에도 연혁 저장은 막히지 않아야 한다.
 */
export const isMissingSortDate = (error: { message?: string } | null) =>
  Boolean(error?.message?.includes('sorted_on'));

export async function saveTimelineItem(value: TimelineItem) {
  const { sorted_on, ...base } = {
    occurred_on: value.occurredOn,
    sorted_on: value.sortedOn || null,
    title: value.title,
    description: value.description,
  };
  const write = (row: Record<string, unknown>) => (value.id.startsWith('timeline-')
    ? client().from('timeline_items').insert(row)
    : client().from('timeline_items').update(row).eq('id', value.id)).select('id');

  const result = await write({ ...base, sorted_on });
  // 칸이 없는 경우에만 날짜를 빼고 다시 저장한다. 순서는 표시 문구에서 추정된다.
  fail(isMissingSortDate(result.error) ? await write(base) : result);
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

export async function deleteActivityPost(value: ActivityPost) {
  fail(await client().from('activity_posts').delete().eq('id', value.id).select('id'));
  // Best effort, and only after the row is gone: an orphaned file is worse than a retry.
  await removeAllMedia(value as unknown as Record<string, unknown>);
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

export async function deleteArchiveItem(value: ArchiveItem) {
  fail(await client().from('archive_items').delete().eq('id', value.id).select('id'));
  await removeAllMedia(value as unknown as Record<string, unknown>);
}
