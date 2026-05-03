'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DailyTimeEntryPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState('');
  const [laborType, setLaborType] = useState('productive');
  const [selectedJob, setSelectedJob] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeHours, setEmployeeHours] = useState({ productive: 0, unproductive: 0, total: 0 });

  useEffect(() => {
    fetchEmployees();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeMonthlyHours();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : (data.data || []));
    setLoading(false);
  };

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(Array.isArray(data) ? data.filter(j => j.completion_status !== 'completed') : (data.data || []).filter(j => j.completion_status !== 'completed'));
  };

  const fetchEmployeeMonthlyHours = async () => {
    const res = await fetch(`/api/employees/${selectedEmployee}/monthly-hours`);
    const data = await res.json();
    setEmployeeHours(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !workDate || !hoursWorked) {
      alert('Please select employee, date, and enter hours');
      return;
    }

    setSubmitting(true);
    
    const res = await fetch(`/api/employees/${selectedEmployee}/time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        work_date: workDate,
        hours_worked: parseFloat(hoursWorked),
        labor_type: laborType,
        job_id: laborType === 'productive' ? (selectedJob || null) : null,
        description
      })
    });

    if (res.ok) {
      alert('Time entry saved!');
      setHoursWorked('');
      setDescription('');
      fetchEmployeeMonthlyHours();
    } else {
      alert('Failed to save time entry');
    }
    setSubmitting(false);
  };

  const selectedEmployeeInfo = employees.find(e => e.id == selectedEmployee);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="time-entry-page">
      <div className="page-header">
        <h1>Daily Time Entry</h1>
        <Link href="/employees" className="btn-secondary">Back to Employees</Link>
      </div>

      <div className="time-entry-container">
        {/* Employee Selector */}
        <div className="card">
          <h3>Select Employee</h3>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="employee-select"
          >
            <option value="">-- Select Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_number} - {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>

        {selectedEmployeeInfo && (
          <>
            {/* Monthly Summary */}
            <div className="card">
              <h3>{currentMonth} Hours Summary</h3>
              <div className="summary-grid">
                <div className="summary-item productive">
                  <span className="label">Productive</span>
                  <span className="value">{employeeHours.productive || 0} hrs</span>
                </div>
                <div className="summary-item unproductive">
                  <span className="label">Unproductive</span>
                  <span className="value">{employeeHours.unproductive || 0} hrs</span>
                </div>
                <div className="summary-item total">
                  <span className="label">Total</span>
                  <span className="value">{employeeHours.total || 0} hrs</span>
                </div>
              </div>
            </div>

            {/* Time Entry Form */}
            <form onSubmit={handleSubmit} className="card">
              <h3>Add Time Entry</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required />
                </div>
                
                <div className="form-group">
                  <label>Hours Worked *</label>
                  <input type="number" step="0.5" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} placeholder="8.5" required />
                </div>
              </div>

              <div className="form-group">
                <label>Labor Type *</label>
                <div className="labor-type-buttons">
                  <button 
                    type="button" 
                    className={`labor-btn ${laborType === 'productive' ? 'active-productive' : ''}`} 
                    onClick={() => setLaborType('productive')}
                  >
                    Productive (Job)
                  </button>
                  <button 
                    type="button" 
                    className={`labor-btn ${laborType === 'training' ? 'active-training' : ''}`} 
                    onClick={() => setLaborType('training')}
                  >
                    Training
                  </button>
                  <button 
                    type="button" 
                    className={`labor-btn ${laborType === 'office' ? 'active-office' : ''}`} 
                    onClick={() => setLaborType('office')}
                  >
                    Office
                  </button>
                  <button 
                    type="button" 
                    className={`labor-btn ${laborType === 'leave' ? 'active-leave' : ''}`} 
                    onClick={() => setLaborType('leave')}
                  >
                    Leave
                  </button>
                </div>
              </div>

              {laborType === 'productive' && (
                <div className="form-group">
                  <label>Select Job</label>
                  <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                    <option value="">-- Select Job --</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.lc_number} - {job.completion_status?.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Description / Notes</label>
                <textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What work was done today?" />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : 'Save Time Entry'}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .time-entry-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .time-entry-container {
          max-width: 600px;
          margin: 0 auto;
        }
        .card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
        }
        .employee-select {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.875rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.5rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
        }
        .summary-item.productive {
          background: var(--success-bg);
        }
        .summary-item.productive .value {
          color: var(--success-dark);
          font-weight: 700;
        }
        .summary-item.unproductive {
          background: var(--warning-bg);
        }
        .summary-item.unproductive .value {
          color: var(--warning-dark);
          font-weight: 700;
        }
        .summary-item.total {
          background: var(--primary-bg);
        }
        .summary-item.total .value {
          color: var(--primary-dark);
          font-weight: 700;
        }
        .summary-item .label {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-secondary);
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
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .labor-type-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .labor-btn {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--border-medium);
          background: var(--bg-primary);
          color: var(--text-secondary);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .labor-btn.active-productive {
          background: var(--success);
          color: white;
          border-color: var(--success);
        }
        .labor-btn.active-training {
          background: var(--warning);
          color: white;
          border-color: var(--warning);
        }
        .labor-btn.active-office {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .labor-btn.active-leave {
          background: var(--danger);
          color: white;
          border-color: var(--danger);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          width: 100%;
          font-weight: 500;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--secondary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .btn-secondary:hover {
          background: var(--secondary-dark);
        }
        @media (max-width: 640px) {
          .time-entry-page {
            padding: 1rem;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .labor-type-buttons {
            flex-direction: column;
          }
          .summary-grid {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}