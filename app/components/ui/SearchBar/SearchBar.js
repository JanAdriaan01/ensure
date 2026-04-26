'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';

export default function SearchBar({ 
  onSearch, 
  placeholder = 'Search...', 
  className = '',
  initialValue = '',
  autoFocus = false,
  showFilters = false,
  filters = []
}) {
  const [value, setValue] = useState(initialValue);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const debouncedValue = useDebounce(value, 500);
  const debouncedFilters = useDebounce(activeFilters, 500);

  useEffect(() => {
    onSearch({ query: debouncedValue, ...debouncedFilters });
  }, [debouncedValue, debouncedFilters]);

  const handleFilterChange = (key, filterValue) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: filterValue || undefined
    }));
  };

  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="search-input"
          autoFocus={autoFocus}
        />
        {value && (
          <button className="clear-btn" onClick={() => setValue('')}>✕</button>
        )}
        {showFilters && (
          <button 
            className="filter-toggle" 
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▲' : '⚙️'}
          </button>
        )}
      </div>
      
      {showAdvanced && filters.length > 0 && (
        <div className="advanced-filters">
          {filters.map(filter => (
            <div key={filter.key} className="filter-group">
              <label>{filter.label}</label>
              {filter.type === 'select' ? (
                <select 
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">All</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : filter.type === 'date' ? (
                <input 
                  type="date" 
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              ) : (
                <input 
                  type="text" 
                  placeholder={filter.placeholder}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <button 
            className="clear-filters"
            onClick={() => setActiveFilters({})}
          >
            Clear Filters
          </button>
        </div>
      )}

      <style jsx>{`
        .search-bar-container {
          width: 100%;
        }
        .search-bar {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          transition: all 0.2s;
        }
        .search-bar:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .search-icon {
          color: #9ca3af;
          margin-right: 0.5rem;
        }
        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
        }
        .clear-btn, .filter-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 0 0.25rem;
          font-size: 1rem;
        }
        .clear-btn:hover, .filter-toggle:hover {
          color: #374151;
        }
        .advanced-filters {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .filter-group label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
        }
        .filter-group select, .filter-group input {
          padding: 0.375rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          min-width: 120px;
        }
        .clear-filters {
          padding: 0.375rem 0.75rem;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .advanced-filters {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-group select, .filter-group input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}