'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useFetch } from '@/app/hooks/useFetch';
import { QuickStats } from '@/app/components/dashboard/QuickStats';
import ActivityFeed from '@/app/components/common/ActivityFeed/ActivityFeed';
import { ModuleCards } from '@/app/components/dashboard/ModuleCards';
import { FinancialWidget } from '@/app/components/dashboard/FinancialWidget';
import { HRWidget } from '@/app/components/dashboard/HRWidget';
import { OperationsWidget } from '@/app/components/dashboard/OperationsWidget';
import NotificationBell from '@/app/components/common/NotificationBell';
import { UserMenu } from '@/app/components/common/UserMenu';

export default function DashboardContent() {
  const { user, isAuthenticated } = useAuth();
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');
  const { data: employees, loading: employeesLoading } = useFetch('/api/employees');
  const { data: activities, loading: activitiesLoading } = useFetch('/api/activities?limit=10');
  
  const [stats, setStats] = useState({
    financial: { activeJobs: 0, pendingQuotes: 0, totalInvoiced: 0, poAmount: 0, thisMonthRevenue: 0 },
    hr: { totalEmployees: 0, activeEmployees: 0, onLeave: 0, monthlyPayroll: 0 },
    operations: { toolsCheckedOut: 0, lowStockItems: 0, activeWorkOrders: 0, overdueTools: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      const safeJobs = Array.isArray(jobs) ? jobs : [];
      const safeQuotes = Array.isArray(quotes) ? quotes : [];
      const safeEmployees = Array.isArray(employees) ? employees : [];
      
      const activeJobs = safeJobs.filter(j => j?.completion_status !== 'completed').length;
      const pendingQuotes = safeQuotes.filter(q => q?.status === 'pending' && !q?.po_received).length;
      const totalEmployees = safeEmployees.length;
      const activeEmployees = safeEmployees.filter(e => (e?.total_hours_worked || 0) > 0).length;
      
      setStats({
        financial: {
          activeJobs,
          pendingQuotes,
          totalInvoiced: safeJobs.reduce((sum, j) => sum + (j?.total_invoiced || 0), 0),
          poAmount: safeJobs.reduce((sum, j) => sum + (j?.po_amount || 0), 0),
          thisMonthRevenue: 0,
        },
        hr: { totalEmployees, activeEmployees, onLeave: 0, monthlyPayroll: 0 },
        operations: { toolsCheckedOut: 0, lowStockItems: 0, activeWorkOrders: activeJobs, overdueTools: 0 },
      });
      setLoading(false);
    };

    calculateStats();
  }, [jobs, quotes, employees]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading || jobsLoading || quotesLoading || employeesLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{getWelcomeMessage()}, {user?.name || 'User'}!</h1>
          <p className="dashboard-subtitle">Welcome to ENSURE - Your Complete Business Management Platform</p>
        </div>
      </div>

      <QuickStats stats={stats} />
      <ModuleCards />

      <div className="dashboard-grid">
        <div className="dashboard-widget">
          <FinancialWidget stats={stats.financial} />
        </div>
        <div className="dashboard-widget">
          <HRWidget stats={stats.hr} />
        </div>
        <div className="dashboard-widget">
          <OperationsWidget stats={stats.operations} />
        </div>
        <div className="dashboard-widget full-width">
          <ActivityFeed activities={activities || []} loading={activitiesLoading} />
        </div>
      </div>

      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link href="/jobs/new" className="quick-action-card">
            <span className="action-icon">📋</span>
            <span className="action-label">New Job</span>
          </Link>
          <Link href="/quotes/new" className="quick-action-card">
            <span className="action-icon">💰</span>
            <span className="action-label">New Quote</span>
          </Link>
          <Link href="/employees/time" className="quick-action-card">
            <span className="action-icon">⏰</span>
            <span className="action-label">Log Time</span>
          </Link>
          <Link href="/employees/new" className="quick-action-card">
            <span className="action-icon">👤</span>
            <span className="action-label">Add Employee</span>
          </Link>
          <Link href="/stock/purchasing" className="quick-action-card">
            <span className="action-icon">📦</span>
            <span className="action-label">Purchase Stock</span>
          </Link>
          <Link href="/tools/checkout" className="quick-action-card">
            <span className="action-icon">🔧</span>
            <span className="action-label">Checkout Tool</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-light);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .dashboard-subtitle {
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin: 1.5rem 0;
        }
        .dashboard-widget {
          background: var(--card-bg);
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid var(--card-border);
        }
        .dashboard-widget.full-width {
          grid-column: span 3;
        }
        .quick-actions-section {
          margin-top: 1.5rem;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        .quick-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--card-bg);
          border-radius: 0.75rem;
          text-decoration: none;
          border: 1px solid var(--card-border);
          transition: all 0.2s;
        }
        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        .action-icon { font-size: 1.5rem; }
        .action-label { font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); }
        @media (max-width: 768px) {
          .dashboard-container { padding: 1rem; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .dashboard-widget.full-width { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}