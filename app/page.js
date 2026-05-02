'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { useToast } from '@/app/context/ToastContext';
import { useFetch } from '@/app/hooks/useFetch';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useNotifications } from '@/app/hooks/useNotifications';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Card from '@/app/components/ui/Card/Card';
import { QuickStats } from '@/app/components/dashboard/QuickStats';
import ActivityFeed from '@/app/components/common/ActivityFeed/ActivityFeed';
import { ModuleCards } from '@/app/components/dashboard/ModuleCards';
import { FinancialWidget } from '@/app/components/dashboard/FinancialWidget';
import { HRWidget } from '@/app/components/dashboard/HRWidget';
import { OperationsWidget } from '@/app/components/dashboard/OperationsWidget';
import NotificationBell from '@/app/components/common/NotificationBell';
import { UserMenu } from '@/app/components/common/UserMenu';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const showToast = toast?.showToast || ((msg, type) => console.log(`[${type}] ${msg}`));
  const { hasPermission } = usePermissions();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  
  // Safe fetch with error handling - don't break if APIs don't exist yet
  const { data: jobs, loading: jobsLoading, error: jobsError } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading, error: quotesError } = useFetch('/api/quotes');
  const { data: employees, loading: employeesLoading, error: employeesError } = useFetch('/api/employees');
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useFetch('/api/activities?limit=10');
  
  const [stats, setStats] = useState({
    financial: {
      activeJobs: 0,
      pendingQuotes: 0,
      totalInvoiced: 0,
      poAmount: 0,
      thisMonthRevenue: 0,
    },
    hr: {
      totalEmployees: 0,
      activeEmployees: 0,
      onLeave: 0,
      monthlyPayroll: 0,
    },
    operations: {
      toolsCheckedOut: 0,
      lowStockItems: 0,
      lowStock: 0,
      activeWorkOrders: 0,
      overdueTools: 0,
    },
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always calculate stats after a short delay or when data is available
    const timer = setTimeout(() => {
      calculateStats();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [jobs, quotes, employees, jobsLoading, quotesLoading, employeesLoading]);

  // Fetch notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications().catch(console.error);
    }
  }, [isAuthenticated, fetchNotifications]);

  const calculateStats = () => {
    // Safe null checks with optional chaining and fallbacks
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    const safeQuotes = Array.isArray(quotes) ? quotes : [];
    const safeEmployees = Array.isArray(employees) ? employees : [];
    
    const activeJobs = safeJobs.filter(j => j?.completion_status !== 'completed').length || 0;
    const pendingQuotes = safeQuotes.filter(q => q?.status === 'pending' && !q?.po_received).length || 0;
    const totalEmployees = safeEmployees.length || 0;
    const activeEmployees = safeEmployees.filter(e => (e?.total_hours_worked || 0) > 0).length || 0;
    
    // Calculate this month's revenue
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const thisMonthRevenue = safeJobs.reduce((sum, j) => {
      const jobMonth = j?.completed_month;
      if (jobMonth === thisMonth && j?.total_invoiced) {
        return sum + (j.total_invoiced || 0);
      }
      return sum;
    }, 0) || 0;
    
    setStats({
      financial: {
        activeJobs,
        pendingQuotes,
        totalInvoiced: safeJobs.reduce((sum, j) => sum + (j?.total_invoiced || 0), 0) || 0,
        poAmount: safeJobs.reduce((sum, j) => sum + (j?.po_amount || 0), 0) || 0,
        thisMonthRevenue,
      },
      hr: {
        totalEmployees,
        activeEmployees,
        onLeave: 0,
        monthlyPayroll: safeEmployees.reduce((sum, e) => sum + ((e?.hourly_rate || 0) * (e?.total_hours_worked || 0)), 0) || 0,
      },
      operations: {
        toolsCheckedOut: 0,
        lowStockItems: 0,
        lowStock: 0,
        activeWorkOrders: activeJobs,
        overdueTools: 0,
      },
    });
    setLoading(false);
  };

  // Welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleNotificationClick = (notification) => {
    if (notification?.link) {
      router.push(notification.link);
    }
    if (notification?.id && markAsRead) {
      markAsRead(notification.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {getWelcomeMessage()}, {user?.name || 'User'}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Welcome to ENSURE - Your Complete Business Management Platform
          </p>
        </div>
        <div className="dashboard-actions">
          <NotificationBell 
            notifications={notifications || []}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onViewAll={() => router.push('/notifications')}
            onNotificationClick={handleNotificationClick}
          />
          <UserMenu user={user} />
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Module Cards */}
      <ModuleCards />

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Financial Widget */}
        <div className="dashboard-widget">
          <FinancialWidget stats={stats.financial} />
        </div>
        
        {/* HR Widget */}
        <div className="dashboard-widget">
          <HRWidget stats={stats.hr} />
        </div>
        
        {/* Operations Widget */}
        <div className="dashboard-widget">
          <OperationsWidget stats={stats.operations} />
        </div>
        
        {/* Recent Activity Feed */}
        <div className="dashboard-widget full-width">
          <ActivityFeed activities={activities || []} loading={activitiesLoading} />
        </div>
      </div>

      {/* Quick Actions Section */}
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
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
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
        
        .dashboard-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
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
        
        .dashboard-widget:hover {
          box-shadow: var(--shadow-md);
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
          transition: all var(--transition-normal);
          border: 1px solid var(--card-border);
        }
        
        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        
        .action-icon {
          font-size: 1.5rem;
        }
        
        .action-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-widget.full-width {
            grid-column: span 2;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-widget.full-width {
            grid-column: span 1;
          }
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}