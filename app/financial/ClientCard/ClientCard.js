'use client';

import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function ClientCard({ client }) {
  return (
    <Link href={`/clients/${client.id}`} className="client-card">
      <div className="client-header">
        <div className="client-icon">🏢</div>
        <div className="client-name">{client.client_name}</div>
      </div>
      
      <div className="client-details">
        {client.contact_person && (
          <div className="detail">
            <span className="detail-icon">👤</span>
            <span>{client.contact_person}</span>
          </div>
        )}
        {client.email && (
          <div className="detail">
            <span className="detail-icon">📧</span>
            <span>{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="detail">
            <span className="detail-icon">📞</span>
            <span>{client.phone}</span>
          </div>
        )}
      </div>
      
      <div className="client-stats">
        <div className="stat">
          <span className="stat-value">{client.job_count || 0}</span>
          <span className="stat-label">Jobs</span>
        </div>
        <div className="stat">
          <span className="stat-value"><CurrencyAmount amount={client.total_invoiced || 0} /></span>
          <span className="stat-label">Invoiced</span>
        </div>
      </div>
      
      <style jsx>{`
        .client-card {
          display: block;
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          text-decoration: none;
          color: inherit;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        .client-card:hover {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .client-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .client-icon {
          font-size: 1.5rem;
        }
        .client-name {
          font-weight: 600;
          font-size: 1rem;
        }
        .client-details {
          margin-bottom: 0.75rem;
        }
        .detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        .detail-icon {
          width: 20px;
        }
        .client-stats {
          display: flex;
          gap: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid #f3f4f6;
        }
        .stat {
          flex: 1;
          text-align: center;
        }
        .stat-value {
          display: block;
          font-size: 1rem;
          font-weight: 600;
        }
        .stat-label {
          font-size: 0.65rem;
          color: #9ca3af;
        }
      `}</style>
    </Link>
  );
}