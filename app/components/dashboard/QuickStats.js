'use client';

import CurrencyAmount from '@/app/components/CurrencyAmount';

export function QuickStats({ stats }) {
  // Safe fallback for undefined stats
  const safeStats = stats || {
    financial: { activeJobs: 0, pendingQuotes: 0, thisMonthRevenue: 0 },
    hr: { totalEmployees: 0, activeEmployees: 0, monthlyPayroll: 0 }
  };

  const statItems = [
    { label: 'Active Jobs', value: safeStats.financial?.activeJobs || 0, icon: '📋', color: '#2563eb' },
    { label: 'Pending Quotes', value: safeStats.financial?.pendingQuotes || 0, icon: '💰', color: '#f59e0b' },
    { label: 'Total Employees', value: safeStats.hr?.totalEmployees || 0, icon: '👥', color: '#10b981' },
    { label: 'This Month Revenue', value: <CurrencyAmount amount={safeStats.financial?.thisMonthRevenue || 0} />, icon: '📊', color: '#8b5cf6' },
  ];

  return (
    <div className="quick-stats">
      {statItems.map((item, index) => (
        <div key={index} className="stat-card" style={{ borderTopColor: item.color }}>
          <div className="stat-icon">{item.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        </div>
      ))}
      <style jsx>{`
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
          border-radius: 0.75rem;
          border-top: 3px solid;
          box-shadow: var(--shadow-sm);
        }
        .stat-icon {
          font-size: 2rem;
        }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
        }
        .stat-label {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }
        @media (max-width: 768px) {
          .quick-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}