// components/hr/AttendanceCalendar/AttendanceCalendar.js
'use client';

import { useState } from 'react';

export default function AttendanceCalendar({ 
  attendanceData = {},
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  onDateClick,
  employeeId 
}) {
  const [currentYear, setCurrentYear] = useState(year);
  const [currentMonth, setCurrentMonth] = useState(month);
  
  const getDaysInMonth = (y, m) => {
    return new Date(y, m + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (y, m) => {
    return new Date(y, m, 1).getDay();
  };
  
  const getAttendanceStatus = (date) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const record = attendanceData[dateKey];
    
    if (!record) return 'absent';
    return record.status;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#10b981';
      case 'late': return '#f59e0b';
      case 'half-day': return '#8b5cf6';
      case 'absent': return '#ef4444';
      case 'holiday': return '#3b82f6';
      case 'leave': return '#ec4899';
      default: return '#d1d5db';
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'half-day': return 'Half Day';
      case 'absent': return 'Absent';
      case 'holiday': return 'Holiday';
      case 'leave': return 'Leave';
      default: return '';
    }
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Fill in actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getAttendanceStatus(day);
      const color = getStatusColor(status);
      const label = getStatusLabel(status);
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${status} ${isToday ? 'today' : ''}`}
          onClick={() => onDateClick && onDateClick(date)}
        >
          <div className="day-number">{day}</div>
          {status !== 'absent' && (
            <div className="status-indicator" style={{ background: color }}></div>
          )}
          <div className="status-label">{label}</div>
        </div>
      );
    }
    
    return days;
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getSummary = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    let present = 0, late = 0, halfDay = 0, absent = 0, leave = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getAttendanceStatus(day);
      switch (status) {
        case 'present': present++; break;
        case 'late': late++; break;
        case 'half-day': halfDay++; break;
        case 'absent': absent++; break;
        case 'leave': leave++; break;
      }
    }
    
    return { present, late, halfDay, absent, leave };
  };
  
  const summary = getSummary();
  const attendanceRate = ((summary.present + summary.late + summary.halfDay) / 
    (summary.present + summary.late + summary.halfDay + summary.absent) * 100).toFixed(1);
  
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  return (
    <div className="attendance-calendar">
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth}>←</button>
        <h3 className="calendar-title">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button className="nav-btn" onClick={nextMonth}>→</button>
      </div>
      
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Attendance Rate:</span>
          <span className="stat-value">{attendanceRate}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Present:</span>
          <span className="stat-value present">{summary.present}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Late:</span>
          <span className="stat-value late">{summary.late}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Half Day:</span>
          <span className="stat-value half">{summary.halfDay}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Leave:</span>
          <span className="stat-value leave">{summary.leave}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Absent:</span>
          <span className="stat-value absent">{summary.absent}</span>
        </div>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10b981' }}></div>
          <span>Present</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#f59e0b' }}></div>
          <span>Late</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#8b5cf6' }}></div>
          <span>Half Day</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ef4444' }}></div>
          <span>Absent</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#3b82f6' }}></div>
          <span>Holiday</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ec4899' }}></div>
          <span>Leave</span>
        </div>
      </div>
      
      <style jsx>{`
        .attendance-calendar {
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
        
        .calendar-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .summary-stats {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .stat {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .stat-label {
          color: #6b7280;
        }
        
        .stat-value {
          font-weight: 600;
        }
        
        .stat-value.present { color: #10b981; }
        .stat-value.late { color: #f59e0b; }
        .stat-value.half { color: #8b5cf6; }
        .stat-value.leave { color: #ec4899; }
        .stat-value.absent { color: #ef4444; }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .calendar-weekday {
          text-align: center;
          padding: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          text-align: center;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        
        .calendar-day:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 1;
        }
        
        .calendar-day.empty {
          background: #f9fafb;
          cursor: default;
        }
        
        .calendar-day.empty:hover {
          transform: none;
          box-shadow: none;
        }
        
        .calendar-day.today {
          border: 2px solid #3b82f6;
          background: #eff6ff;
        }
        
        .day-number {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 auto 0.25rem;
        }
        
        .status-label {
          font-size: 0.7rem;
          color: #6b7280;
        }
        
        .calendar-day.present { background: #f0fdf4; }
        .calendar-day.late { background: #fffbeb; }
        .calendar-day.half-day { background: #f5f3ff; }
        .calendar-day.absent { background: #fef2f2; }
        .calendar-day.holiday { background: #eff6ff; }
        .calendar-day.leave { background: #fdf2f8; }
        
        .legend {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        
        @media (max-width: 768px) {
          .calendar-grid {
            gap: 0.25rem;
          }
          
          .calendar-day {
            padding: 0.25rem;
          }
          
          .status-label {
            display: none;
          }
          
          .summary-stats {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}