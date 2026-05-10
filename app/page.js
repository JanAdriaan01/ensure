// app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Update current time
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
      const [jobsRes, invoicesRes, quotesRes, employeesRes, toolsRes] = await Promise.all([
        fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/invoices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/quotes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/tools', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const jobsData = await jobsRes.json();
      const invoicesData = await invoicesRes.json();
      const quotesData = await quotesRes.json();
      const employeesData = await employeesRes.json();
      const toolsData = await toolsRes.json();

      const jobs = jobsData.data || jobsData || [];
      const invoices = invoicesData.data || invoicesData || [];
      const quotes = quotesData.data || quotesData || [];
      const employees = employeesData.data || employeesData || [];
      const tools = toolsData.data || toolsData || [];

      setStats({
        activeJobs: jobs.filter(j => j.completion_status !== 'completed' && j.po_status === 'approved').length,
        totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        pendingQuotes: quotes.filter(q => q.status === 'pending' || q.status === 'sent').length,
        activeEmployees: employees.filter(e => e.is_active !== false).length,
        toolsInUse: tools.filter(t => t.status === 'in_use' || t.assigned_to).length,
        pendingOHS: 0 // You can add OHS stats later
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (authLoading || loading) {
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
            border-top-color: #3b82f6;
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
      icon: '💰',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      links: [
        { href: '/financial', label: 'Financial Dashboard', icon: '📊' },
        { href: '/invoicing', label: 'Invoicing', icon: '📄' },
        { href: '/quotes', label: 'Quotes', icon: '📋' },
        { href: '/jobs', label: 'Jobs', icon: '🔨' },
        { href: '/clients', label: 'Clients', icon: '👥' },
        { href: '/reconciliation', label: 'Reconciliation', icon: '🔄' }
      ]
    },
    {
      title: 'Operations',
      description: 'Manage tools, inventory, schedule, and OHS',
      icon: '🔧',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      links: [
        { href: '/operations', label: 'Operations Dashboard', icon: '📊' },
        { href: '/tools', label: 'Tools', icon: '🔧' },
        { href: '/inventory', label: 'Inventory', icon: '📦' },
        { href: '/schedule', label: 'Schedule', icon: '📅' },
        { href: '/ohs', label: 'OHS', icon: '🛡️' }
      ]
    },
    {
      title: 'HR',
      description: 'Manage employees, payroll, and certifications',
      icon: '👥',
      color: '#10b981',
      bgColor: '#ecfdf5',
      links: [
        { href: '/hr', label: 'HR Dashboard', icon: '📊' },
        { href: '/employees', label: 'Employees', icon: '👤' },
        { href: '/payroll', label: 'Payroll', icon: '💰' },
        { href: '/employees/skills', label: 'Skills', icon: '⭐' },
        { href: '/employees/certifications', label: 'Certifications', icon: '📜' }
      ]
    },
    {
      title: 'Reports',
      description: 'Generate and view business reports',
      icon: '📊',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      links: [
        { href: '/reports/financial', label: 'Financial Reports', icon: '💰' },
        { href: '/reports/operations', label: 'Operations Reports', icon: '🔧' },
        { href: '/reports/hr', label: 'HR Reports', icon: '👥' },
        { href: '/reports/monthly', label: 'Monthly Reports', icon: '📅' }
      ]
    },
    {
      title: 'Settings',
      description: 'Configure system and company settings',
      icon: '⚙️',
      color: '#64748b',
      bgColor: '#f1f5f9',
      links: [
        { href: '/Settings', label: 'General Settings', icon: '⚙️' },
        { href: '/Settings/company', label: 'Company Information', icon: '🏢' },
        { href: '/Settings/financial', label: 'Financial Settings', icon: '💰' },
        { href: '/Settings/users', label: 'User Management', icon: '👥' }
      ]
    }
  ];

  const quickStats = [
    {
      label: 'Active Jobs',
      value: stats.activeJobs,
      icon: '🔨',
      color: '#3b82f6',
      link: '/jobs',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Total Invoiced',
      value: formatCurrency(stats.totalInvoiced),
      icon: '💰',
      color: '#10b981',
      link: '/invoicing',
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Pending Quotes',
      value: stats.pendingQuotes,
      icon: '📋',
      color: '#f59e0b',
      link: '/quotes',
      change: '-3%',
      trend: 'down'
    },
    {
      label: 'Active Employees',
      value: stats.activeEmployees,
      icon: '👥',
      color: '#8b5cf6',
      link: '/employees',
      change: '+5%',
      trend: 'up'
    },
    {
      label: 'Tools In Use',
      value: stats.toolsInUse,
      icon: '🔧',
      color: '#ef4444',
      link: '/tools',
      change: '+2%',
      trend: 'up'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="greeting">
            <span className="greeting-icon">👋</span>
            <div>
              <h1>{greeting}, {user?.name || user?.email?.split('@')[0] || 'User'}!</h1>
              <p>Welcome back to ENSURE - Your Complete Business Management Platform</p>
            </div>
          </div>
          <div className="time-info">
            <span className="time-icon">🕐</span>
            <span className="time">{currentTime}</span>
            <span className="date">{new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
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
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.trend}`}>
                {stat.change}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Module Cards */}
      <div className="modules-grid">
        {modules.map((module, index) => (
          <div key={index} className="module-card">
            <div className="module-header" style={{ backgroundColor: module.bgColor }}>
              <div className="module-icon" style={{ color: module.color }}>
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
                  <span className="link-icon">{link.icon}</span>
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
            <span className="action-icon">📄</span>
            <span>New Invoice</span>
          </Link>
          <Link href="/quotes/new" className="quick-action">
            <span className="action-icon">📋</span>
            <span>New Quote</span>
          </Link>
          <Link href="/jobs/new" className="quick-action">
            <span className="action-icon">🔨</span>
            <span>New Job</span>
          </Link>
          <Link href="/employees/new" className="quick-action">
            <span className="action-icon">👤</span>
            <span>Add Employee</span>
          </Link>
          <Link href="/clients/new" className="quick-action">
            <span className="action-icon">🏢</span>
            <span>New Client</span>
          </Link>
          <Link href="/tools/new" className="quick-action">
            <span className="action-icon">🔧</span>
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

        /* Welcome Section */
        .welcome-section {
          margin-bottom: 2rem;
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
          font-size: 2rem;
        }

        .greeting h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .greeting p {
          color: #64748b;
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
          font-size: 1.25rem;
        }

        .time {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .date {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Profile Card */
        .profile-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          color: white;
        }

        .profile-avatar {
          width: 70px;
          height: 70px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
        }

        .profile-info p {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          opacity: 0.9;
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
          background: #10b981;
          color: white;
        }

        .profile-link {
          color: white;
          text-decoration: none;
          font-size: 0.875rem;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        .profile-link:hover {
          opacity: 1;
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
          background: white;
          border: 1px solid #e2e8f0;
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
          border-color: #3b82f6;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          display: block;
          margin: 0.25rem 0;
        }

        .stat-change {
          font-size: 0.7rem;
        }

        .stat-change.up {
          color: #10b981;
        }

        .stat-change.down {
          color: #ef4444;
        }

        /* Modules Grid */
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .module-card {
          background: white;
          border: 1px solid #e2e8f0;
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
        }

        .module-icon {
          font-size: 2rem;
        }

        .module-info {
          flex: 1;
        }

        .module-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .module-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .module-links {
          padding: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }

        .module-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .module-link:hover {
          background: #f8fafc;
        }

        .link-icon {
          font-size: 1rem;
        }

        .link-label {
          flex: 1;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .link-arrow {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        /* Quick Actions */
        .quick-actions-section {
          margin-top: 0.5rem;
        }

        .quick-actions-section h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1e293b;
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
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          text-decoration: none;
          color: #1e293b;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .quick-action:hover {
          background: white;
          border-color: #3b82f6;
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 1rem;
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