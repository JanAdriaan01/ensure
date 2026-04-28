// hooks/useSort.js
'use client';

import { useState, useMemo, useCallback } from 'react';

export default function useSort(items = [], defaultSort = { field: null, direction: 'asc' }) {
  const [sortField, setSortField] = useState(defaultSort.field);
  const [sortDirection, setSortDirection] = useState(defaultSort.direction);
  
  const toggleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);
  
  const clearSort = useCallback(() => {
    setSortField(null);
    setSortDirection('asc');
  }, []);
  
  const getSortValue = useCallback((item) => {
    if (!sortField) return null;
    
    let value = item[sortField];
    
    // Handle nested properties
    if (typeof sortField === 'string' && sortField.includes('.')) {
      value = sortField.split('.').reduce((obj, key) => obj?.[key], item);
    }
    
    return value;
  }, [sortField]);
  
  const compareValues = useCallback((a, b) => {
    const valA = getSortValue(a);
    const valB = getSortValue(b);
    
    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    
    // Handle different types
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
    
    if (typeof valA === 'string' && typeof valB === 'string') {
      const comparison = valA.localeCompare(valB);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    // Handle dates
    if (valA instanceof Date || valB instanceof Date) {
      const dateA = new Date(valA);
      const dateB = new Date(valB);
      const comparison = dateA - dateB;
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    // Default string comparison
    const strA = String(valA);
    const strB = String(valB);
    const comparison = strA.localeCompare(strB);
    return sortDirection === 'asc' ? comparison : -comparison;
  }, [getSortValue, sortDirection]);
  
  const sortedItems = useMemo(() => {
    if (!sortField) return items;
    
    return [...items].sort(compareValues);
  }, [items, sortField, compareValues]);
  
  const getSortIcon = useCallback((field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  }, [sortField, sortDirection]);
  
  const getSortLabel = useCallback((field, labels = {}) => {
    if (sortField !== field) return labels.default || 'Sort';
    return sortDirection === 'asc' ? (labels.asc || 'Ascending') : (labels.desc || 'Descending');
  }, [sortField, sortDirection]);
  
  const isSortedBy = useCallback((field) => {
    return sortField === field;
  }, [sortField]);
  
  return {
    sortedItems,
    sortField,
    sortDirection,
    toggleSort,
    clearSort,
    getSortIcon,
    getSortLabel,
    isSortedBy
  };
}