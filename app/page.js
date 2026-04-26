'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function Home() {
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');
  const { data: employees, loading: employeesLoading } = useFetch('/api/employees');
  const { data: stock, loading: stockLoading } = useFetch('/api/stock');
  const { data: tools, loading: toolsLoading } = useFetch('/api/tools');
  
  const [stats, setStats] = useState({
    financial: {
      activeJobs: 0,
      pendingQuotes: 0,
      totalInvoiced: 0,
      poAmount: 0
    },
    hr: {
      totalEmployees: 0,
      activeEmployees: 0,
      monthlyPayroll: 0
    },
    inventory: {
      stockItems: 0,
      lowStock: 0,
      issuedToJobs: 0
    },
    tools: {
      totalTools: 0,
      toolsCheckedOut: 0,
      overdueTools: 0
    },
    scheduling: {
      activeWorkOrders: 0,
      teams: 0,
      completedThisWeek: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobsLoading && !quotesLoading && !employeesLoading && !stockLoading && !toolsLoading) {
      calculateStats();
    }
  }, [jobs, quotes, employees, stock, tools, jobsLoading, quotesLoading, employeesLoading, stockLoading, toolsLoading]);

  const calculateStats = () => {
    const activeJobs = jobs?.filter(j => j.completion_status !== 'completed').length || 0;
    const pendingQuotes = quotes?.filter(q => q.status === 'pending' && !q.po_received).length || 0;
    const totalEmployees = employees?.length || 0;
    const activeEmployees = employees?.filter(e => (e.total_hours_worked || 0) > 0).length || 0;
    
    setStats({
      financial: {
        activeJobs,
        pendingQuotes,
        totalInvoiced: jobs?.reduce((sum, j) => sum + (j.total_invoiced || 0), 0) || 0,
        poAmount: jobs?.reduce((sum, j) => sum + (j.po_amount || 0), 0) || 0
      },
      hr: {
        totalEmployees,
        activeEmployees,
        monthlyPayroll: employees?.reduce((sum, e) => sum + ((e.hourly_rate || 0) * (e.total_hours_worked || 0)), 0) || 0
      },
      inventory: {
        stockItems: stock?.length || 0,
        lowStock: stock?.filter(s => (s.quantity_on_hand || 0) < (s.min_stock_level || 5)).length || 0,
        issuedToJobs: 0
      },
      tools: {
        totalTools: tools?.length || 0,
        toolsCheckedOut: tools?.filter(t => t.status === 'checked_out').length || 0,
        overdueTools: 0
      },
      scheduling: {
        activeWorkOrders: activeJobs,
        teams: 0,
        completedThisWeek: 0
      }
    });
    setLoading(false);
  };

  if (loading) return <LoadingSpinner text="Loading ENSURE Dashboard..." />;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🔧 ENSURE System</h1>
        <p>Complete Business Management Platform</p>
      </div>

      {/* Financial Module */}
      <div className="module">
        <div className="module-header">
          <span className="module-icon">💰</span>
          <h2>Financial</h2>
          <Link href="/jobs" className="module-link">View All →</Link>
        </div>
        <div className="module-cards">
          <Link href="/jobs" className="module-card">
            <div className="card-icon">📋</div>
            <div className="card-value">{stats.financial.activeJobs}</div>
            <div className="card-label">Active Jobs</div>
          </Link>
          <Link href="/quotes" className="module-card">
            <div className="card-icon">📄</div>
            <div className="card-value">{stats.financial.pendingQuotes}</div>
            <div className="card-label">Pending Quotes</div>
          </Link>
          <Link href="/invoicing" className="module-card">
            <div className="card-icon">🧾</div>
            <div className="card-value"><CurrencyAmount amount={stats.financial.totalInvoiced} /></div>
            <div className="card-label">Total Invoiced</div>
          </Link>
          <div className="module-card">
            <div className="card-icon">💰</div>
            <div className="card-value"><CurrencyAmount amount={stats.financial.poAmount} /></div>
            <div className="card-label">Total PO Value</div>
          </div>
        </div>
      </div>

      {/* HR Module */}
      <div className="module">
        <div className="module-header">
          <span className="module-icon">👥</span>
          <h2>Human Resources</h2>
          <Link href="/employees" className="module-link">View All →</Link>
        </div>
        <div className="module-cards">
          <Link href="/employees" className="module-card">
            <div className="card-icon">👤</div>
            <div className="card-value">{stats.hr.totalEmployees}</div>
            <div className="card-label">Total Employees</div>
          </Link>
          <div className="module-card">
            <div className="card-icon">✅</div>
            <div className="card-value">{stats.hr.activeEmployees}</div>
            <div className="card-label">Active Employees</div>
          </div>
          <Link href="/payroll" className="module-card">
            <div className="card-icon">💰</div>
            <div className="card-value"><CurrencyAmount amount={stats.hr.monthlyPayroll} /></div>
            <div className="card-label">Estimated Payroll</div>
          </Link>
        </div>
      </div>

      {/* Inventory Module */}
      <div className="module">
        <div className="module-header">
          <span className="module-icon">📦</span>
          <h2>Inventory</h2>
          <Link href="/stock/purchasing" className="module-link">Manage →</Link>
        </div>
        <div className="module-cards">
          <Link href="/stock/purchasing" className="module-card">
            <div className="card-icon">📦</div>
            <div className="card-value">{stats.inventory.stockItems}</div>
            <div className="card-label">Stock Items</div>
          </Link>
          <div className="module-card warning">
            <div className="card-icon">⚠️</div>
            <div className="card-value">{stats.inventory.lowStock}</div>
            <div className="card-label">Low Stock Alert</div>
          </div>
          <Link href="/stock/issued" className="module-card">
            <div className="card-icon">📤</div>
            <div className="card-value">{stats.inventory.issuedToJobs}</div>
            <div className="card-label">Issued to Jobs</div>
          </Link>
        </div>
      </div>

      {/* Tools Module */}
      <div className="module">
        <div className="module-header">
          <span className="module-icon">🔧</span>
          <h2>Tools Management</h2>
          <Link href="/tools" className="module-link">Manage →</Link>
        </div>
        <div className="module-cards">
          <Link href="/tools" className="module-card">
            <div className="card-icon">🔧</div>
            <div className="card-value">{stats.tools.totalTools}</div>
            <div className="card-label">Total Tools</div>
          </Link>
          <Link href="/tools/checkout" className="module-card">
            <div className="card-icon">📋</div>
            <div className="card-value">{stats.tools.toolsCheckedOut}</div>
            <div className="card-label">Checked Out</div>
          </Link>
          <div className="module-card danger">
            <div className="card-icon">⏰</div>
            <div className="card-value">{stats.tools.overdueTools}</div>
            <div className="card-label">Overdue Returns</div>
          </div>
        </div>
      </div>

      {/* Scheduling Module */}
      <div className="module">
        <div className="module-header">
          <span className="module-icon">📅</span>
          <h2>Scheduling</h2>
          <Link href="/schedule" className="module-link">View Schedule →</Link>
        </div>
        <div className="module-cards">
          <Link href="/jobs" className="module-card">
            <div className="card-icon">📋</div>
            <div className="card-value">{stats.scheduling.activeWorkOrders}</div>
            <div className="card-label">Active Work Orders</div>
          </Link>
          <div className="module-card">
            <div className="card-icon">👥</div>
            <div className="card-value">{stats.scheduling.teams}</div>
            <div className="card-label">Teams</div>
          </div>
          <div className="module-card">
            <div className="card-icon">✅</div>
            <div className="card-value">{stats.scheduling.completedThisWeek}</div>
            <div className="card-label">Completed This Week</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .dashboard-header h1 {
          font-size: 2rem;
          margin: 0 0 0.25rem 0;
        }
        .dashboard-header p {
          color: #6b7280;
          margin: 0;
        }
        .module {
          background: white;
          border-radius: 1rem;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .module-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .module-icon {
          font-size: 1.5rem;
        }
        .module-header h2 {
          margin: 0;
          font-size: 1.1rem;
          flex: 1;
        }
        .module-link {
          font-size: 0.75rem;
          color: #2563eb;
          text-decoration: none;
        }
        .module-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .module-card {
          background: #f9fafb;
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          display: block;
        }
        .module-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          background: #f3f4f6;
        }
        .card-icon {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .card-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
        }
        .card-label {
          font-size: 0.7rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .module-card.warning .card-value {
          color: #f59e0b;
        }
        .module-card.danger .card-value {
          color: #dc2626;
        }
        @media (max-width: 768px) {
          .dashboard {
            padding: 1rem;
          }
          .module-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}