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
      console.log('Jobs fetched:', data);
      // Split into active jobs (not completed) and show all
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

  const updateJob = async (id, updates) => {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchAllData();
      if (showModal) fetchJobDetail(id);
    } catch (error) {
      console.error('Error updating job:', error);
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
      
      // Clear inputs
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
    <div>
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

        {/* Active Jobs Table - CLICKABLE ROWS */}
        <div className="table-container">
          <h2>📋 Active Jobs (Click any row for details)</h2>
          <table>
            <thead>
              <tr>
                <th>LC Number</th>
                <th>PO Status</th>
                <th>Completion Status</th>
                <th>Monthly Work Done</th>
                <th>Total Hours</th>
                <th>Attendance Logs</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No active jobs. Click "New Job" to get started.</td>
                </tr>
              ) : (
                activeJobs.map((job) => (
                  <tr key={job.id} onClick={() => fetchJobDetail(job.id)} className="clickable-row">
                    <td><strong>{job.lc_number}</strong></td>
                    <td><span className={`status-badge ${getStatusColor(job.po_status)}`}>{job.po_status}</span></td>
                    <td><span className={`status-badge ${getStatusColor(job.completion_status)}`}>{job.completion_status?.replace('_', ' ')}</span></td>
                    <td>{job.monthly_work_done || 0} hrs</td>
                    <td>{Math.round(job.total_hours || 0)} hrs</td>
                    <td>{job.log_entries || 0} entries</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Completed Jobs & Invoice Section */}
        <div className="table-container">
          <h2>📄 Month Completed Invoice</h2>
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
              {completedJobs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No completed jobs yet. Complete a job to see it here.</td>
                </tr>
              ) : (
                completedJobs.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><strong>{invoice.lc_number}</strong></td>
                    <td>{new Date(invoice.completion_date).toLocaleDateString()}</td>
                    <td>{invoice.total_work_done} hrs</td>
                    <td>{invoice.invoice_month}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit">Create Job</button>
                <button type="button" onClick={() => setShowNewJobModal(false)} style={{ background: '#6b7280' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal - Shows Attendance Logs */}
      {showModal && selectedJob && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2>Job: {selectedJob.job?.lc_number}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#6b7280', padding: '5px 10px' }}>×</button>
            </div>

            {/* Update Status Section */}
            <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Update Status</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  value={selectedJob.job?.po_status}
                  onChange={(e) => updateJob(selectedJob.job.id, {
                    po_status: e.target.value,
                    completion_status: selectedJob.job.completion_status,
                  })}
                  style={{ width: 'auto' }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={selectedJob.job?.completion_status}
                  onChange={(e) => updateJob(selectedJob.job.id, {
                    po_status: selectedJob.job.po_status,
                    completion_status: e.target.value,
                  })}
                  style={{ width: 'auto' }}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => deleteJob(selectedJob.job.id)} className="btn-danger">Delete Job</button>
              </div>
            </div>

            {/* Attendance Logs Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3>Attendance Logs</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectedJob.logs && selectedJob.logs.length > 0 ? (
                  selectedJob.logs.map((log) => (
                    <div key={log.id} style={{ background: '#f9fafb', padding: '10px', marginBottom: '10px', borderRadius: '6px' }}>
                      <div>
                        <strong>{log.log_date}</strong> - {log.hours_worked} hours
                      </div>
                      {log.notes && <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>{log.notes}</div>}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    No attendance logs yet. Add one below.
                  </div>
                )}
              </div>
            </div>

            {/* Add Attendance Section */}
            <div>
              <h3>Add Attendance</h3>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hours Worked</label>
                <input type="number" step="0.5" placeholder="Hours" value={attendanceHours} onChange={(e) => setAttendanceHours(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea rows="2" placeholder="Work completed, notes, etc." value={attendanceNotes} onChange={(e) => setAttendanceNotes(e.target.value)}></textarea>
              </div>
              <button className="btn-success" onClick={() => addAttendance(selectedJob.job.id)}>
                + Add Log
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
        .clickable-row:hover {
          background: #f9fafb;
          cursor: pointer;
        }
        .no-data {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
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
      `}</style>
    </div>
  );
}