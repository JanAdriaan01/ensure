'use client';

import Link from 'next/link';
import Card from '@/app/components/ui/Card/Card';

export function HRWidget({ stats }) {
  const safeStats = stats || { totalEmployees: 0, activeEmployees: 0, onLeave: 0, monthlyPayroll: 0 };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="hr-widget">
      <div className="widget-header">
        <span className="widget-icon">👥</span>
        <h3>HR Overview</h3>
        <Link href="/hr" className="widget-link">View Details →</Link>
      </div>
      <div className="widget-stats">
        <div className="stat">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{safeStats.totalEmployees || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Active</div>
          <div className="stat-value">{safeStats.activeEmployees || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">On Leave</div>
          <div className="stat-value">{safeStats.onLeave || 0}</div>
        </div>
      </div>
      <div className="widget-footer">
        <div className="stat">
          <div className="stat-label">Monthly Payroll</div>
          <div className="stat-value">{formatCurrency(safeStats.monthlyPayroll)}</div>
        </div>
      </div>

      <style jsx>{`
        .hr-widget {
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