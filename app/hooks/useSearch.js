// hooks/useSearch.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import useDebounce from './useDebounce/useDebounce';

export default function useSearch(items = [], options = {}) {
  const {
    searchFields = ['name', 'id'],
    caseSensitive = false,
    fuzzyMatch = true,
    minChars = 1,
    debounceMs = 300,
    onSearch = null
  } = options;
  
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState(items);
  const [searching, setSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, debounceMs);
  
  const searchInItem = useCallback((item, searchTerm) => {
    if (!searchTerm || searchTerm.length < minChars) return true;
    
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    return searchFields.some(field => {
      let value = item[field];
      if (value === undefined || value === null) return false;
      
      const strValue = caseSensitive ? String(value) : String(value).toLowerCase();
      
      if (fuzzyMatch) {
        return strValue.includes(term);
      } else {
        return strValue === term;
      }
    });
  }, [searchFields, caseSensitive, fuzzyMatch, minChars]);
  
  const applyFilters = useCallback((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;
      
      const itemValue = item[key];
      if (itemValue === undefined || itemValue === null) return false;
      
      if (typeof value === 'object') {
        if (value.min !== undefined && itemValue < value.min) return false;
        if (value.max !== undefined && itemValue > value.max) return false;
      } else if (Array.isArray(value)) {
        if (!value.includes(itemValue)) return false;
      } else {
        if (String(itemValue).toLowerCase() !== String(value).toLowerCase()) return false;
      }
    }
    return true;
  }, [filters]);
  
  const performSearch = useCallback(() => {
    setSearching(true);
    
    let filtered = items.filter(item => {
      const matchesSearch = searchInItem(item, debouncedQuery);
      const matchesFilters = applyFilters(item);
      return matchesSearch && matchesFilters;
    });
    
    setResults(filtered);
    setSearching(false);
    
    if (onSearch) {
      onSearch(filtered, { query: debouncedQuery, filters });
    }
  }, [items, debouncedQuery, filters, searchInItem, applyFilters, onSearch]);
  
  useEffect(() => {
    performSearch();
  }, [performSearch]);
  
  const clearSearch = () => {
    setQuery('');
    setFilters({});
  };
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const removeFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };
  
  const clearFilters = () => {
    setFilters({});
  };
  
  const getHighlightedText = (text, highlight) => {
    if (!highlight || highlight.length < minChars) return text;
    
    const term = caseSensitive ? highlight : highlight.toLowerCase();
    const textStr = String(text);
    const textLower = textStr.toLowerCase();
    
    if (!textLower.includes(term)) return textStr;
    
    const startIndex = textLower.indexOf(term);
    const endIndex = startIndex + term.length;
    
    return (
      <>
        {textStr.substring(0, startIndex)}
        <mark className="search-highlight">
          {textStr.substring(startIndex, endIndex)}
        </mark>
        {textStr.substring(endIndex)}
      </>
    );
  };
  
  return {
    query,
    setQuery,
    filters,
    results,
    searching,
    totalResults: results.length,
    hasResults: results.length > 0,
    clearSearch,
    updateFilter,
    removeFilter,
    clearFilters,
    getHighlightedText
  };
}