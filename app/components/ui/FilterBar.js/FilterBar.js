'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';

export default function FilterBar({ 
  filters = [], 
  onFilterChange,
  onClearAll,
  initialFilters = {},
  showSearch = true,
  searchPlaceholder = 'Search...',
  className = '',
  autoApply = true,
  debounceDelay = 500
}) {
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, debounceDelay);
  const debouncedFilters = useDebounce(activeFilters, debounceDelay);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply filters when they change
  useEffect(() => {
    if (autoApply) {
      const allFilters = { ...activeFilters };
      if (showSearch && debouncedSearch) {
        allFilters.search = debouncedSearch;
      }
      if (onFilterChange) onFilterChange(allFilters);
    }
  }, [debouncedFilters, debouncedSearch, autoApply, onFilterChange, showSearch]);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value === '' || value === null || value === undefined || value === false) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleApplyFilters = () => {
    const allFilters = { ...activeFilters };
    if (showSearch && searchTerm) {
      allFilters.search = searchTerm;
    }
    if (onFilterChange) onFilterChange(allFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    if (onFilterChange) onFilterChange({});
    if (onClearAll) onClearAll();
  };

  const renderFilterInput = (filter) => {
    const value = activeFilters[filter.key] !== undefined ? activeFilters[filter.key] : (filter.defaultValue || '');
    
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-select"
            disabled={filter.disabled}
          >
            <option value="">{filter.placeholder || 'All'}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.icon && <span className="option-icon">{opt.icon}</span>}
                {opt.label}
              </option>
            ))}
          </select>
        );
        
      case 'multi-select':
        return (
          <div className="multi-select">
            <select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange(filter.key, selected);
              }}
              className="filter-multi-select"
              size={filter.size || 3}
              disabled={filter.disabled}
            >
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'search':
        return (
          <input
            type="text"
            placeholder={filter.placeholder || 'Search...'}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-input"
            disabled={filter.disabled}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-input"
            disabled={filter.disabled}
          />
        );
        
      case 'date-range':
        return (
          <div className="date-range">
            <input
              type="date"
              value={value.start || ''}
              onChange={(e) => handleFilterChange(filter.key, { ...value, start: e.target.value })}
              placeholder="Start date"
              className="date-input"
              disabled={filter.disabled}
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={value.end || ''}
              onChange={(e) => handleFilterChange(filter.key, { ...value, end: e.target.value })}
              placeholder="End date"
              className="date-input"
              disabled={filter.disabled}
            />
          </div>
        );
        
      case 'number-range':
        return (
          <div className="number-range">
            <input
              type="number"
              value={value.min || ''}
              onChange={(e) => handleFilterChange(filter.key, { ...value, min: e.target.value })}
              placeholder="Min"
              className="number-input"
              disabled={filter.disabled}
            />
            <span className="number-separator">-</span>
            <input
              type="number"
              value={value.max || ''}
              onChange={(e) => handleFilterChange(filter.key, { ...value, max: e.target.value })}
              placeholder="Max"
              className="number-input"
              disabled={filter.disabled}
            />
          </div>
        );
        
      case 'checkbox':
        return (
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
              disabled={filter.disabled}
            />
            <span className="checkbox-label">{filter.checkboxLabel || filter.label}</span>
          </label>
        );
        
      case 'radio':
        return (
          <div className="radio-group">
            {filter.options.map(opt => (
              <label key={opt.value} className="filter-radio">
                <input
                  type="radio"
                  name={filter.key}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  disabled={filter.disabled}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  const activeCount = Object.keys(activeFilters).length + (searchTerm ? 1 : 0);
  const visibleFilters = isExpanded ? filters : filters.slice(0, 3);
  const hasMoreFilters = filters.length > 3;

  // Mobile view
  if (isMobile) {
    return (
      <div className={`filter-bar-mobile ${className}`}>
        <div className="filter-bar-header">
          {showSearch && (
            <div className="mobile-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="mobile-search-input"
              />
            </div>
          )}
          <button 
            className="mobile-filter-toggle"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <span className="filter-icon">⚙️</span>
            Filters
            {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
          </button>
        </div>
        
        {showMobileFilters && (
          <div className="mobile-filters">
            {filters.map(filter => (
              <div key={filter.key} className="mobile-filter-group">
                <label className="mobile-filter-label">{filter.label}</label>
                {renderFilterInput(filter)}
              </div>
            ))}
            <div className="mobile-filter-actions">
              <button onClick={handleApplyFilters} className="apply-btn">Apply</button>
              <button onClick={clearFilters} className="clear-btn-mobile">Clear</button>
            </div>
          </div>
        )}
        
        <style jsx>{`
          .filter-bar-mobile {
            background: white;
            border-radius: 0.75rem;
            padding: 0.75rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
          }
          .filter-bar-header {
            display: flex;
            gap: 0.75rem;
          }
          .mobile-search {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: #f9fafb;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
          }
          .search-icon {
            font-size: 0.875rem;
            color: #9ca3af;
          }
          .mobile-search-input {
            flex: 1;
            border: none;
            background: none;
            outline: none;
            font-size: 0.875rem;
          }
          .mobile-filter-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            cursor: pointer;
          }
          .filter-count {
            background: #2563eb;
            color: white;
            padding: 0.125rem 0.375rem;
            border-radius: 9999px;
            font-size: 0.625rem;
          }
          .mobile-filters {
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid #e5e7eb;
          }
          .mobile-filter-group {
            margin-bottom: 1rem;
          }
          .mobile-filter-label {
            display: block;
            font-size: 0.7rem;
            font-weight: 500;
            color: #6b7280;
            margin-bottom: 0.25rem;
          }
          .mobile-filter-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1rem;
          }
          .apply-btn, .clear-btn-mobile {
            flex: 1;
            padding: 0.5rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            cursor: pointer;
          }
          .apply-btn {
            background: #2563eb;
            color: white;
            border: none;
          }
          .clear-btn-mobile {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            color: #6b7280;
          }
          :global(.filter-select),
          :global(.filter-input),
          :global(.filter-multi-select) {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            background: white;
          }
          :global(.date-range),
          :global(.number-range) {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }
          :global(.date-input),
          :global(.number-input) {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
          }
          .date-separator, .number-separator {
            font-size: 0.75rem;
            color: #9ca3af;
          }
          .filter-checkbox {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.5rem 0;
          }
          .radio-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .filter-radio {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // Desktop view
  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-row">
        {showSearch && (
          <div className="search-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>
        )}
        
        {visibleFilters.map(filter => (
          <div key={filter.key} className="filter-group">
            <label className="filter-label">{filter.label}</label>
            {renderFilterInput(filter)}
          </div>
        ))}
        
        {hasMoreFilters && (
          <button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? '▲ Less filters' : '▼ More filters'}
          </button>
        )}
        
        {!autoApply && (
          <button className="apply-btn-desktop" onClick={handleApplyFilters}>
            Apply
          </button>
        )}
        
        {activeCount > 0 && (
          <div className="filter-actions">
            <span className="active-badge">{activeCount} active</span>
            <button className="clear-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .filter-bar {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
        }
        .search-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          min-width: 200px;
        }
        .search-icon {
          font-size: 0.875rem;
          color: #9ca3af;
        }
        .search-input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-size: 0.875rem;
        }
        .clear-search {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          font-size: 0.75rem;
          padding: 0;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 150px;
        }
        .filter-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }
        :global(.filter-select),
        :global(.filter-input),
        :global(.filter-multi-select) {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          min-width: 150px;
          background: white;
        }
        :global(.filter-select:focus),
        :global(.filter-input:focus),
        :global(.filter-multi-select:focus) {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
        }
        :global(.date-range),
        :global(.number-range) {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        :global(.date-input),
        :global(.number-input) {
          width: 120px;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        .date-separator, .number-separator {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 0;
        }
        .radio-group {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .filter-radio {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .expand-btn {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          white-space: nowrap;
        }
        .apply-btn-desktop {
          padding: 0.5rem 1rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .filter-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .active-badge {
          padding: 0.25rem 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .clear-btn {
          padding: 0.25rem 0.5rem;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.7rem;
          cursor: pointer;
          border-radius: 0.25rem;
        }
        .clear-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        @media (max-width: 1024px) {
          .filter-row {
            gap: 0.75rem;
          }
          .filter-group {
            min-width: 120px;
          }
        }
        @media (max-width: 768px) {
          .filter-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}