// app/jobs/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const response = await fetch('/api/jobs');
        const data = await response.json();
        
        console.log('Jobs API Response:', data);
        
        // Handle different response formats
        let jobsArray = [];
        if (data.data && Array.isArray(data.data)) {
          jobsArray = data.data;
        } else if (Array.isArray(data)) {
          jobsArray = data;
        } else if (data.success && data.data) {
          jobsArray = data.data;
        }
        
        console.log(`Found ${jobsArray.length} jobs to display`);
        setJobs(jobsArray);
        
        if (jobsArray.length === 0) {
          console.log('No jobs with po_status="approved" found');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading jobs...</p>
        <style jsx>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
          .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Jobs</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <style jsx>{`
          .error-container { text-align: center; padding: 4rem; }
          button { margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="page-header">
        <div>
          <h1>Job Management</h1>
          <p>Track and manage all construction jobs ({jobs.length} active jobs)</p>
        </div>
        <Link href="/quotes" className="btn-primary">+ New Job (from Quote)</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Jobs Available</h3>
          <p>Jobs are automatically created when a PO number is entered for an approved quote.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Check that quotes have status="po_received" and job_id is set
          </p>
          <Link href="/quotes" className="btn-primary">Go to Quotes</Link>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="job-card">
              <div className="job-header">
                <span className="job-number">{job.job_number || `JOB-${job.id}`}</span>
                <span className={`status-badge ${job.po_status === 'approved' ? 'status-approved' : 'status-pending'}`}>
                  {job.po_status === 'approved' ? 'Ready for Management' : (job.po_status || 'Pending')}
                </span>
              </div>
              <div className="job-client">{job.client_name || 'Unknown Client'}</div>
              <div className="job-details">
                <div className="job-detail">
                  <span className="detail-label">PO Number</span>
                  <span className="detail-value">{job.po_number || 'Not assigned'}</span>
                </div>
                <div className="job-detail">
                  <span className="detail-label">PO Amount</span>
                  <span className="detail-value">{formatCurrency(job.po_amount)}</span>
                </div>
              </div>
              <div className="job-details">
                <div className="job-detail">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{job.completion_status || 'Not Started'}</span>
                </div>
                <div className="job-detail">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="job-footer">
                <span className="view-link">Manage Job →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .jobs-container { max-width: 1280px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 600; margin-bottom: 0.25rem; color: #1e293b; }
        .page-header p { color: #64748b; }
        .btn-primary { background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; }
        .btn-primary:hover { background: #2563eb; }
        .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
        .job-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; text-decoration: none; transition: all 0.2s; display: block; }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: #3b82f6; }
        .job-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .job-number { font-weight: 600; font-size: 1rem; color: #1e293b; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fed7aa; color: #92400e; }
        .job-client { color: #64748b; font-size: 0.875rem; margin-bottom: 1rem; font-weight: 500; }
        .job-details { display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; }
        .job-detail { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-label { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { font-size: 0.875rem; font-weight: 600; color: #1e293b; }
        .job-footer { text-align: right; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; }
        .view-link { font-size: 0.75rem; color: #3b82f6; font-weight: 500; }
        .empty-state { text-align: center; padding: 4rem 2rem; background: #f8fafc; border-radius: 1rem; }
        .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
        .empty-state h3 { margin-bottom: 0.5rem; color: #1e293b; }
        .empty-state p { color: #64748b; margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}