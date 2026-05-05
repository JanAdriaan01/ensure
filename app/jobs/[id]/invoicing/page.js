// app/jobs/[id]/invoicing/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function JobInvoicingPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [summaries, setSummaries] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchData();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchData = async () => {
    try {
      const [jobRes, invoiceRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch(`/api/jobs/${params.id}/invoices`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        })
      ]);
      
      const jobData = await jobRes.json();
      const invoiceData = await invoiceRes.json();
      
      console.log('Job data:', jobData);
      console.log('Invoice data:', invoiceData);
      
      // Handle job data (could be flat or nested)
      setJob(jobData.job || jobData);
      
      // Handle invoice data
      if (invoiceData.success) {
        setInvoices(invoiceData.data || []);
        setSummaries(invoiceData.summaries);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-draft';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading invoicing data...</p>
        <style jsx>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
          .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="invoicing-container">
      <div className="page-header">
        <div>
          <Link href={`/jobs/${params.id}`} className="back-link">← Back to Job</Link>
          <h1>Invoicing - {job?.job_number}</h1>
          <p className="subtitle">View all invoices for this job</p>
        </div>
        <Link href="/invoicing/new" className="btn-primary">+ New Invoice</Link>
      </div>

      {/* Summary Cards */}
      {summaries && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-label">PO Amount</div>
            <div className="card-value">{formatCurrency(summaries.po_amount)}</div>
          </div>
          <div className="summary-card">
            <div className="card-label">Total Invoiced</div>
            <div className="card-value">{formatCurrency(summaries.total_invoiced)}</div>
          </div>
          <div className="summary-card">
            <div className="card-label">Total Paid</div>
            <div className="card-value">{formatCurrency(summaries.total_paid)}</div>
          </div>
          <div className="summary-card">
            <div className="card-label">Remaining</div>
            <div className="card-value">{formatCurrency(summaries.po_remaining)}</div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {summaries && summaries.progress_percentage > 0 && (
        <div className="progress-section">
          <div className="progress-label">
            <span>Invoicing Progress</span>
            <span>{Math.round(summaries.progress_percentage)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(100, summaries.progress_percentage)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="table-container">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>No invoices created for this job yet.</p>
            <Link href="/invoicing/new" className="btn-primary">Create First Invoice</Link>
          </div>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount (excl. VAT)</th>
                <th>VAT</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="invoice-link">
                    <Link href={`/invoicing/${invoice.id}`}>
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td>{formatDate(invoice.issue_date)}</td>
                  <td className={invoice.status === 'overdue' ? 'overdue-date' : ''}>
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="amount">{formatCurrency(invoice.amount)}</td>
                  <td className="amount">{formatCurrency(invoice.vat_amount)}</td>
                  <td className="amount total">{formatCurrency(invoice.total_amount)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="actions">
                    <Link href={`/invoicing/${invoice.id}`} className="action-btn view">
                      View
                    </Link>
                    {invoice.status === 'pending' && (
                      <button 
                        className="action-btn paid"
                        onClick={async () => {
                          const response = await fetch('/api/invoices', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ 
                              id: invoice.id, 
                              status: 'paid', 
                              paid_date: new Date().toISOString().split('T')[0] 
                            })
                          });
                          if (response.ok) {
                            fetchData();
                          }
                        }}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .invoicing-container {
          max-width: 1280px;
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
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .subtitle {
          color: #64748b;
          margin: 0;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
          display: inline-block;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .summary-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }

        .card-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .progress-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #1e293b;
        }

        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .table-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow-x: auto;
        }

        .invoices-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
        }

        .invoice-link a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .invoice-link a:hover {
          text-decoration: underline;
        }

        .amount {
          font-family: monospace;
        }

        .amount.total {
          font-weight: 600;
        }

        .overdue-date {
          color: #ef4444;
          font-weight: 500;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .status-draft { background: #f3f4f6; color: #4b5563; }

        .actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
        }

        .action-btn.view {
          background: #f1f5f9;
          color: #475569;
        }

        .action-btn.view:hover {
          background: #e2e8f0;
        }

        .action-btn.paid {
          background: #10b981;
          color: white;
        }

        .action-btn.paid:hover {
          background: #059669;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state .btn-primary {
          display: inline-block;
          margin-top: 1rem;
        }

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
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .invoicing-container {
            padding: 1rem;
          }
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}