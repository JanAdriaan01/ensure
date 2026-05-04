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
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [jobRes, invoiceRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/jobs/${params.id}/invoices`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const jobData = await jobRes.json();
      const invoiceData = await invoiceRes.json();
      
      setJob(jobData);
      setInvoices(invoiceData.data || []);
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

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (parseFloat(inv.paid_amount) || 0), 0);
  const outstanding = totalInvoiced - totalPaid;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading invoice data...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="header">
        <Link href={`/jobs/${params.id}`} className="back-link">← Back to Job</Link>
        <h1>Invoicing - {job?.job_number}</h1>
        <p className="subtitle">View all invoices for this job</p>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-label">PO Amount</div>
          <div className="card-value">{formatCurrency(job?.po_amount)}</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Total Invoiced</div>
          <div className="card-value">{formatCurrency(totalInvoiced)}</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Total Paid</div>
          <div className="card-value">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Outstanding</div>
          <div className="card-value" style={{ color: outstanding > 0 ? '#dc2626' : '#10b981' }}>
            {formatCurrency(outstanding)}
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          <span>Invoicing Progress</span>
          <span>{Math.round((totalInvoiced / (job?.po_amount || 1)) * 100)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(100, (totalInvoiced / (job?.po_amount || 1)) * 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="invoice-list">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>No invoices created for this job yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Paid Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="invoice-number">{invoice.invoice_number}</td>
                  <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                  <td className="description">{invoice.description || '-'}</td>
                  <td className="amount">{formatCurrency(invoice.amount)}</td>
                  <td className="paid">{formatCurrency(invoice.paid_amount || 0)}</td>
                  <td className="balance">{formatCurrency((invoice.amount || 0) - (invoice.paid_amount || 0))}</td>
                  <td>
                    <span className={`status ${invoice.status}`}>
                      {invoice.status === 'paid' ? 'Paid' : invoice.status === 'partial' ? 'Partial' : 'Unpaid'}
                    </span>
                  </td>
                  <td>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #1e293b;
        }

        .subtitle {
          color: #64748b;
          margin: 0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
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
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
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

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
        }

        .invoice-number {
          font-weight: 600;
          color: #1e293b;
        }

        .amount, .paid, .balance {
          font-family: monospace;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status.paid {
          background: #d1fae5;
          color: #065f46;
        }

        .status.partial {
          background: #fef3c7;
          color: #92400e;
        }

        .status.unpaid {
          background: #fee2e2;
          color: #dc2626;
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
      `}</style>
    </div>
  );
}