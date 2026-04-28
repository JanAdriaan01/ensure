'use client';

import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import Card from '@/app/components/ui/Card/Card';

export function HRWidget({ stats }) {
  return (
    <Card>
      <div className="widget-header">
        <span className="widget-icon">👥</span>
        <h3>HR Overview</h3>
        <Link href="/hr" className="widget-link">View Details →</Link>
      </div>
      <div className="widget-stats">
        <div className="stat">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{stats.totalEmployees}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Active</div>
          <div className="stat-value">{stats.activeEmployees}</div>
        </div>
        <div className="stat">
          <div className="stat-label">On Leave</div>
          <div className="stat-value">{stats.onLeave}</div>
        </div>
      </div>
      <div className="widget-footer">
        <div className="stat">
          <div className="stat-label">Estimated Payroll</div>
          <div className="stat-value"><CurrencyAmount amount={stats.monthlyPayroll} /></div>
        </div>
      </div>
      <style jsx>{`
        .widget-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .widget-icon {
          font-size: 1.25rem;
        }
        .widget-header h3 {
          margin: 0;
          font-size: 0.9rem;
          flex: 1;
        }
        .widget-link {
          font-size: 0.7rem;
          color: #2563eb;
          text-decoration: none;
        }
        .widget-stats {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
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
        }
        .widget-footer {
          margin-top: 0.5rem;
        }
      `}</style>
    </Card>
  );
}