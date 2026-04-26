'use client';

import { useState } from 'react';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';

export default function FilterBar({ 
  filters = [], 
  onFilterChange,
  onClearAll,
  className = '' 
}) {
  const [activeFilters, setActiveFilters] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters };
    if (value === '' || value === null || value === false) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange({});
    if (onClearAll) onClearAll();
  };

  const activeCount = Object.keys(activeFilters).length;

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={activeFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'search':
        return (
          <input
            type="text"
            placeholder={filter.placeholder || 'Search...'}
            value={activeFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-input"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={activeFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-input"
          />
        );
      case 'checkbox':
        return (
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={activeFilters[filter.key] || false}
              onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
            />
            <span>{filter.label}</span>
          </label>
        );
      default:
        return null;
    }
  };

  const visibleFilters = isExpanded ? filters : filters.slice(0, 3);

  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-row">
        {visibleFilters.map(filter => (
          <div key={filter.key} className="filter-group">
            <label className="filter-label">{filter.label}</label>
            {renderFilterInput(filter)}
          </div>
        ))}
        {filters.length > 3 && (
          <button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? '▲ Less filters' : '▼ More filters'}
          </button>
        )}
        {activeCount > 0 && (
          <div className="filter-actions">
            <Badge variant="info">{activeCount} active</Badge>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
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
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .filter-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }
        .filter-select, .filter-input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          min-width: 150px;
        }
        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .expand-btn {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
        }
        .filter-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .filter-group {
            width: 100%;
          }
          .filter-select, .filter-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}