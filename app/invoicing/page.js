// app/invoicing/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function InvoicingPage() {
  const { token, isAuthenticated } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    total_invoiced: 0,
    total_paid: 0,
    total_pending: 0,
    total_overdue: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchInvoices = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/invoices' : `/api/invoices?status=${filter}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setInvoices(result.data || []);
        setStats(result.stats || {
          total_invoiced: 0,
          total_paid: 0,
          total_pending: 0,
          total_overdue: 0
        });
      } else {
        console.error('Failed to fetch invoices:', result.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, isAuthenticated, token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const markAsPaid = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id, 
          status: 'paid', 
          paid_date: new Date().toISOString().split('T')[0] 
        })
      });
      const result = await response.json();
      
      if (result.success) {
        fetchInvoices();
      } else {
        alert(result.error || 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to update invoice');
    } finally {
      setActionLoading(null);
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
        <p>Loading invoices...</p>
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
          <h1>Invoicing</h1>
          <p>Manage client invoices and track payments</p>
        </div>
        <Link href="/invoicing/new" className="btn-primary">
          + New Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value">{formatCurrency(stats.total_invoiced)}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">{formatCurrency(stats.total_paid)}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Pending Payment</div>
          <div className="stat-value">{formatCurrency(stats.total_pending)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{formatCurrency(stats.total_overdue)}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({invoices.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({invoices.filter(i => i.status === 'pending').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          Paid ({invoices.filter(i => i.status === 'paid').length})
        </button>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices found</p>
            <Link href="/invoicing/new" className="btn-primary">Create your first invoice</Link>
          </div>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Job Number</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-link">
                    <Link href={`/invoicing/${invoice.id}`}>
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td>{invoice.client_name || '-'}</td>
                  <td>
                    <Link href={`/jobs/${invoice.job_id}`} className="job-link">
                      {invoice.job_number || '-'}
                    </Link>
                  </td>
                  <td>{formatDate(invoice.issue_date)}</td>
                  <td className={invoice.status === 'overdue' ? 'overdue-date' : ''}>
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="amount">{formatCurrency(invoice.total_amount)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="actions">
                    {invoice.status === 'pending' && (
                      <button 
                        className="action-btn paid"
                        onClick={() => markAsPaid(invoice.id)}
                        disabled={actionLoading === invoice.id}
                      >
                        {actionLoading === invoice.id ? '...' : 'Mark Paid'}
                      </button>
                    )}
                    <Link href={`/invoicing/${invoice.id}`} className="action-btn view">
                      View
                    </Link>
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

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .page-header p {
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
        }

        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #64748b;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .filter-tab.active {
          background: #3b82f6;
          color: white;
        }

        .table-container {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .invoices-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
        }

        .invoice-link a, .job-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .invoice-link a:hover, .job-link:hover {
          text-decoration: underline;
        }

        .amount {
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
          text-transform: capitalize;
        }

        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fee2e2; color: #991b1b; }

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
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .action-btn.paid {
          background: #10b981;
          color: white;
        }

        .action-btn.paid:hover {
          background: #059669;
        }

        .action-btn.view {
          background: #f1f5f9;
          color: #475569;
        }

        .action-btn.view:hover {
          background: #e2e8f0;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
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
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .stat-value {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
}