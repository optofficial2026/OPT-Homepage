import { useCallback, useEffect, useState } from 'react';
import { defaultContent } from '../data/content';
import type { SiteContent } from '../data/types';
import { loadSiteContent } from '../lib/content-repository';

export function useSiteContent() {
  const [data, setData] = useState<SiteContent>(defaultContent);
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
