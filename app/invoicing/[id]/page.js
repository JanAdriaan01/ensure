// app/invoicing/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchInvoice();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setInvoice(data.data);
      } else {
        console.error('Invoice not found');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!confirm('Mark this invoice as paid?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id: parseInt(params.id), 
          status: 'paid', 
          paid_date: new Date().toISOString().split('T')[0] 
        })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchInvoice();
      } else {
        alert(data.error || 'Failed to mark invoice as paid');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update invoice');
    } finally {
      setActionLoading(false);
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
      case 'draft': return 'status-draft';
      default: return 'status-draft';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="error-container">
        <h2>Invoice Not Found</h2>
        <p>The invoice you're looking for doesn't exist.</p>
        <Link href="/invoicing" className="btn-primary">Back to Invoices</Link>
      </div>
    );
  }

  return (
    <div className="invoice-detail-container">
      <div className="page-header">
        <div>
          <Link href="/invoicing" className="back-link">← Back to Invoices</Link>
          <h1>Invoice {invoice.invoice_number}</h1>
        </div>
        <div className="header-actions">
          <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
            {invoice.status?.toUpperCase()}
          </span>
          {invoice.status === 'pending' && (
            <button 
              className="btn-paid"
              onClick={markAsPaid}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Mark as Paid'}
            </button>
          )}
        </div>
      </div>

      <div className="invoice-content">
        <div className="info-section">
          <h3>Invoice Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Invoice Number:</span>
              <span className="value">{invoice.invoice_number}</span>
            </div>
            <div className="info-item">
              <span className="label">Client:</span>
              <span className="value">{invoice.client_name}</span>
            </div>
            <div className="info-item">
              <span className="label">Job:</span>
              <span className="value">
                <Link href={`/jobs/${invoice.job_id}`}>{invoice.job_number}</Link>
              </span>
            </div>
            <div className="info-item">
              <span className="label">Issue Date:</span>
              <span className="value">{formatDate(invoice.issue_date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Due Date:</span>
              <span className="value">{formatDate(invoice.due_date)}</span>
            </div>
            {invoice.paid_date && (
              <div className="info-item">
                <span className="label">Paid Date:</span>
                <span className="value">{formatDate(invoice.paid_date)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="amount-section">
          <h3>Amount Details</h3>
          <div className="amount-grid">
            <div className="amount-item">
              <span className="label">Subtotal:</span>
              <span className="value">{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="amount-item">
              <span className="label">VAT ({invoice.vat_rate}%):</span>
              <span className="value">{formatCurrency(invoice.vat_amount)}</span>
            </div>
            <div className="amount-item total">
              <span className="label">Total Amount:</span>
              <span className="value">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="notes-section">
            <h3>Notes</h3>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .invoice-detail-container {
          max-width: 1000px;
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

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .status-draft { background: #f3f4f6; color: #4b5563; }

        .btn-paid {
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .btn-paid:hover { background: #059669; }

        .invoice-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .info-section, .amount-section, .notes-section {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .notes-section:last-child {
          border-bottom: none;
        }

        h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item, .amount-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .value {
          font-weight: 500;
          color: #1e293b;
        }

        .value a {
          color: #3b82f6;
          text-decoration: none;
        }

        .amount-item.total {
          font-weight: 700;
          font-size: 1rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
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

        .error-container {
          text-align: center;
          padding: 4rem;
        }

        .btn-primary {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}