'use client';

import { useState, useRef, useEffect } from 'react';

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onRangeChange,
  presets = true,
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startDate || '');
  const [localEnd, setLocalEnd] = useState(endDate || '');
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (localStart && localEnd) {
      onRangeChange({ startDate: localStart, endDate: localEnd });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalStart('');
    setLocalEnd('');
    onRangeChange({ startDate: '', endDate: '' });
    setIsOpen(false);
  };

  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setLocalStart(startStr);
    setLocalEnd(endStr);
    onRangeChange({ startDate: startStr, endDate: endStr });
    setIsOpen(false);
  };

  const handleMonthPreset = (type) => {
    const now = new Date();
    let start, end;
    if (type === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (type === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (type === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    }
    setLocalStart(start.toISOString().split('T')[0]);
    setLocalEnd(end.toISOString().split('T')[0]);
    onRangeChange({ startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
    setIsOpen(false);
  };

  const displayText = () => {
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
    return 'Select date range';
  };

  const presetOptions = [
    { label: 'Today', action: () => handlePreset(0) },
    { label: 'Last 7 Days', action: () => handlePreset(7) },
    { label: 'Last 30 Days', action: () => handlePreset(30) },
    { label: 'This Month', action: () => handleMonthPreset('month') },
    { label: 'Last Month', action: () => handleMonthPreset('lastMonth') },
    { label: 'This Quarter', action: () => handleMonthPreset('quarter') }
  ];

  return (
    <div className={`date-range-picker ${className}`} ref={pickerRef}>
      <button className="picker-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="calendar-icon">📅</span>
        <span className="date-text">{displayText()}</span>
        <span className="chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="picker-dropdown">
          {presets && (
            <div className="presets">
              {presetOptions.map(option => (
                <button key={option.label} className="preset-btn" onClick={option.action}>
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <div className="date-inputs">
            <div className="date-input-group">
              <label>From</label>
              <input
                type="date"
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label>To</label>
              <input
                type="date"
                value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="picker-actions">
            <button className="clear-btn" onClick={handleClear}>Clear</button>
            <button className="apply-btn" onClick={handleApply}>Apply</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .date-range-picker {
          position: relative;
          display: inline-block;
        }
        .picker-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .picker-trigger:hover {
          border-color: #2563eb;
        }
        .calendar-icon {
          font-size: 1rem;
        }
        .date-text {
          color: #374151;
        }
        .chevron {
          color: #9ca3af;
          font-size: 0.7rem;
        }
        .picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 100;
          min-width: 280px;
        }
        .presets {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .preset-btn {
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          cursor: pointer;
        }
        .date-inputs {
          padding: 0.75rem;
          display: flex;
          gap: 1rem;
        }
        .date-input-group {
          flex: 1;
        }
        .date-input-group label {
          display: block;
          font-size: 0.7rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        .date-input-group input {
          width: 100%;
          padding: 0.375rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.75rem;
        }
        .picker-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        .clear-btn {
          padding: 0.25rem 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .apply-btn {
          padding: 0.25rem 0.75rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}