import { defaultContent } from '../data/content.ts';
import type { SiteContent } from '../data/types';

const KEY = 'opt-site-content-v1';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function readContentCache(storage: StorageLike): SiteContent | null {
  try {
    const value = JSON.parse(storage.getItem(KEY) ?? 'null') as { version?: number; data?: Partial<SiteContent> } | null;
    const data = value?.data;
    const isValid = value?.version === 1
      && data
      && typeof data.settings === 'object'
      && data.settings !== null
      && !Array.isArray(data.settings)
      && Array.isArray(data.timeline)
      && Array.isArray(data.activities)
      && Array.isArray(data.archives)
    if (!isValid) return null;
    return {
      ...(data as SiteContent),
      settings: { ...defaultContent.settings, ...data.settings },
    };
  } catch {
    return null;
  }
}

export function writeContentCache(storage: StorageLike, data: SiteContent) {
  try {
    storage.setItem(KEY, JSON.stringify({ version: 1, savedAt: new Date().toISOString(), data }));
  } catch {
    // Browsing must continue when storage is blocked or full.
  }
}
