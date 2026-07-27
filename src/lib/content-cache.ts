import type { SiteContent } from '../data/types';

const KEY = 'opt-site-content-v1';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function readContentCache(storage: StorageLike): SiteContent | null {
  try {
    const value = JSON.parse(storage.getItem(KEY) ?? 'null') as { version?: number; data?: Partial<SiteContent> } | null;
    const data = value?.data;
    return value?.version === 1
      && data
      && typeof data.settings === 'object'
      && data.settings !== null
      && !Array.isArray(data.settings)
      && Array.isArray(data.timeline)
      && Array.isArray(data.activities)
      && Array.isArray(data.archives)
      ? data as SiteContent
      : null;
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
