'use client';

import { useState, useEffect } from 'react';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedule')
      .then(res => res.json())
      .then(data => {
        setSchedule(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="schedule-container">
      <div className="page-header">
        <h1>Work Schedule</h1>
        <p>Manage employee work schedules and assignments</p>
      </div>
      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Job Number</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {schedule.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No schedule entries found</td>
              </tr>
            ) : (
              schedule.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.employee_name}</td>
                  <td>{entry.job_number}</td>
                  <td>{entry.date}</td>
                  <td>{entry.start_time}</td>
                  <td>{entry.end_time}</td>
                  <td>{entry.role || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .schedule-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .dark .table-container {
          background: #1f2937;
          border-color: #374151;
        }
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark td {
          color: #f9fafb;
        }
        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}