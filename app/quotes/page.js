'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function QuotesPage() {
  const { token, isAuthenticated } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showPOModal, setShowPOModal] = useState(null);
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchQuotes();
    }
  }, [isAuthenticated, token]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const quotesData = Array.isArray(data) ? data : (data.data || []);
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (id, action, poNumberValue = null, poDateValue = null) => {
    setActionLoading(id);
    try {
      const payload = { action };
      if (action === 'receive_po' && poNumberValue) {
        payload.po_number = poNumberValue;
        payload.po_date = poDateValue;
      }
      
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchQuotes();
        setShowPOModal(null);
        setPoNumber('');
      } else {
        alert(data.error || 'Failed to update quote');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote');
    } finally {
      setActionLoading(null);
    }
  };

  const getAvailableActions = (status) => {
    switch(status) {
      case 'draft':
        return [{ action: 'send', label: 'Send to Client', color: 'primary' }];
      case 'sent':
        return [
          { action: 'mark_viewed', label: 'Mark as Viewed', color: 'info' },
          { action: 'approve', label: 'Approve', color: 'success' },
          { action: 'reject', label: 'Reject', color: 'danger' }
        ];
      case 'pending':
        return [
          { action: 'approve', label: 'Approve', color: 'success' },
          { action: 'reject', label: 'Reject', color: 'danger' }
        ];
      case 'approved':
        return [{ action: 'receive_po', label: 'Receive PO', color: 'success' }];
      case 'po_received':
        return [];
      case 'rejected':
        return [];
      default:
        return [];
    }
  };

  const canDelete = (status) => {
    return status === 'draft' || status === 'pending';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 0 
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'po_received': return 'status-po-received';
      case 'rejected': return 'status-rejected';
      case 'sent': return 'status-sent';
      case 'pending': return 'status-pending';
      default: return 'status-draft';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'po_received': return 'PO Received';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quotes...</p>
      </div>
    );
  }

  return (
    <div className="quotes-container">
      <div className="page-header">
        <div>
          <h1>Quotes</h1>
          <p>Manage client quotes and proposals</p>
        </div>
        <Link href="/quotes/new" className="btn-primary">+ New Quote</Link>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchQuotes} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="quotes-table-container">
        <table className="quotes-table">
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Client</th>
              <th>Scope Summary</th>
              <th>Quote Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => (
              <tr key={quote.id}>
                <td className="quote-number">{quote.quote_number}</td>
                <td className="quote-client">{quote.client_name || 'Unknown'}</td>
                <td className="quote-scope">{quote.scope_subject?.substring(0, 60) || '-'}</td>
                <td className="quote-date">{formatDate(quote.quote_date)}</td>
                <td className="quote-amount">{formatCurrency(quote.total_amount)}</td>
                <td className="quote-status">
                  <span className={`status-badge ${getStatusClass(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                  </span>
                </td>
                <td className="quote-actions">
                  <Link href={`/quotes/${quote.id}`} className="action-btn view">
                    View
                  </Link>
                  <button className="action-btn pdf" onClick={() => alert('PDF Export - Coming Soon')}>
                    PDF
                  </button>
                  <button className="action-btn excel" onClick={() => alert('Excel Export - Coming Soon')}>
                    Excel
                  </button>
                  {getAvailableActions(quote.status).map(action => (
                    <button
                      key={action.action}
                      className={`action-btn ${action.color}`}
                      onClick={() => {
                        if (action.action === 'receive_po') {
                          setShowPOModal({ id: quote.id, action: action.action });
                        } else {
                          updateQuoteStatus(quote.id, action.action);
                        }
                      }}
                      disabled={actionLoading === quote.id}
                    >
                      {actionLoading === quote.id ? '...' : action.label}
                    </button>
                  ))}
                  {canDelete(quote.status) && (
                    <button
                      className="action-btn delete"
                      onClick={() => {
                        if (confirm('Delete this quote?')) {
                          updateQuoteStatus(quote.id, 'delete');
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && (
          <div className="empty-state">
            <p>No quotes found. Create your first quote to get started.</p>
          </div>
        )}
      </div>

      {/* PO Number Modal */}
      {showPOModal && (
        <div className="modal-overlay" onClick={() => setShowPOModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enter Purchase Order Details</h2>
              <button className="modal-close" onClick={() => setShowPOModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>PO Number *</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="e.g., PO-2024-001"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>PO Date</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPOModal(null)}>Cancel</button>
              <button
                className="btn-save"
                onClick={() => updateQuoteStatus(showPOModal.id, 'receive_po', poNumber, poDate)}
                disabled={!poNumber}
              >
                Confirm PO
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .quotes-container {
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
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: var(--text-tertiary);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .error-message {
          background: var(--danger-bg);
          color: var(--danger-dark);
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        .quotes-table-container {
          background: var(--card-bg);
          border-radius: 0.75rem;
          border: 1px solid var(--card-border);
          overflow-x: auto;
        }
        .quotes-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }
        th {
          text-align: left;
          padding: 1rem;
          background: var(--bg-tertiary);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-light);
        }
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-light);
          vertical-align: middle;
        }
        .quote-number {
          font-weight: 600;
          color: var(--text-primary);
        }
        .quote-client {
          color: var(--text-secondary);
        }
        .quote-scope {
          color: var(--text-secondary);
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .quote-amount {
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-draft { background: var(--secondary-bg); color: var(--secondary-dark); }
        .status-pending { background: var(--warning-bg); color: var(--warning-dark); }
        .status-sent { background: var(--primary-bg); color: var(--primary-dark); }
        .status-approved { background: var(--success-bg); color: var(--success-dark); }
        .status-po-received { background: var(--success-bg); color: var(--success-dark); }
        .status-rejected { background: var(--danger-bg); color: var(--danger-dark); }
        
        .quote-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .action-btn {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          text-decoration: none;
          display: inline-block;
        }
        .action-btn.view { background: var(--secondary); color: white; }
        .action-btn.pdf { background: #dc2626; color: white; }
        .action-btn.excel { background: #10b981; color: white; }
        .action-btn.primary { background: var(--primary); color: white; }
        .action-btn.success { background: var(--success); color: white; }
        .action-btn.danger { background: var(--danger); color: white; }
        .action-btn.info { background: var(--info); color: white; }
        .action-btn.delete { background: var(--danger); color: white; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-tertiary);
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--card-bg);
          border-radius: 0.75rem;
          width: 90%;
          max-width: 450px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .modal-header h2 { font-size: 1.125rem; font-weight: 600; }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
        }
        .modal-body { padding: 1rem; }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .form-group { margin-bottom: 1rem; }
        .form-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.375rem;
        }
        .btn-cancel, .btn-save {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-cancel { background: var(--secondary); color: white; border: none; }
        .btn-save { background: var(--primary); color: white; border: none; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        
        @media (max-width: 768px) {
          .quotes-container { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}