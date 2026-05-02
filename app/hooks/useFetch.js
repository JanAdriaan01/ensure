'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fetchData = useCallback(async () => {
    if (!url || !mounted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (mounted) {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [url, options, mounted]);

  useEffect(() => {
    if (url && mounted) {
      fetchData();
    }
  }, [url, fetchData, mounted]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refetch,
    isSuccess: !loading && !error && data !== null,
    isError: error !== null,
  };
}

// For POST/PUT/DELETE requests
export function useMutation(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const mutate = useCallback(async (body, method = 'POST') => {
    if (!mounted) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (mounted) {
        setData(result);
        setLoading(false);
      }
      return { success: true, data: result };
    } catch (err) {
      console.error('Mutation error:', err);
      if (mounted) {
        setError(err.message);
        setLoading(false);
      }
      return { success: false, error: err.message };
    }
  }, [url, options, mounted]);

  return { mutate, data, loading, error };
}

export default useFetch;