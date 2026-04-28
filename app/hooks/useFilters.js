// hooks/useFilters.js
'use client';

import { useState, useCallback, useMemo } from 'react';

export default function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === undefined || value === null || value === '') {
        delete newFilters[key];
      } else if (Array.isArray(value) && value.length === 0) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      return newFilters;
    });
  }, []);
  
  const updateMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);
  
  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  const getFilterValue = useCallback((key) => {
    return filters[key];
  }, [filters]);
  
  const getFilterDisplay = useCallback((key, displayMap = {}) => {
    const value = filters[key];
    if (value === undefined) return null;
    
    if (displayMap[key]) {
      if (typeof displayMap[key] === 'function') {
        return displayMap[key](value);
      }
      return displayMap[key][value] || value;
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object') {
      if (value.min !== undefined && value.max !== undefined) {
        return `${value.min} - ${value.max}`;
      }
      if (value.min !== undefined) return `≥ ${value.min}`;
      if (value.max !== undefined) return `≤ ${value.max}`;
    }
    
    return value;
  }, [filters]);
  
  const getAllFilters = useCallback(() => {
    return filters;
  }, [filters]);
  
  const isFilterActive = useCallback((key) => {
    const value = filters[key];
    if (value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      return value.min !== undefined || value.max !== undefined;
    }
    return true;
  }, [filters]);
  
  const getActiveFilters = useCallback(() => {
    return Object.keys(filters).filter(key => isFilterActive(key));
  }, [filters, isFilterActive]);
  
  const filterData = useCallback((data, filterFunctions = {}) => {
    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        const filterFn = filterFunctions[key];
        if (filterFn) {
          if (!filterFn(item, value)) return false;
        } else {
          // Default filter logic
          const itemValue = item[key];
          if (itemValue === undefined) return false;
          
          if (Array.isArray(value)) {
            if (!value.includes(itemValue)) return false;
          } else if (typeof value === 'object') {
            if (value.min !== undefined && itemValue < value.min) return false;
            if (value.max !== undefined && itemValue > value.max) return false;
          } else {
            if (String(itemValue).toLowerCase() !== String(value).toLowerCase()) return false;
          }
        }
      }
      return true;
    });
  }, [filters]);
  
  const saveFilters = useCallback((name) => {
    const savedFilters = JSON.parse(localStorage.getItem('saved_filters') || '{}');
    savedFilters[name] = filters;
    localStorage.setItem('saved_filters', JSON.stringify(savedFilters));
    return savedFilters;
  }, [filters]);
  
  const loadFilters = useCallback((name) => {
    const savedFilters = JSON.parse(localStorage.getItem('saved_filters') || '{}');
    if (savedFilters[name]) {
      setFilters(savedFilters[name]);
      return savedFilters[name];
    }
    return null;
  }, []);
  
  const deleteSavedFilter = useCallback((name) => {
    const savedFilters = JSON.parse(localStorage.getItem('saved_filters') || '{}');
    delete savedFilters[name];
    localStorage.setItem('saved_filters', JSON.stringify(savedFilters));
  }, []);
  
  const getAllSavedFilters = useCallback(() => {
    return JSON.parse(localStorage.getItem('saved_filters') || '{}');
  }, []);
  
  useMemo(() => {
    const count = Object.keys(filters).filter(key => isFilterActive(key)).length;
    setActiveFilterCount(count);
  }, [filters, isFilterActive]);
  
  return {
    filters,
    activeFilterCount,
    updateFilter,
    updateMultipleFilters,
    removeFilter,
    clearAllFilters,
    getFilterValue,
    getFilterDisplay,
    getAllFilters,
    isFilterActive,
    getActiveFilters,
    filterData,
    saveFilters,
    loadFilters,
    deleteSavedFilter,
    getAllSavedFilters
  };
}