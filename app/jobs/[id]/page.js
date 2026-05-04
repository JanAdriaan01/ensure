// app/jobs/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchJob();
    } else if (!isAuthenticated && !loading) {
      console.log('Not authenticated, token:', token);
      setError('Please log in to view job details');
      setLoading(false);
    }
  }, [isAuthenticated, token, params.id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching job:', params.id);
      console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(`/api/jobs/${params.id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Job data received:', data);
      
      // Handle both response formats
      if (data.job) {
        setJob(data.job);
      } else {
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
        <style jsx>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
          .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="error-container">
        <h2>Error Loading Job</h2>
        <p>{error || 'Job not found'}</p>
        <div className="error-actions">
          <button onClick={() => router.push('/jobs')} className="btn-primary">
            Back to Jobs
          </button>
          <button onClick={fetchJob} className="btn-secondary">
            Retry
          </button>
        </div>
        <style jsx>{`
          .error-container { text-align: center; padding: 4rem; }
          .error-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
          .btn-primary { background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; cursor: pointer; }
          .btn-secondary { background: #64748b; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; cursor: pointer; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/jobs" className="back-link">← Back to Jobs</Link>
          <h1>{job.job_number || `JOB-${job.id}`}</h1>
          <p className="subtitle">{job.description || 'No description provided'}</p>
        </div>
        <div className="header-actions">
          <span className={`status-badge ${job.po_status === 'approved' ? 'status-approved' : 'status-pending'}`}>
            {job.po_status === 'approved' ? 'Active Job' : job.po_status || 'Pending'}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">PO Amount</span>
            <span className="card-value">{formatCurrency(job.po_amount)}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <span className="card-label">PO Number</span>
            <span className="card-value">{job.po_number || 'Not assigned'}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">🏢</div>
          <div className="card-content">
            <span className="card-label">Client</span>
            <span className="card-value">{job.client_name || 'Unknown'}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <span className="card-label">Created</span>
            <span className="card-value">{formatDate(job.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Additional Job Details */}
      <div className="details-section">
        <h3>Job Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Completion Status</span>
            <span className="detail-value">{job.completion_status || 'Not Started'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Budget</span>
            <span className="detail-value">{formatCurrency(job.total_budget)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Actual Cost</span>
            <span className="detail-value">{formatCurrency(job.actual_cost)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Quote Reference</span>
            <span className="detail-value">{job.quote_number || '-'}</span>
          </div>
          {job.site_address && (
            <div className="detail-item full-width">
              <span className="detail-label">Site Address</span>
              <span className="detail-value">{job.site_address}</span>
            </div>
          )}
          {job.start_date && (
            <div className="detail-item">
              <span className="detail-label">Start Date</span>
              <span className="detail-value">{formatDate(job.start_date)}</span>
            </div>
          )}
          {job.end_date && (
            <div className="detail-item">
              <span className="detail-label">End Date</span>
              <span className="detail-value">{formatDate(job.end_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Management Sections - Read Only Links */}
      <div className="sections-grid">
        <Link href={`/jobs/${job.id}/tools`} className="section-card">
          <div className="section-icon">🔧</div>
          <div className="section-info">
            <h3>Tools</h3>
            <p>View tools assigned to this job</p>
          </div>
          <div className="section-arrow">→</div>
        </Link>

        <Link href={`/jobs/${job.id}/stock`} className="section-card">
          <div className="section-icon">📦</div>
          <div className="section-info">
            <h3>Stock & Materials</h3>
            <p>View stock allocated to this job</p>
          </div>
          <div className="section-arrow">→</div>
        </Link>

        <Link href={`/jobs/${job.id}/team`} className="section-card">
          <div className="section-icon">👥</div>
          <div className="section-info">
            <h3>Team</h3>
            <p>View team members assigned</p>
          </div>
          <div className="section-arrow">→</div>
        </Link>

        <Link href={`/jobs/${job.id}/payroll`} className="section-card">
          <div className="section-icon">💰</div>
          <div className="section-info">
            <h3>Payroll</h3>
            <p>View hours logged</p>
          </div>
          <div className="section-arrow">→</div>
        </Link>

        <Link href={`/jobs/${job.id}/invoicing`} className="section-card">
          <div className="section-icon">📄</div>
          <div className="section-info">
            <h3>Invoicing</h3>
            <p>View invoices for this job</p>
          </div>
          <div className="section-arrow">→</div>
        </Link>
      </div>

      <style jsx>{`
        .job-detail-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .subtitle {
          color: #64748b;
          margin: 0;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-pending {
          background: #fed7aa;
          color: #92400e;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .card-icon {
          font-size: 2rem;
        }

        .card-content {
          display: flex;
          flex-direction: column;
        }

        .card-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .details-section {
          background: #f8fafc;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .details-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          margin-top: 0.25rem;
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }

        .section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .section-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #3b82f6;
        }

        .section-icon {
          font-size: 2rem;
        }

        .section-info {
          flex: 1;
        }

        .section-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .section-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .section-arrow {
          font-size: 1.25rem;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .job-detail-container {
            padding: 1rem;
          }
          .sections-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}