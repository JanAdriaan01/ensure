'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function InvoicingPage() {
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

  // Fetch invoices from API
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/invoices' : `/api/invoices?status=${filter}`;
      const response = await fetch(url);
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
  }, [filter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Mark invoice as paid
  const markAsPaid = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: 'paid', 
          paid_date: new Date().toISOString().split('T')[0] 
        })
      });
      const result = await response.json();
      
      if (result.success) {
        fetchInvoices(); // Refresh the list
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete invoice
  const deleteInvoice = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    setActionLoading(id);
    try {
      const response = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        fetchInvoices(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
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

  const getStatusCount = (status) => {
    if (status === 'all') return invoices.length;
    return invoices.filter(i => i.status === status).length;
  };

  if (loading) {
    return (
      <div className="invoicing-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading invoices...</p>
        </div>
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
            border: 3px solid #e5e7eb;
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
          All ({getStatusCount('all')})
        </button>
        <button 
          className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Draft ({getStatusCount('draft')})
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({getStatusCount('pending')})
        </button>
        <button 
          className={`filter-tab ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          Paid ({getStatusCount('paid')})
        </button>
        <button 
          className={`filter-tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue ({getStatusCount('overdue')})
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
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="invoice-link">
                    <Link href={`/invoicing/${invoice.id}`}>
                      {invoice.invoice_number}
                    </Link>
                  </table>
                  <td>{invoice.client_name}</td>
                  <td>{invoice.job_number || '-'}</td>
                  <td>{invoice.issue_date || '-'}</td>
                  <td className={invoice.status === 'overdue' ? 'overdue-date' : ''}>
                    {invoice.due_date || '-'}
                  </td>
                  <td className="amount">{formatCurrency(invoice.total_amount || invoice.amount)}</td>
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
                    {invoice.status === 'draft' && (
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteInvoice(invoice.id)}
                        disabled={actionLoading === invoice.id}
                      >
                        Delete
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

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .dark .page-header h1 {
          color: #f9fafb;
        }

        .page-header p {
          color: #6b7280;
        }

        .dark .page-header p {
          color: #9ca3af;
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
          background: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .dark .stat-card {
          background: #1f2937;
          border-color: #374151;
        }

        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .dark .stat-label {
          color: #9ca3af;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .dark .stat-value {
          color: #f9fafb;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .dark .filter-tabs {
          border-bottom-color: #374151;
        }

        .filter-tab {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #6b7280;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .dark .filter-tab:hover {
          background: #374151;
          color: #f9fafb;
        }

        .filter-tab.active {
          background: #3b82f6;
          color: white;
        }

        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }

        .dark .table-container {
          background: #1f2937;
          border-color: #374151;
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
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }

        .dark th {
          color: #9ca3af;
          border-bottom-color: #374151;
        }

        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }

        .dark td {
          color: #f9fafb;
          border-bottom-color: #374151;
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

        .status-paid {
          background: #d1fae5;
          color: #065f46;
        }

        .dark .status-paid {
          background: #064e3b;
          color: #6ee7b7;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .dark .status-pending {
          background: #451a03;
          color: #fbbf24;
        }

        .status-overdue {
          background: #fee2e2;
          color: #991b1b;
        }

        .dark .status-overdue {
          background: #450a0a;
          color: #fca5a5;
        }

        .status-draft {
          background: #f3f4f6;
          color: #4b5563;
        }

        .dark .status-draft {
          background: #374151;
          color: #9ca3af;
        }

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
          background: #f3f4f6;
          color: #4b5563;
        }

        .dark .action-btn.view {
          background: #374151;
          color: #9ca3af;
        }

        .action-btn.view:hover {
          background: #e5e7eb;
        }

        .action-btn.delete {
          background: #ef4444;
          color: white;
        }

        .action-btn.delete:hover {
          background: #dc2626;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state .btn-primary {
          display: inline-block;
          margin-top: 1rem;
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