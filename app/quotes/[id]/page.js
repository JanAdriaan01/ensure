'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const quoteId = params.id;

  useEffect(() => {
    if (isAuthenticated && token && quoteId) {
      fetchQuote();
    }
  }, [isAuthenticated, token, quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/${quoteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 404) {
        setError('Quote not found');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 2 
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'po_received': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'sent': return 'status-sent';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quote...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Quote Not Found</h1>
          <p>The quote you're looking for doesn't exist or has been removed.</p>
        </div>
        <Link href="/quotes" className="btn-primary">Back to Quotes</Link>
      </div>
    );
  }

  return (
    <div className="quote-detail-container">
      <div className="page-header">
        <div>
          <Link href="/quotes" className="back-link">← Back to Quotes</Link>
          <h1>Quote {quote.quote_number}</h1>
          <p>Created on {formatDate(quote.created_at)}</p>
        </div>
        <div className="header-actions">
          <span className={`status-badge ${getStatusClass(quote.status)}`}>
            {quote.status?.toUpperCase() || 'DRAFT'}
          </span>
        </div>
      </div>

      <div className="detail-card">
        <h2>Client Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Client Name</span>
            <span className="info-value">{quote.client_name || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Site Name</span>
            <span className="info-value">{quote.site_name || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Contact Person</span>
            <span className="info-value">{quote.contact_person || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Quote Date</span>
            <span className="info-value">{formatDate(quote.quote_date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Prepared By</span>
            <span className="info-value">{quote.quote_prepared_by || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {quote.scope_subject && (
        <div className="detail-card">
          <h2>Scope of Work</h2>
          <p>{quote.scope_subject}</p>
        </div>
      )}

      <div className="detail-card">
        <h2>Quote Breakdown</h2>
        <div className="totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>VAT ({quote.vat_rate || 15}%):</span>
            <span>{formatCurrency(quote.vat_amount)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total:</span>
            <span>{formatCurrency(quote.total_amount)}</span>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="detail-card">
          <h2>Notes</h2>
          <p>{quote.notes}</p>
        </div>
      )}

      <style jsx>{`
        .quote-detail-container {
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
          color: var(--text-tertiary);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        .back-link:hover {
          color: var(--primary);
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
        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-approved {
          background: var(--success-bg);
          color: var(--success-dark);
        }
        .status-pending {
          background: var(--warning-bg);
          color: var(--warning-dark);
        }
        .status-rejected {
          background: var(--danger-bg);
          color: var(--danger-dark);
        }
        .status-sent {
          background: var(--primary-bg);
          color: var(--primary-dark);
        }
        .detail-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .detail-card h2 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .info-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
        }
        .info-value {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-weight: 500;
        }
        .totals {
          max-width: 300px;
          margin-left: auto;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .grand-total {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          border-top: 1px solid var(--border-light);
          margin-top: 0.5rem;
          padding-top: 0.75rem;
        }
        @media (max-width: 768px) {
          .quote-detail-container {
            padding: 1rem;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}