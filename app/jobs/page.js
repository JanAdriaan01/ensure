'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id, lcNumber) => {
    if (confirm(`Delete job "${lcNumber}"? This will also delete all attendance records.`)) {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.lc_number?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && job.completion_status !== 'completed') ||
      (filter === 'completed' && job.completion_status === 'completed');
    return matchesSearch && matchesFilter;
  });

  const activeCount = jobs.filter(j => j.completion_status !== 'completed').length;
  const completedCount = jobs.filter(j => j.completion_status === 'completed').length;

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>📋 Job Management</h1>
          <p>Track and manage all projects</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">+ New Job</Link>
      </div>

      {/* Stats Summary */}
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-number">{jobs.length}</span>
          <span className="stat-label">Total Jobs</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by LC number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <div className="no-data">
          <p>No jobs found.</p>
          <Link href="/jobs/new" className="btn-secondary">Create your first job →</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>LC Number</th>
                <th>Client</th>
                <th>PO Status</th>
                <th>Completion</th>
                <th>Total Hours</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id} className="clickable-row" onClick={() => router.push(`/jobs/${job.id}`)}>
                  <td><strong>{job.lc_number}</strong></td>
                  <td>{job.client_name || '-'}</td>
                  <td>
                    <span className={`status-badge status-${job.po_status}`}>
                      {job.po_status}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${job.completion_status?.replace('_', '-')}`}>
                      {job.completion_status?.replace('_', ' ') || 'not started'}
                    </span>
                  </td>
                  <td>{Math.round(job.total_hours || 0)} hrs</td>
                  <td>
                    {job.total_quoted ? (
                      <span>${job.total_quoted.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted">Not set</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteJob(job.id, job.lc_number);
                      }}
                      className="btn-delete-small"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; }
        .page-header h1 { margin: 0; }
        .page-header p { color: #6b7280; margin: 0.25rem 0 0 0; }
        
        .stats-row { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .stat-box { background: white; padding: 1rem 1.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 1.5rem; font-weight: bold; display: block; color: #111827; }
        .stat-label { font-size: 0.75rem; color: #6b7280; }
        
        .search-filter { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .search-input { flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 1rem; min-width: 200px; }
        .filter-buttons { display: flex; gap: 0.5rem; }
        .filter-btn { padding: 0.75rem 1.25rem; background: white; border: 1px solid #ddd; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
        .filter-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
        
        .table-container { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .jobs-table { width: 100%; border-collapse: collapse; }
        .jobs-table th { text-align: left; padding: 0.75rem 1rem; background: #f9fafb; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: #6b7280; }
        .jobs-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background: #f9fafb; }
        
        .status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }
        
        .btn-primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; }
        .btn-delete-small { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem; padding: 0.25rem 0.5rem; }
        .btn-delete-small:hover { background: #fee2e2; border-radius: 0.25rem; }
        
        .text-muted { color: #9ca3af; }
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .no-data { text-align: center; padding: 3rem; background: white; border-radius: 0.75rem; }
        
        @media (max-width: 768px) { .container { padding: 1rem; } .search-filter { flex-direction: column; } .jobs-table { font-size: 0.75rem; } .jobs-table th, .jobs-table td { padding: 0.5rem; } }
      `}</style>
    </div>
  );
}