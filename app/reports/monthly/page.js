'use client';

import Link from 'next/link';

export default function MonthlyReportsPage() {
  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Reports Dashboard</h1>
        <p>View and export business reports</p>
      </div>

      <div className="reports-grid">
        <Link href="/reports/financial" className="report-card">
          <div className="report-icon">💰</div>
          <div className="report-title">Financial Reports</div>
          <div className="report-desc">Revenue, expenses, profit analysis</div>
        </Link>
        <Link href="/reports/hr" className="report-card">
          <div className="report-icon">👥</div>
          <div className="report-title">HR Reports</div>
          <div className="report-desc">Employee metrics, payroll, departments</div>
        </Link>
        <Link href="/reports/operations" className="report-card">
          <div className="report-icon">⚙️</div>
          <div className="report-title">Operations Reports</div>
          <div className="report-desc">Tools, inventory, schedule analytics</div>
        </Link>
      </div>

      <style jsx>{`
        .reports-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: #6b7280;
        }
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .report-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }
        .report-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
        }
        .report-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .report-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .report-desc {
          font-size: 0.75rem;
          color: #6b7280;
        }
        @media (max-width: 768px) {
          .reports-container { padding: 1rem; }
          .reports-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}