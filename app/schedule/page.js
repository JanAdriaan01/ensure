'use client';

import { useState, useEffect } from 'react';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch('/api/schedule');
        const result = await response.json();
        // Handle both response formats
        if (Array.isArray(result)) {
          setSchedule(result);
        } else if (result.data && Array.isArray(result.data)) {
          setSchedule(result.data);
        } else {
          setSchedule([]);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading schedule...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
              schedule.map((entry) => (
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
        .page-header p {
          color: #6b7280;
        }
        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
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
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }
        @media (max-width: 768px) {
          .schedule-container { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}