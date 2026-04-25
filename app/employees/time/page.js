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
    setEmployees(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(Array.isArray(data) ? data.filter(j => j.completion_status !== 'completed') : []);
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
            {/* Monthly Summary */}
            <div className="summary-card">
              <h3>{currentMonth} Hours Summary</h3>
              <div className="summary-grid">
                <div className="summary-item productive">
                  <span className="label">Productive:</span>
                  <span className="value">{employeeHours.productive || 0} hrs</span>
                </div>
                <div className="summary-item unproductive">
                  <span className="label">Unproductive:</span>
                  <span className="value">{employeeHours.unproductive || 0} hrs</span>
                </div>
                <div className="summary-item total">
                  <span className="label">Total:</span>
                  <span className="value">{employeeHours.total || 0} hrs</span>
                </div>
              </div>
            </div>

            {/* Time Entry Form */}
            <form onSubmit={handleSubmit} className="entry-form">
              <h3>Add Time Entry</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required />
                </div>
                
                <div className="form-group">
                  <label>Hours Worked *</label>
                  <input type="number" step="0.5" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} placeholder="e.g., 8.5" required />
                </div>
              </div>

              <div className="form-group">
                <label>Labor Type *</label>
                <div className="labor-type-buttons">
                  <button type="button" className={`labor-btn ${laborType === 'productive' ? 'active-productive' : ''}`} onClick={() => setLaborType('productive')}>
                    💼 Productive (Job)
                  </button>
                  <button type="button" className={`labor-btn ${laborType === 'training' ? 'active-training' : ''}`} onClick={() => setLaborType('training')}>
                    📚 Training
                  </button>
                  <button type="button" className={`labor-btn ${laborType === 'office' ? 'active-office' : ''}`} onClick={() => setLaborType('office')}>
                    🏢 Office
                  </button>
                  <button type="button" className={`labor-btn ${laborType === 'leave' ? 'active-leave' : ''}`} onClick={() => setLaborType('leave')}>
                    🌴 Leave
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
                        {job.lc_number} - {job.completion_status?.replace('_', ' ')}
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
                {submitting ? 'Saving...' : '✓ Save Time Entry'}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .page-header h1 { margin: 0; }
        
        .time-entry-container { max-width: 600px; margin: 0 auto; }
        .selector-card, .summary-card, .entry-form { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        .selector-card h3, .summary-card h3, .entry-form h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #6b7280; }
        
        .employee-select { width: 100%; padding: 0.75rem; font-size: 1rem; border: 1px solid #ddd; border-radius: 0.5rem; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .summary-item { display: flex; justify-content: space-between; padding: 0.5rem; border-radius: 0.5rem; }
        .summary-item.productive { background: #d1fae5; }
        .summary-item.unproductive { background: #fef3c7; }
        .summary-item.total { background: #dbeafe; }
        .summary-item .label { font-weight: 500; font-size: 0.75rem; }
        .summary-item .value { font-weight: bold; }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 500; font-size: 0.875rem; }
        input, select, textarea { width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
        
        .labor-type-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .labor-btn { flex: 1; padding: 0.5rem; border: 1px solid #ddd; background: white; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .labor-btn.active-productive { background: #10b981; color: white; border-color: #10b981; }
        .labor-btn.active-training { background: #f59e0b; color: white; border-color: #f59e0b; }
        .labor-btn.active-office { background: #3b82f6; color: white; border-color: #3b82f6; }
        .labor-btn.active-leave { background: #ef4444; color: white; border-color: #ef4444; }
        
        .btn-primary { background: #2563eb; color: white; padding: 0.625rem 1.25rem; border: none; border-radius: 0.5rem; cursor: pointer; width: 100%; font-weight: 500; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; }
        
        @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } .container { padding: 1rem; } .labor-type-buttons { flex-direction: column; } }
      `}</style>
    </div>
  );
}