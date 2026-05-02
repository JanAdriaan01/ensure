'use client';

import Link from 'next/link';
import Card from '@/app/components/ui/Card/Card';

export function FinancialWidget({ stats }) {
  const safeStats = stats || { activeJobs: 0, pendingQuotes: 0, totalInvoiced: 0, poAmount: 0, thisMonthRevenue: 0 };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="financial-widget">
      <div className="widget-header">
        <span className="widget-icon">💰</span>
        <h3>Financial Overview</h3>
        <Link href="/financial" className="widget-link">View Details →</Link>
      </div>
      <div className="widget-stats">
        <div className="stat">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{safeStats.activeJobs || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{safeStats.pendingQuotes || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value">{formatCurrency(safeStats.totalInvoiced)}</div>
        </div>
      </div>
      <div className="widget-footer">
        <div className="stat">
          <div className="stat-label">PO Amount</div>
          <div className="stat-value">{formatCurrency(safeStats.poAmount)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{formatCurrency(safeStats.thisMonthRevenue)}</div>
        </div>
      </div>

      <style jsx>{`
        .financial-widget {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        .widget-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .widget-icon {
          font-size: 1.25rem;
        }
        .widget-header h3 {
          margin: 0;
          font-size: 0.9rem;
          flex: 1;
          color: var(--text-primary);
        }
        .widget-link {
          font-size: 0.7rem;
          color: var(--primary);
          text-decoration: none;
        }
        .widget-stats {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .stat {
          flex: 1;
          text-align: center;
        }
        .stat-label {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .widget-footer {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
        }
      `}</style>
    </div>
  );
}