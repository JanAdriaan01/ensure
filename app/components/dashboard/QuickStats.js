'use client';

export function QuickStats({ stats }) {
  const safeStats = stats || {
    financial: { activeJobs: 0, pendingQuotes: 0, totalInvoiced: 0, poAmount: 0, thisMonthRevenue: 0 },
    hr: { totalEmployees: 0, activeEmployees: 0, onLeave: 0, monthlyPayroll: 0 },
    operations: { toolsCheckedOut: 0, lowStockItems: 0, activeWorkOrders: 0, overdueTools: 0 }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="quick-stats">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{safeStats.financial.activeJobs || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{safeStats.financial.pendingQuotes || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{safeStats.hr.totalEmployees || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Work Orders</div>
          <div className="stat-value">{safeStats.operations.activeWorkOrders || 0}</div>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value">{formatCurrency(safeStats.financial.totalInvoiced)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Payroll</div>
          <div className="stat-value">{formatCurrency(safeStats.hr.monthlyPayroll)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tools Checked Out</div>
          <div className="stat-value">{safeStats.operations.toolsCheckedOut || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month Revenue</div>
          <div className="stat-value">{formatCurrency(safeStats.financial.thisMonthRevenue)}</div>
        </div>
      </div>

      <style jsx>{`
        .quick-stats {
          margin-bottom: 1.5rem;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
          transition: all 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        @media (max-width: 1024px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}