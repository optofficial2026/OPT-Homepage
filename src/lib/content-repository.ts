import { defaultContent, sortTimelineNewestFirst } from '../data/content';
import type { ActivityPost, ArchiveItem, SiteContent, SiteSettings, TimelineItem } from '../data/types';
import { readContentCache, writeContentCache } from './content-cache';
import { supabase } from './supabase';

type Source = 'supabase' | 'cache' | 'defaults';
export type ContentResult = { data: SiteContent; source: Source; error: string };

const settingsFromRow = (row: Record<string, unknown>): SiteSettings => ({
  recruitmentEnabled: Boolean(row.recruitment_enabled),
  recruitmentCohort: Number(row.recruitment_cohort),
  recruitmentCount: Number(row.recruitment_count),
  recruitmentFormUrl: String(row.recruitment_form_url ?? ''),
  recruitmentClosedMessage: String(row.recruitment_closed_message ?? ''),
  activityCohorts: Number(row.activity_cohorts),
  activityMembers: Number(row.activity_members),
  activityPrograms: Number(row.activity_programs),
});

const timelineFromRow = (row: Record<string, unknown>): TimelineItem => ({
  id: String(row.id),
  occurredOn: String(row.occurred_on),
  title: String(row.title),
  description: String(row.description ?? ''),
});

const activityFromRow = (row: Record<string, unknown>): ActivityPost => ({
  id: String(row.id),
  slug: String(row.slug),
  tag: row.tag as ActivityPost['tag'],
  cohort: Number(row.cohort),
  occurredOn: String(row.occurred_on),
  title: String(row.title),
  summary: String(row.summary ?? ''),
  body: String(row.body ?? ''),
  thumbnailUrl: String(row.thumbnail_url ?? ''),
  heroImageUrl: String(row.hero_image_url ?? ''),
  galleryUrls: Array.isArray(row.gallery_urls) ? row.gallery_urls.map(String) : [],
});

const archiveFromRow = (row: Record<string, unknown>): ArchiveItem => ({
  id: String(row.id),
  slug: String(row.slug),
  kind: row.kind as ArchiveItem['kind'],
  cohort: Number(row.cohort),
  occurredOn: String(row.occurred_on),
  title: String(row.title),
  summary: String(row.summary ?? ''),
  thumbnailUrl: String(row.thumbnail_url ?? ''),
  detail: row.detail as ArchiveItem['detail'],
});

export async function loadSiteContent(): Promise<ContentResult> {
  if (supabase) {
    try {
      const [settings, timeline, activities, archives] = await Promise.all([
        supabase.from('site_settings').select('*').maybeSingle(),
        supabase.from('timeline_items').select('*'),
        supabase.from('activity_posts').select('*').order('occurred_on', { ascending: false }),
        supabase.from('archive_items').select('*').order('occurred_on', { ascending: false }),
      ]);
      const error = settings.error ?? timeline.error ?? activities.error ?? archives.error;
      if (error) throw error;
      const data: SiteContent = {
        settings: settings.data ? settingsFromRow(settings.data) : defaultContent.settings,
        timeline: sortTimelineNewestFirst((timeline.data ?? []).map(timelineFromRow)),
        activities: (activities.data ?? []).map(activityFromRow),
        archives: (archives.data ?? []).map(archiveFromRow),
      };
      writeContentCache(localStorage, data);
      return { data, source: 'supabase', error: '' };
    } catch (error) {
      const cached = readContentCache(localStorage);
      return {
        data: cached ?? defaultContent,
        source: cached ? 'cache' : 'defaults',
        error: error instanceof Error ? error.message : '콘텐츠를 불러오지 못했습니다.',
      };
    }
  }
  const cached = readContentCache(localStorage);
  return { data: cached ?? defaultContent, source: cached ? 'cache' : 'defaults', error: '' };
}
