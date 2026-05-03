'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { ...options, headers });
      
      // For 401, don't treat as error - just return empty data
      if (response.status === 401) {
        setData([]);
        setLoading(false);
        return;
      }
      
      // For 404, return empty data
      if (response.status === 404) {
        setData([]);
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      
      // Handle both array and object responses
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.data && Array.isArray(result.data)) {
        setData(result.data);
      } else if (result.success === false) {
        setData([]);
      } else {
        setData(result);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}