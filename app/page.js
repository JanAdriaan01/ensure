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
  const [error, setError] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceHours, setAttendanceHours] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    console.log('fetchAllData started');
    setLoading(true);
    setError(null);
    try {
      await fetchJobs();
      await fetchCompletedInvoices();
      await fetchSummary();
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs...');
      const res = await fetch('/api/jobs');
      console.log('Jobs response status:', res.status);
      const data = await res.json();
      console.log('Jobs data:', data);
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs: ' + error.message);
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
    console.log('Fetching job detail for id:', id);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      console.log('Job detail:', data);
      setSelectedJob(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching job detail:', error);
      alert('Failed to load job details: ' + error.message);
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
    
    console.log('Creating job:', jobData);
    
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (res.ok) {
        console.log('Job created successfully');
        setShowNewJobModal(false);
        fetchAllData();
      } else {
        const error = await res.json();
        console.error('Create job error:', error);
        alert(error.error || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job: ' + error.message);
    }
  };

  const updateJob = async (id, updates) => {
    console.log('Updating job:', id, updates);
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
      alert('Failed to update job');
    }
  };

  const deleteJob = async (id) => {
    if (confirm('Delete this job and all attendance records?')) {
      console.log('Deleting job:', id);
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

    console.log('Adding attendance:', { jobId, attendanceDate, attendanceHours, attendanceNotes });
    
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
      pending: '#fef3c7',
      approved: '#d1fae5',
      rejected: '#fee2e2',
      not_started: '#e5e7eb',
      in_progress: '#dbeafe',
      completed: '#d1fae5',
    };
    return colors[status] || '#e5e7eb';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#92400e',
      approved: '#065f46',
      rejected: '#991b1b',
      not_started: '#374151',
      in_progress: '#1e40af',
      completed: '#065f46',
    };
    return colors[status] || '#374151';
  };

  const activeJobs = jobs.filter(job => job.completion_status !== 'completed');
  const completedJobsList = jobs.filter(job => job.completion_status === 'completed');

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading ENSURE System...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
        <h2>Error Loading System</h2>
        <p>{error}</p>
        <button onClick={() => fetchAllData()} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Debug info - remove after working */}
      <div style={{ background: '#e0f2fe', padding: '10px', marginBottom: '20px', borderRadius: '5px', fontSize: '12px' }}>
        <strong>Debug Info:</strong> Jobs: {jobs.length} | Active: {activeJobs.length} | Completed: {completedJobsList.length} | Modal: {showModal ? 'Open' : 'Closed'}
      </div>

      {/* Header */}
      <h1 style={{ fontSize: '32px', marginBottom: '5px' }}>🔧 ENSURE System</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Schedule Management & Attendance Tracking</p>

      {/* Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Total Completed Work</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{summary.total_work_done || 0} hrs</p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Completed Jobs</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{summary.total_jobs_completed || 0}</p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Active Jobs</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{activeJobs.length}</p>
        </div>
      </div>

      {/* New Job Button */}
      <button
        onClick={() => {
          console.log('New Job button clicked');
          setShowNewJobModal(true);
        }}
        style={{
          background: '#0070f3',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '30px'
        }}
      >
        + New Job
      </button>

      {/* Active Jobs Table */}
      <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '30px', overflow: 'hidden' }}>
        <h2 style={{ padding: '15px', margin: 0, background: '#fafafa', borderBottom: '1px solid #ddd', fontSize: '18px' }}>
          📋 Active Jobs {activeJobs.length > 0 ? `(${activeJobs.length})` : ''}
        </h2>
        
        {activeJobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No active jobs. Click "New Job" to get started.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>LC Number</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>PO Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>Completion</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>Monthly Work</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.map(job => (
                <tr 
                  key={job.id} 
                  onClick={() => {
                    console.log('Row clicked:', job.id);
                    fetchJobDetail(job.id);
                  }}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '12px' }}><strong>{job.lc_number}</strong></td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: getStatusColor(job.po_status),
                      color: getStatusTextColor(job.po_status)
                    }}>{job.po_status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{job.completion_status?.replace('_', ' ') || 'not started'}</td>
                  <td style={{ padding: '12px' }}>{job.monthly_work_done || 0} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Completed Jobs Section */}
      <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <h2 style={{ padding: '15px', margin: 0, background: '#fafafa', borderBottom: '1px solid #ddd', fontSize: '18px' }}>
          📄 Month Completed Invoice
        </h2>
        
        {completedJobsList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No completed jobs yet. Complete a job to see it here.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>LC Number</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>Completion Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>Total Work Done</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#fafafa' }}>Invoice Month</th>
              </tr>
            </thead>
            <tbody>
              {completedJobsList.map(job => (
                <tr key={job.id}>
                  <td style={{ padding: '12px' }}><strong>{job.lc_number}</strong></td>
                  <td style={{ padding: '12px' }}>{job.completed_month || '-'}</td>
                  <td style={{ padding: '12px' }}>{job.monthly_work_done || 0} hrs</td>
                  <td style={{ padding: '12px' }}>{job.completed_month || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Job Modal */}
      {showNewJobModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ marginTop: 0 }}>Create New Job</h2>
            <form onSubmit={createJob}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>LC Number *</label>
                <input type="text" name="lc_number" required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>PO Status</label>
                <select name="po_status" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ background: '#0070f3', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create</button>
                <button type="button" onClick={() => setShowNewJobModal(false)} style={{ background: '#666', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Job: {selectedJob.job?.lc_number}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px' }}>×</button>
            </div>

            {/* Status Update */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Update Status</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select 
                  value={selectedJob.job?.po_status} 
                  onChange={(e) => updateJob(selectedJob.job.id, e.target.value, selectedJob.job.completion_status)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select 
                  value={selectedJob.job?.completion_status} 
                  onChange={(e) => updateJob(selectedJob.job.id, selectedJob.job.po_status, e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => deleteJob(selectedJob.job.id)} style={{ background: '#dc2626', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>

            {/* Attendance Logs */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Attendance Logs</h3>
              {selectedJob.logs && selectedJob.logs.length > 0 ? (
                selectedJob.logs.map(log => (
                  <div key={log.id} style={{ padding: '10px', marginBottom: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <strong>{log.log_date}</strong> - {log.hours_worked} hours
                    {log.notes && <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{log.notes}</div>}
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No attendance logs yet.</div>
              )}
            </div>

            {/* Add Attendance */}
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Add Attendance</h3>
              <input 
                type="date" 
                value={attendanceDate} 
                onChange={(e) => setAttendanceDate(e.target.value)} 
                style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input 
                type="number" 
                step="0.5" 
                placeholder="Hours Worked" 
                value={attendanceHours} 
                onChange={(e) => setAttendanceHours(e.target.value)} 
                style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <textarea 
                placeholder="Notes (optional)" 
                rows="2" 
                value={attendanceNotes} 
                onChange={(e) => setAttendanceNotes(e.target.value)} 
                style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button onClick={() => addAttendance(selectedJob.job.id)} style={{ background: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                + Add Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}