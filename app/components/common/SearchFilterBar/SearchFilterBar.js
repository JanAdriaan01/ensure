// components/common/SearchFilterBar/SearchFilterBar.js
'use client';

import { useState, useEffect } from 'react';

export default function SearchFilterBar({ 
  onSearch,
  onFilterChange,
  filters = [],
  placeholder = "Search...",
  showDateRange = false,
  showAdvanced = false,
  savedFilters = [],
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        query: searchQuery,
        filters: activeFilters,
        dateRange: showDateRange ? dateRange : null
      });
    }
  };
  
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    if (!value) delete newFilters[filterKey];
    setActiveFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };
  
  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
    if (onSearch) {
      onSearch({ query: '', filters: {}, dateRange: null });
    }
  };
  
  const applySavedFilter = (savedFilter) => {
    setActiveFilters(savedFilter.filters);
    setSearchQuery(savedFilter.query || '');
    if (savedFilter.dateRange) setDateRange(savedFilter.dateRange);
    if (onSearch) {
      onSearch({
        query: savedFilter.query || '',
        filters: savedFilter.filters,
        dateRange: savedFilter.dateRange
      });
    }
  };
  
  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, activeFilters, dateRange]);
  
  const activeFilterCount = Object.keys(activeFilters).length;
  
  return (
    <div className={`search-filter-bar ${className}`}>
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
        
        <div className="action-buttons">
          {filters.length > 0 && (
            <button 
              className={`filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🔧 Filters
              {activeFilterCount > 0 && (
                <span className="filter-count">{activeFilterCount}</span>
              )}
            </button>
          )}
          
          {showDateRange && (
            <button 
              className={`date-btn ${dateRange.start ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              📅 Date Range
            </button>
          )}
          
          {savedFilters.length > 0 && (
            <button 
              className="saved-filters-btn"
              onClick={() => setShowSavedFilters(!showSavedFilters)}
            >
              💾 Saved Filters
            </button>
          )}
          
          {(searchQuery || activeFilterCount > 0 || dateRange.start) && (
            <button className="clear-all-btn" onClick={clearAllFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {(showFilters || showSavedFilters) && (
        <div className="filters-panel">
          {showFilters && filters.length > 0 && (
            <div className="filters-grid">
              {filters.map(filter => (
                <div key={filter.key} className="filter-group">
                  <label className="filter-label">{filter.label}</label>
                  
                  {filter.type === 'select' && (
                    <select
                      className="filter-select"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    >
                      <option value="">All {filter.label}</option>
                      {filter.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  
                  {filter.type === 'multiselect' && (
                    <div className="multiselect-group">
                      {filter.options.map(opt => (
                        <label key={opt.value} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={(activeFilters[filter.key] || []).includes(opt.value)}
                            onChange={(e) => {
                              const current = activeFilters[filter.key] || [];
                              const newValue = e.target.checked
                                ? [...current, opt.value]
                                : current.filter(v => v !== opt.value);
                              handleFilterChange(filter.key, newValue);
                            }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {filter.type === 'range' && (
                    <div className="range-group">
                      <input
                        type="number"
                        className="range-input"
                        placeholder="Min"
                        value={activeFilters[filter.key]?.min || ''}
                        onChange={(e) => handleFilterChange(filter.key, {
                          ...activeFilters[filter.key],
                          min: e.target.value
                        })}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        className="range-input"
                        placeholder="Max"
                        value={activeFilters[filter.key]?.max || ''}
                        onChange={(e) => handleFilterChange(filter.key, {
                          ...activeFilters[filter.key],
                          max: e.target.value
                        })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {showDateRange && (
            <div className="date-range-group">
              <label className="filter-label">Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  className="date-input"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <span>to</span>
                <input
                  type="date"
                  className="date-input"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          )}
          
          {showSavedFilters && savedFilters.length > 0 && (
            <div className="saved-filters-list">
              <label className="filter-label">Saved Filters</label>
              {savedFilters.map((saved, idx) => (
                <button
                  key={idx}
                  className="saved-filter-item"
                  onClick={() => applySavedFilter(saved)}
                >
                  <span>💾 {saved.name}</span>
                  <span className="saved-filter-count">
                    {Object.keys(saved.filters).length} filters
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeFilterCount > 0 && (
        <div className="active-filters">
          {Object.entries(activeFilters).map(([key, value]) => (
            <div key={key} className="active-filter-tag">
              <span className="filter-label-display">
                {filters.find(f => f.key === key)?.label || key}:
              </span>
              <span className="filter-value">
                {Array.isArray(value) ? value.join(', ') : value}
              </span>
              <button 
                className="remove-filter"
                onClick={() => handleFilterChange(key, null)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .search-filter-bar {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }
        
        .search-section {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .search-input-wrapper {
          flex: 1;
          position: relative;
          min-width: 200px;
        }
        
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
        }
        
        .search-input {
          width: 100%;
          padding: 0.625rem 2rem 0.625rem 2.25rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .clear-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .filter-btn, .date-btn, .saved-filters-btn, .clear-all-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
          position: relative;
        }
        
        .filter-btn:hover, .date-btn:hover, .saved-filters-btn:hover {
          background: #f3f4f6;
        }
        
        .filter-btn.active, .date-btn.active {
          background: #dbeafe;
          border-color: #3b82f6;
          color: #1e40af;
        }
        
        .filter-count {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
        }
        
        .clear-all-btn {
          color: #ef4444;
          border-color: #fee2e2;
        }
        
        .clear-all-btn:hover {
          background: #fee2e2;
        }
        
        .filters-panel {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .filter-group, .date-range-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .filter-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }
        
        .multiselect-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .range-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .range-input, .date-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        
        .date-inputs {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .saved-filters-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .saved-filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .saved-filter-item:hover {
          background: #f3f4f6;
          border-color: #3b82f6;
        }
        
        .saved-filter-count {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .active-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          font-size: 0.75rem;
        }
        
        .filter-label-display {
          font-weight: 500;
          color: #6b7280;
        }
        
        .filter-value {
          color: #111827;
        }
        
        .remove-filter {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          margin-left: 0.25rem;
        }
        
        .remove-filter:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}