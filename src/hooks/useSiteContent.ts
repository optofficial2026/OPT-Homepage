import { useCallback, useEffect, useState } from 'react';
import { defaultContent } from '../data/content';
import type { SiteContent } from '../data/types';
import { readContentCache } from '../lib/content-cache';
import { loadSiteContent, type ContentResult } from '../lib/content-repository';

export function useSiteContent() {
  // Starting from the cache keeps bundled placeholder content off the screen on repeat visits.
  const [data, setData] = useState<SiteContent>(() => readContentCache(localStorage) ?? defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Readers must be able to tell live content from a stale fallback.
  const [source, setSource] = useState<ContentResult['source']>('supabase');

  const refetch = useCallback(async () => {
    const result = await loadSiteContent();
    setData(result.data);
    setError(result.error);
    setSource(result.source);
    setLoading(false);
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);
  return { data, loading, error, source, refetch };
}
