// components/operations/ScheduleCalendar/ScheduleCalendar.js
'use client';

import { useState } from 'react';

export default function ScheduleCalendar({ 
  schedules = [],
  onEventClick,
  onDateClick,
  onAddSchedule,
  view = 'month' 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(view);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const views = ['day', 'week', 'month'];
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const getSchedulesForDate = (date) => {
    const dateStr = formatDate(date);
    return schedules.filter(s => s.date === dateStr || 
      (new Date(s.startDate) <= date && new Date(s.endDate) >= date));
  };
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };
  
  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };
  
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Fill in actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const daySchedules = getSchedulesForDate(date);
      const isToday = formatDate(date) === formatDate(today);
      const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${daySchedules.length > 0 ? 'has-events' : ''}`}
          onClick={() => {
            setSelectedDate(date);
            if (onDateClick) onDateClick(date);
          }}
        >
          <div className="day-number">{day}</div>
          {daySchedules.length > 0 && (
            <div className="event-indicators">
              {daySchedules.slice(0, 3).map((schedule, idx) => (
                <div 
                  key={idx} 
                  className={`event-dot ${schedule.type}`}
                  title={schedule.title}
                />
              ))}
              {daySchedules.length > 3 && (
                <div className="event-more">+{daySchedules.length - 3}</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const daySchedules = getSchedulesForDate(date);
      const isToday = formatDate(date) === formatDate(new Date());
      
      days.push(
        <div key={i} className="week-day">
          <div className={`week-day-header ${isToday ? 'today' : ''}`}>
            <div className="day-name">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="day-date">{date.getDate()}</div>
          </div>
          <div className="week-day-events">
            {daySchedules.map((schedule, idx) => (
              <div 
                key={idx} 
                className={`week-event ${schedule.type}`}
                onClick={() => onEventClick && onEventClick(schedule)}
              >
                <div className="event-time">{schedule.startTime} - {schedule.endTime}</div>
                <div className="event-title">{schedule.title}</div>
                <div className="event-assignee">{schedule.assignedTo}</div>
              </div>
            ))}
            <button 
              className="add-event-btn"
              onClick={() => onAddSchedule && onAddSchedule(date)}
            >
              + Add
            </button>
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const daySchedules = getSchedulesForDate(currentDate);
    
    return (
      <div className="day-view">
        <div className="day-header">
          <h3>{currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          <button className="add-event-btn" onClick={() => onAddSchedule && onAddSchedule(currentDate)}>
            + Add Schedule
          </button>
        </div>
        <div className="hour-grid">
          {hours.map(hour => {
            const hourStr = `${hour.toString().padStart(2, '0')}:00`;
            const eventsAtHour = daySchedules.filter(s => s.startTime === hourStr);
            
            return (
              <div key={hour} className="hour-row">
                <div className="hour-label">{hourStr}</div>
                <div className="hour-events">
                  {eventsAtHour.map((schedule, idx) => (
                    <div 
                      key={idx} 
                      className={`day-event ${schedule.type}`}
                      onClick={() => onEventClick && onEventClick(schedule)}
                    >
                      <div className="event-title">{schedule.title}</div>
                      <div className="event-details">
                        {schedule.assignedTo} • {schedule.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="schedule-calendar">
      <div className="calendar-header">
        <div className="nav-controls">
          <button className="nav-btn" onClick={() => {
            if (currentView === 'month') navigateMonth(-1);
            else if (currentView === 'week') navigateWeek(-1);
            else navigateDay(-1);
          }}>←</button>
          <button className="nav-btn today-btn" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <button className="nav-btn" onClick={() => {
            if (currentView === 'month') navigateMonth(1);
            else if (currentView === 'week') navigateWeek(1);
            else navigateDay(1);
          }}>→</button>
        </div>
        
        <h3 className="calendar-title">
          {currentView === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          {currentView === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
          {currentView === 'day' && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        
        <div className="view-controls">
          {views.map(v => (
            <button
              key={v}
              className={`view-btn ${currentView === v ? 'active' : ''}`}
              onClick={() => setCurrentView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {currentView === 'month' && (
        <>
          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {renderMonthView()}
          </div>
        </>
      )}
      
      {currentView === 'week' && (
        <div className="week-view">
          {renderWeekView()}
        </div>
      )}
      
      {currentView === 'day' && renderDayView()}
      
      <style jsx>{`
        .schedule-calendar {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .nav-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .nav-btn {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }
        
        .nav-btn:hover {
          background: #e5e7eb;
        }
        
        .today-btn {
          font-size: 0.875rem;
        }
        
        .calendar-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .view-controls {
          display: flex;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 0.5rem;
        }
        
        .view-btn {
          padding: 0.375rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .view-btn:hover {
          background: #e5e7eb;
        }
        
        .view-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .weekday {
          text-align: center;
          padding: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
        
        .calendar-day {
          min-height: 100px;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        
        .calendar-day:hover {
          background: #f9fafb;
          transform: scale(1.02);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .calendar-day.empty {
          background: #f9fafb;
          cursor: default;
        }
        
        .calendar-day.empty:hover {
          transform: none;
        }
        
        .calendar-day.today {
          border: 2px solid #3b82f6;
          background: #eff6ff;
        }
        
        .calendar-day.selected {
          background: #dbeafe;
          border-color: #2563eb;
        }
        
        .calendar-day.has-events {
          background: #fefce8;
        }
        
        .day-number {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .event-indicators {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }
        
        .event-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .event-dot.maintenance { background: #f59e0b; }
        .event-dot.installation { background: #10b981; }
        .event-dot.inspection { background: #3b82f6; }
        .event-dot.repair { background: #ef4444; }
        .event-dot.safety { background: #8b5cf6; }
        
        .event-more {
          font-size: 0.7rem;
          color: #6b7280;
        }
        
        .week-view {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
        
        .week-day {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .week-day-header {
          padding: 0.5rem;
          text-align: center;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .week-day-header.today {
          background: #eff6ff;
        }
        
        .day-name {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .day-date {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .week-day-events {
          min-height: 200px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .week-event {
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .week-event:hover {
          transform: translateX(2px);
        }
        
        .week-event.maintenance { background: #fed7aa; }
        .week-event.installation { background: #d1fae5; }
        .week-event.inspection { background: #dbeafe; }
        .week-event.repair { background: #fee2e2; }
        .week-event.safety { background: #e9d5ff; }
        
        .event-time {
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .event-title {
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0.25rem 0;
        }
        
        .event-assignee {
          font-size: 0.7rem;
          color: #6b7280;
        }
        
        .add-event-btn {
          padding: 0.25rem;
          background: none;
          border: 1px dashed #d1d5db;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.75rem;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .add-event-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .day-view {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .day-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #111827;
        }
        
        .hour-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 600px;
          overflow-y: auto;
        }
        
        .hour-row {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 0.5rem;
        }
        
        .hour-label {
          padding: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
        }
        
        .hour-events {
          padding: 0.25rem;
          min-height: 40px;
        }
        
        .day-event {
          padding: 0.5rem;
          background: #dbeafe;
          border-radius: 0.375rem;
          margin-bottom: 0.25rem;
          cursor: pointer;
        }
        
        .day-event:hover {
          background: #bfdbfe;
        }
        
        @media (max-width: 768px) {
          .calendar-grid {
            gap: 0.25rem;
          }
          
          .calendar-day {
            min-height: 60px;
          }
          
          .week-view {
            display: flex;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}