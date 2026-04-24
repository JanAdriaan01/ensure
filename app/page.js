'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [summary, setSummary] = useState({ total_work_done: 0, total_jobs_completed: 0 });
  const [employeeStats, setEmployeeStats] = useState({ total: 0, totalHours: 0, activeToday: 0 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceHours, setAttendanceHours] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchJobs(), fetchCompletedInvoices(), fetchSummary(), fetchEmployeeStats()]);
    setLoading(false);
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const fetchCompletedInvoices = async () => {
    try {
      const res = await fetch('/api/completed-invoices');
      const data = await res.json();
      setCompletedJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setCompletedJobs([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/total-completed-work');
      const data = await res.json();
      setSummary(data || { total_work_done: 0, total_jobs_completed: 0 });
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary({ total_work_done: 0, total_jobs_completed: 0 });
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const res = await fetch('/api/employees');
      const employees = await res.json();
      const totalHours = employees.reduce((sum, e) => sum + (e.total_hours_worked || 0), 0);
      setEmployeeStats({
        total: employees.length,
        totalHours: totalHours,
        activeToday: employees.filter(e => (e.total_hours_worked || 0) > 0).length
      });
    } catch (error) {
      console.error('Error fetching employee stats:', error);
    }
  };

  const fetchJobDetail = async (id) => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setSelectedJob(data);
      setShowJobModal(true);
    } catch (error) {
      console.error('Error fetching job detail:', error);
      alert('Failed to load job details');
    }
  };

  const createJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = {
      lc_number: formData.get('lc_number'),
      po_status: formData.get('po_status'),
      completion_status: 'not_started',
      monthly_work_done: 0,
    };
    
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (res.ok) {
        setShowNewJobModal(false);
        fetchAllData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    }
  };

  const updateJob = async (id, po_status, completion_status) => {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ po_status, completion_status }),
      });
      fetchAllData();
      if (showJobModal) fetchJobDetail(id);
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job');
    }
  };

  const deleteJob = async (id) => {
    if (confirm('Delete this job and all attendance records?')) {
      try {
        await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
        fetchAllData();
        setShowJobModal(false);
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job');
      }
    }
  };

  const addAttendance = async (jobId) => {
    if (!attendanceDate || !attendanceHours) {
      alert('Date and hours are required');
      return;
    }

    try {
      await fetch(`/api/jobs/${jobId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          log_date: attendanceDate, 
          hours_worked: parseFloat(attendanceHours), 
          notes: attendanceNotes 
        }),
      });
      
      setAttendanceDate('');
      setAttendanceHours('');
      setAttendanceNotes('');
      
      fetchJobDetail(jobId);
      fetchJobs();
    } catch (error) {
      console.error('Error adding attendance:', error);
      alert('Failed to add attendance');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      not_started: 'status-not_started',
      in_progress: 'status-in_progress',
      completed: 'status-completed',
    };
    return colors[status] || 'status-pending';
  };

  const activeJobs = jobs.filter(job => job.completion_status !== 'completed');
  const completedJobsList = jobs.filter(job => job.completion_status === 'completed');

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading ENSURE Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>🔧 ENSURE System</h1>
          <p>Complete Workforce & Schedule Management</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-label">Employees</span>
            <span className="stat-number">{employeeStats.total}</span>
          </div>
          <div className="header-stat">
            <span className="stat-label">Active Jobs</span>
            <span className="stat-number">{activeJobs.length}</span>
          </div>
          <div className="header-stat">
            <span className="stat-label">Hours Tracked</span>
            <span className="stat-number">{Math.round(employeeStats.totalHours)}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          📋 Jobs & Projects
        </button>
        <button 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          👥 Employees
        </button>
      </div>

      {/* JOBS TAB */}
      {activeTab === 'jobs' && (
        <div className="tab-content">
          {/* Job Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{summary.total_work_done || 0}</div>
                <div className="stat-label">Total Hours Worked</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">{summary.total_jobs_completed || 0}</div>
                <div className="stat-label">Completed Jobs</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <div className="stat-value">{activeJobs.length}</div>
                <div className="stat-label">Active Jobs</div>
              </div>
            </div>
          </div>

          {/* New Job Button */}
          <button className="btn-primary" onClick={() => setShowNewJobModal(true)}>
            + New Job
          </button>

          {/* Active Jobs Table */}
          <div className="table-container">
            <h2>📋 Active Jobs</h2>
            {activeJobs.length === 0 ? (
              <div className="no-data">No active jobs. Click "New Job" to get started.</div>
            ) : (
              <table>
                <thead>
                  <tr><th>LC Number</th><th>PO Status</th><th>Completion</th><th>Monthly Hours</th><th>Total Hours</th><th>Logs</th></tr>
                </thead>
                <tbody>
                  {activeJobs.map((job) => (
                    <tr key={job.id} onClick={() => fetchJobDetail(job.id)} className="clickable-row">
                      <td><strong>{job.lc_number}</strong></td>
                      <td><span className={`status-badge ${getStatusColor(job.po_status)}`}>{job.po_status}</span></td>
                      <td><span className={`status-badge ${getStatusColor(job.completion_status)}`}>{job.completion_status?.replace('_', ' ')}</span></td>
                      <td>{job.monthly_work_done || 0} hrs</td>
                      <td>{Math.round(job.total_hours || 0)} hrs</td>
                      <td>{job.log_entries || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Completed Jobs Invoice Section */}
          <div className="table-container">
            <h2>📄 Completed Jobs & Invoices</h2>
            {completedJobsList.length === 0 ? (
              <div className="no-data">No completed jobs yet.</div>
            ) : (
              <table>
                <thead><tr><th>LC Number</th><th>Completion Date</th><th>Total Work</th><th>Invoice Month</th></tr></thead>
                <tbody>
                  {completedJobsList.map((job) => (
                    <tr key={job.id}>
                      <td><strong>{job.lc_number}</strong></td>
                      <td>{job.completed_month ? new Date(job.completed_month + '-01').toLocaleDateString() : '-'}</td>
                      <td>{job.monthly_work_done || 0} hrs</td>
                      <td>{job.completed_month || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="tab-content">
          {/* Employee Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{employeeStats.total}</div>
                <div className="stat-label">Total Employees</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <div className="stat-value">{Math.round(employeeStats.totalHours)}</div>
                <div className="stat-label">Total Hours Worked</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-value">{employeeStats.activeToday}</div>
                <div className="stat-label">Active Employees</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="action-buttons">
            <Link href="/employees/new" className="btn-primary">+ Add Employee</Link>
            <Link href="/employees/time" className="btn-secondary">⏰ Daily Time Entry</Link>
            <Link href="/employees" className="btn-secondary">👥 View All Employees</Link>
          </div>

          {/* Recent Employees Preview */}
          <div className="table-container">
            <h2>👥 Employee Directory</h2>
            <p className="section-hint">Click "View All Employees" to manage certifications, skills, and time history</p>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Job</h2>
            <form onSubmit={createJob}>
              <div className="form-group">
                <label>LC Number *</label>
                <input type="text" name="lc_number" required placeholder="e.g., LC-2024-001" />
              </div>
              <div className="form-group">
                <label>PO Status</label>
                <select name="po_status">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit">Create Job</button>
                <button type="button" onClick={() => setShowNewJobModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showJobModal && selectedJob && (
        <div className="modal">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Job: {selectedJob.job?.lc_number}</h2>
              <button onClick={() => setShowJobModal(false)} className="modal-close">×</button>
            </div>

            <div className="status-section">
              <h3>Update Status</h3>
              <div className="status-controls">
                <select value={selectedJob.job?.po_status} onChange={(e) => updateJob(selectedJob.job.id, e.target.value, selectedJob.job.completion_status)}>
                  <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                </select>
                <select value={selectedJob.job?.completion_status} onChange={(e) => updateJob(selectedJob.job.id, selectedJob.job.po_status, e.target.value)}>
                  <option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
                </select>
                <button onClick={() => deleteJob(selectedJob.job.id)} className="btn-danger">Delete</button>
              </div>
            </div>

            <div className="attendance-section">
              <h3>Attendance Logs</h3>
              <div className="logs-container">
                {selectedJob.logs && selectedJob.logs.length > 0 ? (
                  selectedJob.logs.map((log) => (
                    <div key={log.id} className="log-entry">
                      <div className="log-date">{log.log_date}</div>
                      <div className="log-hours">{log.hours_worked} hours</div>
                      {log.notes && <div className="log-notes">{log.notes}</div>}
                    </div>
                  ))
                ) : (
                  <div className="no-data">No attendance logs yet.</div>
                )}
              </div>
            </div>

            <div className="add-attendance">
              <h3>Add Attendance</h3>
              <div className="form-group"><label>Date</label><input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} /></div>
              <div className="form-group"><label>Hours</label><input type="number" step="0.5" placeholder="Hours" value={attendanceHours} onChange={(e) => setAttendanceHours(e.target.value)} /></div>
              <div className="form-group"><label>Notes</label><textarea rows="2" placeholder="Notes" value={attendanceNotes} onChange={(e) => setAttendanceNotes(e.target.value)} /></div>
              <button onClick={() => addAttendance(selectedJob.job.id)} className="btn-success">+ Add Log</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Loading */
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Header */
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .dashboard-header h1 { font-size: 2rem; margin: 0 0 0.25rem 0; color: #111827; }
        .dashboard-header p { color: #6b7280; margin: 0; }
        .header-stats { display: flex; gap: 1.5rem; }
        .header-stat { text-align: center; }
        .header-stat .stat-label { font-size: 0.75rem; color: #6b7280; display: block; }
        .header-stat .stat-number { font-size: 1.25rem; font-weight: bold; color: #111827; }

        /* Tab Navigation */
        .tab-navigation { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid #e5e7eb; }
        .tab-btn { background: none; border: none; padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; color: #6b7280; transition: all 0.2s; }
        .tab-btn:hover { color: #2563eb; }
        .tab-btn.active { color: #2563eb; border-bottom: 2px solid #2563eb; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .stat-card { background: white; border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon { font-size: 2rem; }
        .stat-info { flex: 1; }
        .stat-value { font-size: 1.75rem; font-weight: bold; color: #111827; line-height: 1; }
        .stat-label { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }

        /* Buttons */
        .btn-primary, .btn-secondary { background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; margin-bottom: 1.5rem; margin-right: 1rem; transition: background 0.2s; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #6b7280; }
        .btn-secondary:hover { background: #4b5563; }
        .btn-danger { background: #dc2626; }
        .btn-danger:hover { background: #b91c1c; }
        .btn-success { background: #10b981; width: 100%; }
        .btn-success:hover { background: #059669; }

        /* Tables */
        .table-container { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        .table-container h2 { font-size: 1.1rem; font-weight: 600; padding: 1rem 1.5rem; margin: 0; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
        .section-hint { padding: 0.75rem 1.5rem; color: #6b7280; font-size: 0.875rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 0.75rem 1rem; background: #f9fafb; font-size: 0.7rem; font-weight: 600; color: #6b7280; text-transform: uppercase; }
        td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background: #f9fafb; }
        .no-data { text-align: center; padding: 2rem; color: #6b7280; }

        /* Status Badges */
        .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }

        /* Modals */
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border-radius: 0.75rem; padding: 1.5rem; max-width: 550px; width: 90%; max-height: 85vh; overflow-y: auto; }
        .modal-large { max-width: 650px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .modal-close { background: #6b7280; padding: 0.25rem 0.75rem; font-size: 1.25rem; border: none; border-radius: 0.375rem; cursor: pointer; color: white; }
        .modal-buttons { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
        .modal-buttons button { flex: 1; }

        /* Forms */
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 500; font-size: 0.875rem; }
        input, select, textarea { width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }

        /* Status Section in Modal */
        .status-section { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .status-section h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; }
        .status-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .status-controls select { flex: 1; width: auto; }

        /* Attendance Section */
        .attendance-section { margin-bottom: 1rem; }
        .attendance-section h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; }
        .logs-container { max-height: 250px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem; }
        .log-entry { background: #f9fafb; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 0.375rem; border-left: 3px solid #2563eb; }
        .log-date { font-weight: 600; font-size: 0.8rem; }
        .log-hours { font-size: 0.8rem; color: #6b7280; }
        .log-notes { font-size: 0.7rem; color: #6b7280; margin-top: 0.25rem; }

        /* Add Attendance */
        .add-attachment { border-top: 1px solid #e5e7eb; padding-top: 1rem; }
        .add-attachment h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; }

        /* Action Buttons */
        .action-buttons { margin-bottom: 1.5rem; }

        @media (max-width: 768px) {
          .dashboard-container { padding: 1rem; }
          .dashboard-header { flex-direction: column; align-items: flex-start; }
          .stats-grid { grid-template-columns: 1fr; }
          .status-controls { flex-direction: column; }
          .status-controls select { width: 100%; }
        }
      `}</style>
    </div>
  );
}