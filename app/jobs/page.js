// app/jobs/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function JobsPage() {
  const { token, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [jobDetails, setJobDetails] = useState({});

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchJobs();
    }
  }, [isAuthenticated, token]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      let jobsArray = [];
      if (data && data.data && Array.isArray(data.data)) {
        jobsArray = data.data;
      } else if (data && Array.isArray(data)) {
        jobsArray = data;
      } else if (data && data.success && data.data) {
        jobsArray = data.data;
      }
      
      setJobs(jobsArray);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (jobId) => {
    if (jobDetails[jobId]) return;
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      setJobDetails(prev => ({
        ...prev,
        [jobId]: {
          invoices: data.data || [],
          summaries: data.summaries || {}
        }
      }));
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const toggleExpand = (jobId) => {
    if (expandedRow === jobId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(jobId);
      fetchJobDetails(jobId);
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

  const calculateProgress = (job) => {
    const totalInvoiced = job.total_invoiced || 0;
    const poAmount = job.po_amount || 0;
    if (!poAmount) return 0;
    return Math.min(100, Math.round((totalInvoiced / poAmount) * 100));
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 50) return '#eab308';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'status-active';
      case 'po_received': return 'status-active';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (job) => {
    if (job.completion_status === 'completed') return 'Completed';
    if (job.completion_status === 'in_progress') return 'In Progress';
    if (job.po_status === 'approved') return 'Active';
    return job.po_status || 'Pending';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading jobs...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #22c55e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="page-header">
        <div>
          <h1>Job Management</h1>
          <p>Track and manage all construction jobs ({jobs.length} total jobs)</p>
        </div>
        <Link href="/quotes" className="btn-primary">+ New Job (from Quote)</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor"/>
            </svg>
          </div>
          <h3>No Jobs Available</h3>
          <p>Jobs are automatically created when a PO number is entered for an approved quote.</p>
          <Link href="/quotes" className="btn-primary">Go to Quotes</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Job #</th>
                <th>Client</th>
                <th>PO Number</th>
                <th>PO Amount</th>
                <th>Invoiced</th>
                <th>Progress</th>
                <th>Status</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => {
                const progress = calculateProgress(job);
                const progressColor = getProgressColor(progress);
                const isExpanded = expandedRow === job.id;
                const details = jobDetails[job.id];
                
                return (
                  <>
                    <tr key={job.id} className="job-row">
                      <td className="expand-cell">
                        <button 
                          className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleExpand(job.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </td>
                      <td className="job-number">
                        <Link href={`/jobs/${job.id}`}>
                          {job.job_number || `JOB-${job.id}`}
                        </Link>
                      </td>
                      <td className="client-name">{job.client_name || 'Unknown'}</td>
                      <td className="po-number">{job.po_number || '-'}</td>
                      <td className="amount">{formatCurrency(job.po_amount)}</td>
                      <td className="amount">{formatCurrency(job.total_invoiced || 0)}</td>
                      <td className="progress-cell">
                        <div className="progress-wrapper">
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${progress}%`, backgroundColor: progressColor }}
                            />
                          </div>
                          <span className="progress-text">{progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(job.completion_status || job.po_status)}`}>
                          {getStatusLabel(job)}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <Link href={`/jobs/${job.id}`} className="action-btn view">
                          View
                        </Link>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="9">
                          <div className="expanded-content">
                            {/* Job Overview */}
                            <div className="expanded-section">
                              <h4>Job Overview</h4>
                              <div className="expanded-grid">
                                <div className="info-item">
                                  <span className="info-label">Description</span>
                                  <span className="info-value">{job.description || 'No description'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Total Budget</span>
                                  <span className="info-value">{formatCurrency(job.total_budget)}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Created</span>
                                  <span className="info-value">{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Quote Reference</span>
                                  <span className="info-value">{job.quote_id || '-'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Invoicing Details */}
                            {details?.summaries && (
                              <div className="expanded-section">
                                <h4>Invoicing Summary</h4>
                                <div className="invoice-summary">
                                  <div className="summary-item">
                                    <span className="summary-label">Total Invoiced</span>
                                    <span className="summary-value">{formatCurrency(details.summaries.total_invoiced)}</span>
                                  </div>
                                  <div className="summary-item">
                                    <span className="summary-label">Total Paid</span>
                                    <span className="summary-value">{formatCurrency(details.summaries.total_paid)}</span>
                                  </div>
                                  <div className="summary-item">
                                    <span className="summary-label">Outstanding</span>
                                    <span className="summary-value" style={{ color: details.summaries.total_outstanding > 0 ? '#dc2626' : '#10b981' }}>
                                      {formatCurrency(details.summaries.total_outstanding)}
                                    </span>
                                  </div>
                                  <div className="summary-item">
                                    <span className="summary-label">Remaining to Invoice</span>
                                    <span className="summary-value">{formatCurrency(details.summaries.po_remaining)}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Recent Invoices */}
                            {details?.invoices && details.invoices.length > 0 && (
                              <div className="expanded-section">
                                <h4>Recent Invoices</h4>
                                <table className="mini-table">
                                  <thead>
                                    <tr>
                                      <th>Invoice #</th>
                                      <th>Date</th>
                                      <th>Amount</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.invoices.slice(0, 5).map(inv => (
                                      <tr key={inv.id}>
                                        <td>
                                          <Link href={`/invoicing/${inv.id}`} className="invoice-link">
                                            {inv.invoice_number}
                                          </Link>
                                        </td>
                                        <td>{new Date(inv.issue_date).toLocaleDateString()}</td>
                                        <td>{formatCurrency(inv.total_amount)}</td>
                                        <td>
                                          <span className={`status-small ${inv.status}`}>
                                            {inv.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {details.invoices.length > 5 && (
                                  <Link href={`/jobs/${job.id}/invoicing`} className="view-all-link">
                                    View all {details.invoices.length} invoices →
                                  </Link>
                                )}
                              </div>
                            )}

                            <div className="expanded-actions">
                              <Link href={`/jobs/${job.id}`} className="expanded-btn primary">
                                Manage Job
                              </Link>
                              <Link href={`/jobs/${job.id}/invoicing`} className="expanded-btn secondary">
                                View Invoices
                              </Link>
                              <Link href={`/jobs/${job.id}/tools`} className="expanded-btn secondary">
                                Tools
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .jobs-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .page-header p {
          color: #64748b;
        }

        .btn-primary {
          background: #22c55e;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #16a34a;
        }

        .table-wrapper {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .jobs-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        .jobs-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .jobs-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .job-row:hover {
          background: #f8fafc;
        }

        .expand-cell {
          text-align: center;
          width: 40px;
        }

        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: transform 0.2s;
          color: #64748b;
        }

        .expand-btn:hover {
          background: #e2e8f0;
        }

        .expand-btn.expanded {
          transform: rotate(180deg);
        }

        .job-number a {
          color: #22c55e;
          text-decoration: none;
          font-weight: 600;
        }

        .job-number a:hover {
          text-decoration: underline;
        }

        .client-name {
          color: #1e293b;
          font-weight: 500;
        }

        .po-number {
          font-family: monospace;
          color: #64748b;
        }

        .amount {
          font-weight: 600;
          font-family: monospace;
        }

        .progress-cell {
          min-width: 140px;
        }

        .progress-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar-bg {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.7rem;
          font-weight: 600;
          min-width: 40px;
          color: #1e293b;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-progress {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-pending {
          background: #fed7aa;
          color: #92400e;
        }

        .actions-cell {
          white-space: nowrap;
        }

        .action-btn {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .action-btn.view {
          background: #22c55e;
          color: white;
        }

        .action-btn.view:hover {
          background: #16a34a;
        }

        /* Expanded Row Styles */
        .expanded-row {
          background: #f8fafc;
        }

        .expanded-row td {
          padding: 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .expanded-content {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .expanded-section {
          margin-bottom: 1.5rem;
        }

        .expanded-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .expanded-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          margin-top: 0.25rem;
        }

        .invoice-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          background: white;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }

        .summary-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .summary-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-top: 0.25rem;
        }

        .mini-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .mini-table th {
          background: #f1f5f9;
          padding: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
        }

        .mini-table td {
          padding: 0.5rem;
          font-size: 0.8rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .invoice-link {
          color: #22c55e;
          text-decoration: none;
        }

        .invoice-link:hover {
          text-decoration: underline;
        }

        .status-small {
          display: inline-block;
          padding: 0.15rem 0.4rem;
          border-radius: 9999px;
          font-size: 0.65rem;
          font-weight: 500;
        }

        .status-small.paid {
          background: #d1fae5;
          color: #065f46;
        }

        .status-small.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .view-all-link {
          display: inline-block;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: #22c55e;
          text-decoration: none;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .expanded-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .expanded-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }

        .expanded-btn.primary {
          background: #22c55e;
          color: white;
        }

        .expanded-btn.primary:hover {
          background: #16a34a;
        }

        .expanded-btn.secondary {
          background: #f1f5f9;
          color: #1e293b;
        }

        .expanded-btn.secondary:hover {
          background: #e2e8f0;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
        }

        .empty-icon {
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .jobs-container {
            padding: 1rem;
          }
          .expanded-grid {
            grid-template-columns: 1fr;
          }
          .invoice-summary {
            grid-template-columns: 1fr;
          }
          .expanded-actions {
            flex-direction: column;
          }
          .expanded-btn {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}