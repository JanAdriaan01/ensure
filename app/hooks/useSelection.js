// hooks/useSelection.js
'use client';

import { useState, useCallback, useMemo } from 'react';

export default function useSelection(items = [], initialSelectedIds = []) {
  const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));
  
  const isSelected = useCallback((id) => {
    return selectedIds.has(id);
  }, [selectedIds]);
  
  const selectItem = useCallback((id) => {
    setSelectedIds(prev => new Set(prev).add(id));
  }, []);
  
  const deselectItem = useCallback((id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);
  
  const toggleItem = useCallback((id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);
  
  const selectAll = useCallback(() => {
    const allIds = items.map(item => item.id);
    setSelectedIds(new Set(allIds));
  }, [items]);
  
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);
  
  const selectRange = useCallback((startId, endId) => {
    const itemIds = items.map(item => item.id);
    const startIndex = itemIds.indexOf(startId);
    const endIndex = itemIds.indexOf(endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const rangeStart = Math.min(startIndex, endIndex);
    const rangeEnd = Math.max(startIndex, endIndex);
    
    const rangeIds = itemIds.slice(rangeStart, rangeEnd + 1);
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      rangeIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, [items]);
  
  const invertSelection = useCallback(() => {
    const allIds = items.map(item => item.id);
    setSelectedIds(prev => {
      const newSet = new Set();
      allIds.forEach(id => {
        if (!prev.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [items]);
  
  const selectByPredicate = useCallback((predicate) => {
    const idsToSelect = items.filter(predicate).map(item => item.id);
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      idsToSelect.forEach(id => newSet.add(id));
      return newSet;
    });
  }, [items]);
  
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);
  const allSelected = useMemo(() => 
    items.length > 0 && selectedCount === items.length,
    [items.length, selectedCount]
  );
  const someSelected = useMemo(() => 
    selectedCount > 0 && selectedCount < items.length,
    [selectedCount, items.length]
  );
  
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);
  
  const getSelectionState = useCallback(() => {
    return {
      allSelected,
      someSelected,
      selectedCount,
      totalCount: items.length
    };
  }, [allSelected, someSelected, selectedCount, items.length]);
  
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);
  
  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    selectedCount,
    allSelected,
    someSelected,
    isSelected,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    selectRange,
    invertSelection,
    selectByPredicate,
    clearSelection,
    getSelectionState
  };
}