'use client';

import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge/StatusBadge';

export default function QuoteCard({ quote, compact = false }) {
  if (compact) {
    return (
      <Link href={`/quotes/${quote.id}`} className="quote-card compact">
        <div className="quote-header">
          <span className="quote-number">{quote.quote_number}</span>
          <span className="quote-amount"><CurrencyAmount amount={quote.total_amount || 0} /></span>
        </div>
        <div className="quote-client">{quote.client_name || 'No client'}</div>
        <style jsx>{`
          .quote-card {
            display: block;
            background: white;
            border-radius: 0.5rem;
            padding: 0.75rem;
            text-decoration: none;
            color: inherit;
            border: 1px solid #e5e7eb;
            transition: all 0.2s;
          }
          .quote-card:hover {
            border-color: #2563eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .quote-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .quote-number {
            font-weight: 600;
            font-size: 0.875rem;
          }
          .quote-amount {
            font-size: 0.875rem;
            font-weight: 500;
          }
          .quote-client {
            font-size: 0.7rem;
            color: #6b7280;
          }
        `}</style>
      </Link>
    );
  }

  return (
    <Link href={`/quotes/${quote.id}`} className="quote-card">
      <div className="quote-header">
        <div>
          <div className="quote-number">{quote.quote_number}</div>
          <div className="quote-date">{new Date(quote.quote_date).toLocaleDateString()}</div>
        </div>
        <StatusBadge status={quote.status} />
      </div>
      
      <div className="quote-client">{quote.client_name || 'No client'}</div>
      
      <div className="quote-footer">
        <div className="quote-amount">
          <span className="label">Amount</span>
          <span className="value"><CurrencyAmount amount={quote.total_amount || 0} /></span>
        </div>
        {quote.po_received && (
          <div className="po-badge">PO Received</div>
        )}
      </div>
      
      <style jsx>{`
        .quote-card {
          display: block;
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          text-decoration: none;
          color: inherit;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        .quote-card:hover {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .quote-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        .quote-number {
          font-weight: 600;
          font-size: 1rem;
        }
        .quote-date {
          font-size: 0.7rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .quote-client {
          font-size: 0.875rem;
          color: #4b5563;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .quote-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .quote-amount {
          display: flex;
          flex-direction: column;
        }
        .quote-amount .label {
          font-size: 0.65rem;
          color: #9ca3af;
        }
        .quote-amount .value {
          font-size: 1rem;
          font-weight: 600;
        }
        .po-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: #d1fae5;
          color: #065f46;
          border-radius: 0.25rem;
        }
      `}</style>
    </Link>
  );
}