'use client';

import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge';

export default function InvoiceCard({ invoice }) {
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid';

  return (
    <Link href={`/invoicing/${invoice.id}`} className="invoice-card">
      <div className="invoice-header">
        <div>
          <div className="invoice-number">{invoice.invoice_number}</div>
          <div className="invoice-date">{new Date(invoice.invoice_date).toLocaleDateString()}</div>
        </div>
        <StatusBadge status={invoice.status || 'sent'} />
      </div>
      
      <div className="invoice-client">{invoice.client_name || invoice.job_lc_number}</div>
      
      <div className="invoice-details">
        <div className="invoice-amount">
          <span className="label">Amount</span>
          <span className="value"><CurrencyAmount amount={invoice.total_amount || 0} /></span>
        </div>
        {invoice.due_date && (
          <div className={`invoice-due ${isOverdue ? 'overdue' : ''}`}>
            <span className="label">Due</span>
            <span className="value">{new Date(invoice.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .invoice-card {
          display: block;
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          text-decoration: none;
          color: inherit;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        .invoice-card:hover {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        .invoice-number {
          font-weight: 600;
          font-size: 0.875rem;
        }
        .invoice-date {
          font-size: 0.65rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
        .invoice-client {
          font-size: 0.875rem;
          color: #4b5563;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .invoice-amount, .invoice-due {
          display: flex;
          flex-direction: column;
        }
        .invoice-amount .label, .invoice-due .label {
          font-size: 0.65rem;
          color: #9ca3af;
        }
        .invoice-amount .value {
          font-size: 1rem;
          font-weight: 600;
        }
        .invoice-due .value {
          font-size: 0.75rem;
        }
        .invoice-due.overdue .value {
          color: #dc2626;
        }
      `}</style>
    </Link>
  );
}