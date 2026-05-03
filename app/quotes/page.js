'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function QuotesPage() {
  const { token, isAuthenticated } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchQuotes();
    }
  }, [isAuthenticated, token]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 0 
    }).format(amount || 0);
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
      case 'converted':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'sent':
        return 'sent';
      case 'viewed':
        return 'viewed';
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return 'Approved';
      case 'accepted':
        return 'Accepted';
      case 'converted':
        return 'Converted';
      case 'rejected':
        return 'Rejected';
      case 'sent':
        return 'Sent';
      case 'viewed':
        return 'Viewed';
      default:
        return 'Draft';
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

  if (error) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Quotes</h1>
          <p>Manage client quotes and proposals</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchQuotes} className="retry-btn">Retry</button>
        </div>
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
        <Link href="/quotes/new" className="btn-primary">New Quote</Link>
      </div>

      <div className="quotes-grid">
        {quotes.map(quote => (
          <Link key={quote.id} href={`/quotes/${quote.id}`} className="quote-card">
            <div className="quote-header">
              <span className="quote-number">{quote.quote_number}</span>
              <span className={`status-badge ${getStatusClass(quote.status)}`}>
                {getStatusLabel(quote.status)}
              </span>
            </div>
            <div className="quote-client">{quote.client_name || 'Unknown Client'}</div>
            <div className="quote-amount">{formatCurrency(quote.total_amount || quote.amount)}</div>
            <div className="quote-footer">
              <span className="view-link">View Details</span>
            </div>
          </Link>
        ))}
        {quotes.length === 0 && (
          <div className="empty-state">
            <p>No quotes found. Create your first quote to get started.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .quotes-container {
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
          text-align: center;
        }
        .retry-btn {
          background: var(--danger);
          color: white;
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-top: 0.5rem;
        }
        .quotes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .quote-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1rem;
          text-decoration: none;
          transition: all 0.2s;
          display: block;
        }
        .quote-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        .quote-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .quote-number {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-primary);
        }
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-badge.approved,
        .status-badge.accepted,
        .status-badge.converted {
          background: var(--success-bg);
          color: var(--success-dark);
        }
        .status-badge.pending,
        .status-badge.draft {
          background: var(--warning-bg);
          color: var(--warning-dark);
        }
        .status-badge.rejected {
          background: var(--danger-bg);
          color: var(--danger-dark);
        }
        .status-badge.sent {
          background: var(--primary-bg);
          color: var(--primary-dark);
        }
        .status-badge.viewed {
          background: var(--info-bg);
          color: var(--info-dark);
        }
        .quote-client {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .quote-amount {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }
        .quote-footer {
          text-align: right;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-light);
        }
        .view-link {
          font-size: 0.7rem;
          color: var(--primary);
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-tertiary);
        }
        @media (max-width: 768px) {
          .quotes-container {
            padding: 1rem;
          }
          .quotes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}