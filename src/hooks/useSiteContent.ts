import { useCallback, useEffect, useState } from 'react';
import { defaultContent } from '../data/content';
import type { SiteContent } from '../data/types';
import { readContentCache } from '../lib/content-cache';
import { loadSiteContent } from '../lib/content-repository';

export function useSiteContent() {
  // Starting from the cache keeps bundled placeholder content off the screen on repeat visits.
  const [data, setData] = useState<SiteContent>(() => readContentCache(localStorage) ?? defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    const result = await loadSiteContent();
    setData(result.data);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}
