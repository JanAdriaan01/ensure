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

export default function DashboardContent() {
  const { user } = useAuth();
  
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');
  const { data: employees, loading: employeesLoading } = useFetch('/api/employees');
  const { data: activities, loading: activitiesLoading } = useFetch('/api/activities?limit=10');
  
  const [stats, setStats] = useState({
    financial: { activeJobs: 0, pendingQuotes: 0, totalInvoiced: 0, poAmount: 0, thisMonthRevenue: 0 },
    hr: { totalEmployees: 0, activeEmployees: 0, onLeave: 0, monthlyPayroll: 0 },
    operations: { toolsCheckedOut: 0, lowStockItems: 0, activeWorkOrders: 0, overdueTools: 0 },
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => calculateStats(), 500);
    return () => clearTimeout(timer);
  }, [jobs, quotes, employees]);

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

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {getWelcomeMessage()}, {user?.name || 'User'}!
          </h1>
          <p className="dashboard-subtitle">
            Welcome to ENSURE - Your Complete Business Management Platform
          </p>
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

      <style jsx>{`
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }
        .dashboard-subtitle {
          color: var(--text-tertiary);
          margin: 0;
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
          box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition-normal);
          border: 1px solid var(--card-border);
        }
        .dashboard-widget.full-width {
          grid-column: span 3;
        }
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-widget.full-width { grid-column: span 2; }
        }
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .dashboard-widget.full-width { grid-column: span 1; }
        }
      `}</style>
    </>
  );
}