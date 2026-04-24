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
      setJobs(Array.isArray(data) ? data.filter(j => j.completion_status !== 'completed') : []);
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
        fetchJobs();
        fetchSummary();
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
    const date = document.getElementById('attDate')?.value;
    const hours = parseFloat(document.getElementById('attHours')?.value);
    const notes = document.getElementById('attNotes')?.value;

    if (!date || !hours) {
      alert('Date and hours are required');
      return;
    }

    try {
      await fetch(`/api/jobs/${jobId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_date: date, hours_worked: hours, notes }),
      });
      
      // Clear inputs
      document.getElementById('attDate').value = '';
      document.getElementById('attHours').value = '';
      document.getElementById('attNotes').value = '';
      
      fetchJobDetail(jobId);
      fetchJobs();
    } catch (error) {
      console.error('Error adding attendance:', error);
      alert('Failed to add attendance');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading ENSURE System...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🔧 ENSURE System</h1>
          <p className="text-gray-600 mt-2">Schedule Management & Attendance Tracking</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Completed Work</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_work_done || 0} hrs</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed Jobs</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_jobs_completed || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{jobs.length}</p>
          </div>
        </div>

        {/* New Job Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowNewJobModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            + New Job
          </button>
        </div>

        {/* Active Jobs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <h2 className="text-xl font-semibold p-6 border-b bg-gray-50">Active Jobs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LC Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Work</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No active jobs. Click "New Job" to get started.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => fetchJobDetail(job.id)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{job.lc_number}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.po_status)}`}>
                          {job.po_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.completion_status)}`}>
                          {job.completion_status?.replace('_', ' ') || 'not started'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{job.monthly_work_done || 0} hrs</td>
                      <td className="px-6 py-4">{Math.round(job.total_hours || 0)} hrs</td>
                      <td className="px-6 py-4">{job.log_entries || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Jobs & Invoices */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-6 border-b bg-gray-50">📄 Month Completed Invoice</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LC Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Work Done</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedJobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No completed jobs yet. Complete a job to see it here.
                    </td>
                  </tr>
                ) : (
                  completedJobs.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 font-medium text-gray-900">{invoice.lc_number}</td>
                      <td className="px-6 py-4">{new Date(invoice.completion_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{invoice.total_work_done} hrs</td>
                      <td className="px-6 py-4">{invoice.invoice_month}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Job</h2>
            <form onSubmit={createJob}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">LC Number *</label>
                <input
                  type="text"
                  name="lc_number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., LC-2024-001"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Status</label>
                <select
                  name="po_status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Job: {selectedJob.job?.lc_number}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Job Status Updates */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Update Status</h3>
              <div className="flex gap-3 flex-wrap">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedJob.job?.po_status}
                  onChange={(e) =>
                    updateJob(selectedJob.job.id, {
                      po_status: e.target.value,
                      completion_status: selectedJob.job.completion_status,
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedJob.job?.completion_status}
                  onChange={(e) =>
                    updateJob(selectedJob.job.id, {
                      po_status: selectedJob.job.po_status,
                      completion_status: e.target.value,
                    })
                  }
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => deleteJob(selectedJob.job.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  Delete Job
                </button>
              </div>
            </div>

            {/* Attendance Logs */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Attendance Logs</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedJob.logs && selectedJob.logs.length > 0 ? (
                  selectedJob.logs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{log.log_date}</span>
                          <span className="ml-2 text-sm text-gray-600">{log.hours_worked} hours</span>
                        </div>
                      </div>
                      {log.notes && <p className="text-sm text-gray-600 mt-1">{log.notes}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No attendance logs yet.</p>
                )}
              </div>
            </div>

            {/* Add Attendance */}
            <div>
              <h3 className="font-semibold mb-3">Add Attendance</h3>
              <div className="space-y-3">
                <input
                  type="date"
                  id="attDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  id="attHours"
                  placeholder="Hours Worked"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  id="attNotes"
                  placeholder="Notes (optional)"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => addAttendance(selectedJob.job.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + Add Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}