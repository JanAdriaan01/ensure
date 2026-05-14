// app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';

export default function DashboardPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalInvoiced: 0,
    pendingQuotes: 0,
    activeEmployees: 0,
    toolsInUse: 0,
    pendingOHS: 0
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, token]);

  const fetchDashboardStats = async () => {
    try {
      const jobsRes = await fetch('/api/jobs', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const jobsData = await jobsRes.json();
      const jobs = jobsData.data || jobsData || [];
      
      const invoicesRes = await fetch('/api/invoices', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const invoicesData = await invoicesRes.json();
      let invoices = [];
      if (invoicesData.data) {
        invoices = invoicesData.data;
      } else if (Array.isArray(invoicesData)) {
        invoices = invoicesData;
      } else if (invoicesData.success && invoicesData.data) {
        invoices = invoicesData.data;
      }
      
      const quotesRes = await fetch('/api/quotes', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const quotesData = await quotesRes.json();
      const quotes = quotesData.data || quotesData || [];
      
      const employeesRes = await fetch('/api/employees', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const employeesData = await employeesRes.json();
      const employees = employeesData.data || employeesData || [];
      
      const toolsRes = await fetch('/api/tools', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const toolsData = await toolsRes.json();
      const tools = toolsData.data || toolsData || [];

      const totalInvoiced = invoices.reduce((sum, inv) => {
        const amount = inv.total_amount || inv.amount || 0;
        return sum + parseFloat(amount);
      }, 0);

      setStats({
        activeJobs: jobs.filter(j => j.completion_status !== 'completed' && j.po_status === 'approved').length,
        totalInvoiced: totalInvoiced,
        pendingQuotes: quotes.filter(q => q.status === 'pending' || q.status === 'sent').length,
        activeEmployees: employees.filter(e => e.is_active !== false).length,
        toolsInUse: tools.filter(t => t.status === 'in_use' || t.assigned_to).length,
        pendingOHS: 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!mounted || authLoading || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #22c55e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const modules = [
    {
      title: 'Financial',
      description: 'Manage invoices, quotes, jobs, and client finances',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 7H7M17 12H7M17 17H7" stroke="currentColor" strokeLinecap="round"/>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/financial', label: 'Financial Dashboard' },
        { href: '/invoicing', label: 'Invoicing' },
        { href: '/quotes', label: 'Quotes' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/clients', label: 'Clients' },
        { href: '/reconciliation', label: 'Reconciliation' }
      ]
    },
    {
      title: 'Operations',
      description: 'Manage tools, inventory, schedule, and OHS',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/operations', label: 'Operations Dashboard' },
        { href: '/tools', label: 'Tools' },
        { href: '/inventory', label: 'Inventory' },
        { href: '/schedule', label: 'Schedule' },
        { href: '/ohs', label: 'OHS' }
      ]
    },
    {
      title: 'HR',
      description: 'Manage employees, payroll, and certifications',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/hr', label: 'HR Dashboard' },
        { href: '/employees', label: 'Employees' },
        { href: '/payroll', label: 'Payroll' },
        { href: '/employees/skills', label: 'Skills' },
        { href: '/employees/certifications', label: 'Certifications' }
      ]
    },
    {
      title: 'Reports',
      description: 'Generate and view business reports',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3" stroke="currentColor"/>
          <path d="M12 2v12m0 0 3-3m-3 3-3-3" stroke="currentColor"/>
          <path d="M3 2h18" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/reports/financial', label: 'Financial Reports' },
        { href: '/reports/operations', label: 'Operations Reports' },
        { href: '/reports/hr', label: 'HR Reports' },
        { href: '/reports/monthly', label: 'Monthly Reports' }
      ]
    },
    {
      title: 'Settings',
      description: 'Configure system and company settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" stroke="currentColor"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/Settings', label: 'General Settings' },
        { href: '/Settings/company', label: 'Company Information' },
        { href: '/Settings/financial', label: 'Financial Settings' },
        { href: '/Settings/users', label: 'User Management' }
      ]
    }
  ];

  const quickStats = [
    {
      label: 'Active Jobs',
      value: stats.activeJobs,
      link: '/jobs',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor"/>
        </svg>
      )
    },
    {
      label: 'Total Invoiced',
      value: formatCurrency(stats.totalInvoiced),
      link: '/invoicing',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 7H7M17 12H7M17 17H7" stroke="currentColor" strokeLinecap="round"/>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"/>
        </svg>
      )
    },
    {
      label: 'Pending Quotes',
      value: stats.pendingQuotes,
      link: '/quotes',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor"/>
          <path d="M14 2v6h6" stroke="currentColor"/>
          <path d="M16 13H8" stroke="currentColor"/>
          <path d="M16 17H8" stroke="currentColor"/>
          <path d="M10 9H8" stroke="currentColor"/>
        </svg>
      )
    },
    {
      label: 'Active Employees',
      value: stats.activeEmployees,
      link: '/employees',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor"/>
        </svg>
      )
    },
    {
      label: 'Tools In Use',
      value: stats.toolsInUse,
      link: '/tools',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor"/>
        </svg>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Banner - Charcoal Grey in both modes */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="greeting">
            <span className="greeting-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                <path d="M12 2v20M17 7H7M17 12H7M17 17H7" stroke="currentColor"/>
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"/>
              </svg>
            </span>
            <div>
              <h1>{greeting}, {user?.name || user?.email?.split('@')[0] || 'User'}!</h1>
              <p>Welcome back to ENSURE - Your Complete Business Management Platform</p>
            </div>
          </div>
          <div className="time-info">
            <span className="time-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor"/>
                <polyline points="12 6 12 12 16 14" stroke="currentColor"/>
              </svg>
            </span>
            <span className="time">{currentTime}</span>
            <span className="date">{new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <div className="profile-info">
          <h3>{user?.name || 'User'}</h3>
          <p>{user?.email}</p>
          <span className={`role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
            {user?.role || 'User'}
          </span>
        </div>
        <div className="profile-actions">
          <Link href="/Settings/users" className="profile-link">Profile Settings →</Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        {quickStats.map((stat, index) => (
          <Link href={stat.link} key={index} className="stat-card">
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Module Cards */}
      <div className="modules-grid">
        {modules.map((module, index) => (
          <div key={index} className="module-card">
            <div className="module-header">
              <div className="module-icon">
                {module.icon}
              </div>
              <div className="module-info">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
            </div>
            <div className="module-links">
              {module.links.map((link, linkIndex) => (
                <Link key={linkIndex} href={link.href} className="module-link">
                  <span className="link-label">{link.label}</span>
                  <span className="link-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link href="/invoicing/new" className="quick-action">
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor"/>
                <path d="M14 2v6h6" stroke="currentColor"/>
                <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor"/>
                <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor"/>
              </svg>
            </span>
            <span>New Invoice</span>
          </Link>
          <Link href="/quotes/new" className="quick-action">
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor"/>
                <path d="M14 2v6h6" stroke="currentColor"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor"/>
                <polyline points="10 9 9 9 8 9" stroke="currentColor"/>
              </svg>
            </span>
            <span>New Quote</span>
          </Link>
          <Link href="/jobs/new" className="quick-action">
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor"/>
              </svg>
            </span>
            <span>New Job</span>
          </Link>
          <Link href="/employees/new" className="quick-action">
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor"/>
              </svg>
            </span>
            <span>Add Employee</span>
          </Link>
          <Link href="/clients/new" className="quick-action">
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor"/>
              </svg>
            </span>
            <span>New Client</span>
          </Link>
          <Link href="/tools/new" className="quick-action">
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor"/>
              </svg>
            </span>
            <span>Add Tool</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Banner - Fixed charcoal grey for all themes */
        .welcome-section {
          background: #2d2d2d;
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #404040;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.1);
        }

        .welcome-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .greeting {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .greeting-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22c55e;
        }

        .greeting h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 0.25rem 0;
        }

        .greeting p {
          color: #c0c0c0;
          margin: 0;
          font-size: 0.875rem;
        }

        .time-info {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .time-icon {
          color: #22c55e;
        }

        .time {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }

        .date {
          font-size: 0.75rem;
          color: #c0c0c0;
        }

        /* Profile Card - Uses theme variables */
        .profile-card {
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .profile-avatar {
          width: 70px;
          height: 70px;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
          color: white;
        }

        .profile-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .profile-info p {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .role-admin {
          background: #ef4444;
          color: white;
        }

        .role-user {
          background: #22c55e;
          color: white;
        }

        .profile-link {
          color: var(--primary);
          text-decoration: none;
          font-size: 0.875rem;
          transition: opacity 0.2s;
        }

        .profile-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #22c55e;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22c55e;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          margin: 0.25rem 0;
        }

        /* Modules Grid */
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .module-card {
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s;
        }

        .module-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .module-header {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .module-icon {
          font-size: 2rem;
          color: #22c55e;
        }

        .module-info {
          flex: 1;
        }

        .module-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .module-info p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .module-links {
          padding: 0.75rem;
        }

        .module-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .module-link:hover {
          background: var(--bg-tertiary);
        }

        .link-label {
          flex: 1;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .link-arrow {
          font-size: 0.875rem;
          color: #22c55e;
        }

        /* Quick Actions */
        .quick-actions-section {
          margin-bottom: 1rem;
        }

        .quick-actions-section h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .quick-action:hover {
          background: var(--card-bg);
          border-color: #22c55e;
          transform: translateY(-2px);
        }

        .action-icon {
          color: #22c55e;
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          .welcome-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .time-info {
            text-align: left;
            align-items: flex-start;
          }
          .modules-grid {
            grid-template-columns: 1fr;
          }
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}