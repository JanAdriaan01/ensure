// app/components/common/DateRangePicker/DateRangePicker.js
'use client';

import { useState, useRef, useEffect } from 'react';

export default function DateRangePicker({ 
  startDate = null,
  endDate = null,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  label = 'Date Range',
  placeholderStart = 'Start date',
  placeholderEnd = 'End date',
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  className = '',
  minDate = null,
  maxDate = null,
  presets = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('start');
  const [displayStart, setDisplayStart] = useState(startDate ? new Date(startDate) : new Date());
  const [displayEnd, setDisplayEnd] = useState(endDate ? new Date(endDate) : new Date());
  const [hoverDate, setHoverDate] = useState(null);
  const pickerRef = useRef(null);
  
  const presetsList = [
    { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: 'Yesterday', getValue: () => ({ start: new Date(Date.now() - 86400000), end: new Date(Date.now() - 86400000) }) },
    { label: 'This Week', getValue: () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      return { start, end: new Date() };
    }},
    { label: 'Last Week', getValue: () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay() - 7);
      const end = new Date();
      end.setDate(end.getDate() - end.getDay() - 1);
      return { start, end };
    }},
    { label: 'This Month', getValue: () => {
      const start = new Date();
      start.setDate(1);
      return { start, end: new Date() };
    }},
    { label: 'Last Month', getValue: () => {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      const end = new Date();
      end.setDate(0);
      return { start, end };
    }},
    { label: 'Last 30 Days', getValue: () => ({
      start: new Date(Date.now() - 30 * 86400000),
      end: new Date()
    })},
    { label: 'Last 90 Days', getValue: () => ({
      start: new Date(Date.now() - 90 * 86400000),
      end: new Date()
    })}
  ];
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };
  
  const handleDateSelect = (date) => {
    if (currentView === 'start') {
      if (onStartDateChange) onStartDateChange(date);
      if (endDate && date > new Date(endDate)) {
        if (onEndDateChange) onEndDateChange(null);
      }
      setCurrentView('end');
    } else {
      if (onEndDateChange) onEndDateChange(date);
      if (onRangeChange && startDate) {
        onRangeChange({ start: new Date(startDate), end: date });
      }
      setIsOpen(false);
    }
  };
  
  const handlePreset = (preset) => {
    const { start, end } = preset.getValue();
    if (onStartDateChange) onStartDateChange(start);
    if (onEndDateChange) onEndDateChange(end);
    if (onRangeChange) onRangeChange({ start, end });
    setIsOpen(false);
  };
  
  const clearRange = () => {
    if (onStartDateChange) onStartDateChange(null);
    if (onEndDateChange) onEndDateChange(null);
    if (onRangeChange) onRangeChange(null);
  };
  
  return (
    <div className={`date-range-picker ${className}`} ref={pickerRef}>
      {label && (
        <label className="picker-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <div 
        className={`picker-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="date-display">
          {startDate ? formatDate(startDate) : placeholderStart}
        </span>
        <span className="date-separator">—</span>
        <span className="date-display">
          {endDate ? formatDate(endDate) : placeholderEnd}
        </span>
        <span className="calendar-icon">📅</span>
      </div>
      
      {isOpen && !disabled && (
        <div className="picker-dropdown">
          {presets && (
            <div className="presets-section">
              <div className="presets-title">Quick Select</div>
              <div className="presets-list">
                {presetsList.map((preset, idx) => (
                  <button
                    key={idx}
                    className="preset-btn"
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {(startDate || endDate) && (
                <button className="clear-btn" onClick={clearRange}>
                  Clear Range
                </button>
              )}
            </div>
          )}
          
          <div className="calendar-section">
            <CalendarView
              currentDate={currentView === 'start' ? displayStart : displayEnd}
              selectedDate={currentView === 'start' ? startDate : endDate}
              rangeStart={startDate}
              rangeEnd={endDate}
              hoverDate={hoverDate}
              onDateSelect={handleDateSelect}
              onHoverDate={setHoverDate}
              minDate={minDate}
              maxDate={maxDate}
              viewType={currentView}
            />
          </div>
        </div>
      )}
      
      {helperText && !error && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {error && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .date-range-picker {
          width: 100%;
          margin-bottom: 1rem;
          position: relative;
        }
        
        .picker-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .required-star {
          color: #ef4444;
          margin-left: 0.25rem;
        }
        
        .picker-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .picker-input:hover:not(.disabled) {
          border-color: #9ca3af;
        }
        
        .picker-input.error {
          border-color: #ef4444;
        }
        
        .picker-input.disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .date-display {
          flex: 1;
          font-size: 0.875rem;
          color: #111827;
        }
        
        .date-separator {
          color: #9ca3af;
        }
        
        .calendar-icon {
          font-size: 1rem;
        }
        
        .picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 50;
          display: flex;
          min-width: 500px;
        }
        
        .presets-section {
          width: 140px;
          padding: 1rem;
          border-right: 1px solid #e5e7eb;
        }
        
        .presets-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        
        .presets-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }
        
        .preset-btn {
          padding: 0.375rem 0.5rem;
          text-align: left;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        
        .preset-btn:hover {
          background: #f3f4f6;
        }
        
        .clear-btn {
          width: 100%;
          padding: 0.375rem 0.5rem;
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #ef4444;
        }
        
        .clear-btn:hover {
          background: #fee2e2;
        }
        
        .calendar-section {
          flex: 1;
          padding: 1rem;
        }
        
        .helper-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .error-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #ef4444;
        }
        
        @media (max-width: 640px) {
          .picker-dropdown {
            flex-direction: column;
            min-width: 280px;
          }
          
          .presets-section {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}

// Calendar View Component
function CalendarView({ 
  currentDate, 
  selectedDate, 
  rangeStart, 
  rangeEnd, 
  hoverDate,
  onDateSelect, 
  onHoverDate,
  minDate,
  maxDate,
  viewType 
}) {
  const [viewMonth, setViewMonth] = useState(currentDate || new Date());
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const isDateInRange = (date) => {
    if (!rangeStart || !rangeEnd) return false;
    return date >= rangeStart && date <= rangeEnd;
  };
  
  const isDateInHoverRange = (date) => {
    if (viewType === 'start' && hoverDate && rangeStart) {
      return date >= rangeStart && date <= hoverDate;
    }
    if (viewType === 'end' && hoverDate && rangeEnd) {
      return date <= rangeEnd && date >= hoverDate;
    }
    return false;
  };
  
  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };
  
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    onDateSelect(date);
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewMonth);
    const firstDay = getFirstDayOfMonth(viewMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
      const isInRange = isDateInRange(date);
      const isInHoverRange = isDateInHoverRange(date);
      const isToday = formatDate(date) === formatDate(today);
      const isDisabled = isDateDisabled(date);
      const isStart = rangeStart && formatDate(date) === formatDate(rangeStart);
      const isEnd = rangeEnd && formatDate(date) === formatDate(rangeEnd);
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''} ${isInHoverRange ? 'in-hover-range' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''} ${isStart ? 'range-start' : ''} ${isEnd ? 'range-end' : ''}`}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => !isDisabled && onHoverDate && onHoverDate(date)}
          onMouseLeave={() => onHoverDate && onHoverDate(null)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  return (
    <div className="calendar">
      <div className="calendar-nav">
        <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}>
          ←
        </button>
        <span>{monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
        <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}>
          →
        </button>
      </div>
      
      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-days">
        {renderCalendar()}
      </div>
      
      <style jsx>{`
        .calendar {
          width: 100%;
        }
        
        .calendar-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .calendar-nav button {
          padding: 0.25rem 0.5rem;
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        
        .calendar-nav button:hover {
          background: #f3f4f6;
        }
        
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        
        .weekday {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          padding: 0.25rem;
        }
        
        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .calendar-day:hover:not(.empty):not(.disabled) {
          background: #e5e7eb;
        }
        
        .calendar-day.selected {
          background: #3b82f6;
          color: white;
        }
        
        .calendar-day.today {
          border: 1px solid #3b82f6;
        }
        
        .calendar-day.in-range {
          background: #dbeafe;
        }
        
        .calendar-day.in-hover-range {
          background: #e0e7ff;
        }
        
        .calendar-day.range-start {
          background: #3b82f6;
          color: white;
          border-radius: 0.375rem 0 0 0.375rem;
        }
        
        .calendar-day.range-end {
          background: #3b82f6;
          color: white;
          border-radius: 0 0.375rem 0.375rem 0;
        }
        
        .calendar-day.disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        
        .calendar-day.empty {
          cursor: default;
        }
        
        .calendar-day.empty:hover {
          background: none;
        }
      `}</style>
    </div>
  );
}