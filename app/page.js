'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [summary, setSummary] = useState({ total_work_done: 0, total_jobs_completed: 0 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceHours, setAttendanceHours] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchJobs(), fetchCompletedInvoices(), fetchSummary()]);
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

  const fetchJobDetail = async (id) => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setSelectedJob(data);
      setShowModal(true);
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
      if (showModal) fetchJobDetail(id);
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
        setShowModal(false);
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
        <div>Loading ENSURE System...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>🔧 ENSURE System</h1>
        <p>Schedule Management & Attendance Tracking</p>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard">
        <div className="card">
          <h3>Total Completed Work</h3>
          <div className="value">{summary.total_work_done || 0} hrs</div>
        </div>
        <div className="card">
          <h3>Completed Jobs</h3>
          <div className="value">{summary.total_jobs_completed || 0}</div>
        </div>
        <div className="card">
          <h3>Active Jobs</h3>
          <div className="value">{activeJobs.length}</div>
        </div>
      </div>

      {/* New Job Button */}
      <button className="btn-primary" onClick={() => setShowNewJobModal(true)}>
        + New Job
      </button>

      {/* Active Jobs Table */}
      <div className="table-container">
        <h2>📋 Active Jobs (Click any row for details)</h2>
        {activeJobs.length === 0 ? (
          <div className="no-data">No active jobs. Click "New Job" to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>LC Number</th>
                <th>PO Status</th>
                <th>Completion Status</th>
                <th>Monthly Work Done</th>
                <th>Total Hours</th>
                <th>Logs</th>
              </tr>
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
        <h2>📄 Month Completed Invoice</h2>
        {completedJobsList.length === 0 ? (
          <div className="no-data">No completed jobs yet. Complete a job to see it here.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>LC Number</th>
                <th>Completion Date</th>
                <th>Total Work Done</th>
                <th>Invoice Month</th>
              </tr>
            </thead>
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
      {showModal && selectedJob && (
        <div className="modal">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Job: {selectedJob.job?.lc_number}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>

            {/* Update Status Section */}
            <div className="status-section">
              <h3>Update Status</h3>
              <div className="status-controls">
                <select
                  value={selectedJob.job?.po_status}
                  onChange={(e) => updateJob(selectedJob.job.id, e.target.value, selectedJob.job.completion_status)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={selectedJob.job?.completion_status}
                  onChange={(e) => updateJob(selectedJob.job.id, selectedJob.job.po_status, e.target.value)}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => deleteJob(selectedJob.job.id)} className="btn-danger">Delete Job</button>
              </div>
            </div>

            {/* Attendance Logs Section */}
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
                  <div className="no-data">No attendance logs yet. Add one below.</div>
                )}
              </div>
            </div>

            {/* Add Attendance Section */}
            <div className="add-attendance">
              <h3>Add Attendance</h3>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={(e) => setAttendanceDate(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Hours Worked</label>
                <input 
                  type="number" 
                  step="0.5" 
                  placeholder="Hours" 
                  value={attendanceHours} 
                  onChange={(e) => setAttendanceHours(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea 
                  rows="2" 
                  placeholder="Work completed, notes, etc." 
                  value={attendanceNotes} 
                  onChange={(e) => setAttendanceNotes(e.target.value)} 
                />
              </div>
              <button onClick={() => addAttendance(selectedJob.job.id)} className="btn-success">
                + Add Log
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Layout & Container */
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Loading Spinner */
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.2rem;
          color: #6b7280;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Header */
        .header {
          margin-bottom: 2rem;
        }
        .header h1 {
          font-size: 2.5rem;
          font-weight: bold;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }
        .header p {
          color: #6b7280;
          margin: 0;
        }

        /* Dashboard Cards */
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .card {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card h3 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
        }
        .card .value {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
        }

        /* Buttons */
        .btn-primary {
          background: #2563eb;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          font-size: 1rem;
          margin-bottom: 1.5rem;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #1d4ed8;
        }
        .btn-danger {
          background: #dc2626;
        }
        .btn-danger:hover {
          background: #b91c1c;
        }
        .btn-success {
          background: #10b981;
          width: 100%;
        }
        .btn-success:hover {
          background: #059669;
        }
        .modal-close {
          background: #6b7280;
          padding: 0.25rem 0.75rem;
          font-size: 1.25rem;
        }

        /* Tables */
        .table-container {
          background: white;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }
        .table-container h2 {
          font-size: 1.25rem;
          font-weight: 600;
          padding: 1.25rem 1.5rem;
          margin: 0;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 0.75rem 1.5rem;
          background: #f9fafb;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .clickable-row {
          cursor: pointer;
          transition: background 0.2s;
        }
        .clickable-row:hover {
          background: #f9fafb;
        }

        /* Status Badges */
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }

        /* Modals */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          max-width: 500px;
          width: 90%;
        }
        .modal-large {
          max-width: 650px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h2 {
          margin: 0;
        }
        .modal-buttons {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .modal-buttons button {
          flex: 1;
        }

        /* Forms */
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
        input, select, textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2563eb;
          ring: 2px solid #2563eb;
        }

        /* Status Section in Modal */
        .status-section {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .status-section h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
        }
        .status-controls {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .status-controls select {
          flex: 1;
          width: auto;
        }

        /* Attendance Section */
        .attendance-section {
          margin-bottom: 1.5rem;
        }
        .attendance-section h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
        }
        .logs-container {
          max-height: 280px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem;
        }
        .log-entry {
          background: #f9fafb;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border-radius: 0.375rem;
          border-left: 3px solid #2563eb;
        }
        .log-date {
          font-weight: 600;
          font-size: 0.875rem;
        }
        .log-hours {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .log-notes {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
        }

        /* Add Attendance */
        .add-attendance {
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
        }
        .add-attendance h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
        }

        /* No Data */
        .no-data {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          th, td {
            padding: 0.75rem;
            font-size: 0.75rem;
          }
          .dashboard {
            grid-template-columns: 1fr;
          }
          .status-controls {
            flex-direction: column;
          }
          .status-controls select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}