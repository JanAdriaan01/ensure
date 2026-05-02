'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        setJobs(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-not-started';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading jobs...</p>
        <style jsx>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
          .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="page-header">
        <div>
          <h1>Job Management</h1>
          <p>Track and manage all construction jobs</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">+ New Job</Link>
      </div>

      <div className="jobs-grid">
        {jobs.map(job => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="job-card">
            <div className="job-header">
              <span className="job-number">{job.lc_number}</span>
              <span className={`status-badge ${getStatusClass(job.completion_status || job.po_status)}`}>
                {job.completion_status || job.po_status || 'Pending'}
              </span>
            </div>
            <div className="job-client">{job.client_name || 'Unknown Client'}</div>
            <div className="job-details">
              <div className="job-detail">
                <span className="detail-label">PO Amount</span>
                <span className="detail-value">{formatCurrency(job.po_amount)}</span>
              </div>
              <div className="job-detail">
                <span className="detail-label">Invoiced</span>
                <span className="detail-value">{formatCurrency(job.total_invoiced || 0)}</span>
              </div>
            </div>
            <div className="job-footer">
              <span className="view-link">View Details →</span>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && (
          <div className="empty-state">
            <p>No jobs found. Create your first job to get started.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .jobs-container { max-width: 1280px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
        .page-header p { color: var(--text-tertiary); }
        .btn-primary { background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; }
        .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .job-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 0.75rem; padding: 1rem; text-decoration: none; transition: all 0.2s; display: block; }
        .job-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--primary); }
        .job-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .job-number { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
        .status-badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-approved, .status-completed { background: var(--success-bg); color: var(--success-dark); }
        .status-pending, .status-not-started { background: var(--warning-bg); color: var(--warning-dark); }
        .status-in-progress { background: var(--primary-bg); color: var(--primary-dark); }
        .job-client { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem; }
        .job-details { display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--border-light); }
        .job-detail { display: flex; flex-direction: column; }
        .detail-label { font-size: 0.65rem; color: var(--text-tertiary); }
        .detail-value { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
        .job-footer { text-align: right; padding-top: 0.5rem; border-top: 1px solid var(--border-light); }
        .view-link { font-size: 0.7rem; color: var(--primary); }
        .empty-state { text-align: center; padding: 3rem; color: var(--text-tertiary); }
        @media (max-width: 768px) { .jobs-container { padding: 1rem; } }
      `}</style>
    </div>
  );
}