'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DailyTimeEntryPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState('');
  const [siteName, setSiteName] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [todayEntries, setTodayEntries] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeSummary();
      fetchTodayEntries();
    }
  }, [selectedEmployee, workDate]);

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
  };

  const fetchEmployeeSummary = async () => {
    const res = await fetch(`/api/employees/${selectedEmployee}/time`);
    const data = await res.json();
    setSelectedEmployeeData(data);
  };

  const fetchTodayEntries = async () => {
    // This would need a separate API endpoint
    // For now, we'll just refresh the employee detail
    if (selectedEmployee) {
      const res = await fetch(`/api/employees/${selectedEmployee}`);
      const data = await res.json();
      const todaysEntries = (data.time_entries || []).filter(
        entry => entry.work_date === workDate
      );
      setTodayEntries(todaysEntries);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !workDate || !hoursWorked) {
      alert('Please select employee, date, and enter hours');
      return;
    }

    setSubmitting(true);
    
    // Find site by name (simplified - you'd want a proper site selector)
    let siteId = null;
    if (siteName) {
      // Here you'd create or find site
    }

    const res = await fetch(`/api/employees/${selectedEmployee}/time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        work_date: workDate,
        hours_worked: parseFloat(hoursWorked),
        site_id: siteId,
        job_id: jobNumber || null,
        description
      })
    });

    if (res.ok) {
      alert('Time entry saved!');
      setHoursWorked('');
      setSiteName('');
      setJobNumber('');
      setDescription('');
      fetchEmployeeSummary();
      fetchTodayEntries();
    } else {
      alert('Failed to save time entry');
    }
    setSubmitting(false);
  };

  const selectedEmployeeInfo = employees.find(e => e.id == selectedEmployee);

  return (
    <div className="container">
      <div className="page-header">
        <h1>⏰ Daily Time Entry</h1>
        <Link href="/employees" className="btn-secondary">← Back to Employees</Link>
      </div>

      <div className="time-entry-container">
        {/* Employee Selector */}
        <div className="selector-card">
          <h3>Select Employee</h3>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="employee-select"
          >
            <option value="">-- Select Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_number} - {emp.name} {emp.surname}
              </option>
            ))}
          </select>
        </div>

        {selectedEmployeeInfo && (
          <>
            {/* Employee Summary */}
            <div className="summary-card">
              <h3>Employee Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Employee:</span>
                  <span className="value">{selectedEmployeeInfo.name} {selectedEmployeeInfo.surname}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Employee #:</span>
                  <span className="value">{selectedEmployeeInfo.employee_number}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Hours Worked:</span>
                  <span className="value">{selectedEmployeeData?.total_hours || 0} hrs</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Days Worked:</span>
                  <span className="value">{selectedEmployeeData?.days_worked || 0} days</span>
                </div>
                <div className="summary-item">
                  <span className="label">Years with Company:</span>
                  <span className="value">{Math.round(selectedEmployeeInfo.years_worked || 0)} yrs</span>
                </div>
              </div>
            </div>

            {/* Today's Entry Form */}
            <form onSubmit={handleSubmit} className="entry-form">
              <h3>Add Time Entry</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Hours Worked *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    placeholder="e.g., 8.5"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g., Cape Town Site A"
                  />
                </div>
                
                <div className="form-group">
                  <label>Job Number (LC)</label>
                  <select value={jobNumber} onChange={(e) => setJobNumber(e.target.value)}>
                    <option value="">-- Select Job --</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.lc_number} - {job.completion_status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description / Notes</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What work was done today?"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : '✓ Save Time Entry'}
              </button>
            </form>

            {/* Today's Existing Entries */}
            {todayEntries.length > 0 && (
              <div className="existing-entries">
                <h3>Today's Entries</h3>
                {todayEntries.map(entry => (
                  <div key={entry.id} className="entry-card">
                    <div className="entry-hours">{entry.hours_worked} hours</div>
                    <div className="entry-details">
                      {entry.site_name && <span>📍 {entry.site_name}</span>}
                      {entry.job_number && <span>📋 {entry.job_number}</span>}
                      {entry.description && <p>{entry.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .time-entry-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .selector-card, .summary-card, .entry-form, .existing-entries {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }
        .selector-card h3, .summary-card h3, .entry-form h3, .existing-entries h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #6b7280;
        }
        .employee-select {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 0.375rem;
        }
        .label {
          font-weight: 500;
          color: #6b7280;
        }
        .value {
          font-weight: 600;
          color: #111827;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
        }
        input, select, textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
        }
        .entry-card {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
          border-left: 3px solid #10b981;
        }
        .entry-hours {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        .entry-details {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .entry-details span {
          display: inline-block;
          margin-right: 1rem;
        }
        .entry-details p {
          margin: 0.25rem 0 0 0;
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          text-decoration: none;
        }
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}