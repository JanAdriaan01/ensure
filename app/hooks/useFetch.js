'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchData = useCallback(async () => {
    if (!url || !isClient) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options, isClient]);

  useEffect(() => {
    if (isClient) {
      fetchData();
    }
  }, [fetchData, isClient]);

  return { data, loading, error, refetch: fetchData };
}