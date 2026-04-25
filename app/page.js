'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState({
    totalInvoiced: 0,
    productiveHours: 0,
    unproductiveHours: 0,
    totalHours: 0,
    poVsInvoiced: { totalPO: 0, totalInvoiced: 0, percentage: 0 }
  });
  const [stats, setStats] = useState({
    jobs: { active: 0, completed: 0 },
    employees: { total: 0, active: 0 },
    clients: { total: 0 },
    quotes: { total: 0, pending: 0 }
  });
  const [recentItems, setRecentItems] = useState({
    jobs: [],
    employees: [],
    quotes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchMonthlyStats(),
        fetchGeneralStats(),
        fetchRecentItems()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      // Get current month range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Fetch invoicing for current month
      const invoiceRes = await fetch(`/api/invoicing/monthly?start=${firstDay}&end=${lastDay}`);
      const invoiceData = await invoiceRes.json();
      
      // Fetch labor for current month
      const laborRes = await fetch(`/api/labor/monthly?start=${firstDay}&end=${lastDay}`);
      const laborData = await laborRes.json();
      
      // Fetch PO vs Invoiced
      const poRes = await fetch('/api/jobs/stats');
      const poData = await poRes.json();
      
      setMonthlyStats({
        totalInvoiced: invoiceData.totalInvoiced || 0,
        productiveHours: laborData.productiveHours || 0,
        unproductiveHours: laborData.unproductiveHours || 0,
        totalHours: (laborData.productiveHours || 0) + (laborData.unproductiveHours || 0),
        poVsInvoiced: {
          totalPO: poData.totalPO || 0,
          totalInvoiced: poData.totalInvoiced || 0,
          percentage: poData.totalPO > 0 ? ((poData.totalInvoiced / poData.totalPO) * 100).toFixed(1) : 0
        }
      });
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  const fetchGeneralStats = async () => {
    const [jobsRes, employeesRes, clientsRes, quotesRes] = await Promise.all([
      fetch('/api/jobs'),
      fetch('/api/employees'),
      fetch('/api/clients'),
      fetch('/api/quotes')
    ]);
    
    const jobs = await jobsRes.json();
    const employees = await employeesRes.json();
    const clients = await clientsRes.json();
    const quotes = await quotesRes.json();
    
    setStats({
      jobs: {
        active: jobs.filter(j => j.completion_status !== 'completed').length,
        completed: jobs.filter(j => j.completion_status === 'completed').length
      },
      employees: {
        total: employees.length,
        active: employees.filter(e => (e.total_hours_worked || 0) > 0).length
      },
      clients: { total: clients.length },
      quotes: {
        total: quotes.length,
        pending: quotes.filter(q => q.status === 'pending').length
      }
    });
  };

  const fetchRecentItems = async () => {
    const [jobsRes, employeesRes, quotesRes] = await Promise.all([
      fetch('/api/jobs'),
      fetch('/api/employees'),
      fetch('/api/quotes')
    ]);
    
    const jobs = await jobsRes.json();
    const employees = await employeesRes.json();
    const quotes = await quotesRes.json();
    
    setRecentItems({
      jobs: jobs.slice(0, 5),
      employees: employees.slice(0, 5),
      quotes: quotes.slice(0, 5)
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading ENSURE Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>🔧 ENSURE System</h1>
          <p>Complete Project & Workforce Management Platform</p>
        </div>
        <div className="header-date">
          {currentMonth} {currentYear}
        </div>
      </div>

      {/* Monthly Stats Cards */}
      <div className="section">
        <h2>📊 {currentMonth} {currentYear} Summary</h2>
        <div className="stats-grid">
          <div className="stat-card invoicing">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-value">R {monthlyStats.totalInvoiced.toLocaleString()}</div>
              <div className="stat-label">Total Monthly Invoicing</div>
              <div className="stat-sub">Current month to date</div>
            </div>
          </div>
          <div className="stat-card labor">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <div className="stat-value">{monthlyStats.productiveHours} hrs</div>
              <div className="stat-label">Productive Labor</div>
              <div className="stat-sub">{monthlyStats.unproductiveHours} hrs unproductive</div>
            </div>
          </div>
          <div className="stat-card po">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-value">{monthlyStats.poVsInvoiced.percentage}%</div>
              <div className="stat-label">PO vs Invoiced</div>
              <div className="stat-sub">R {monthlyStats.poVsInvoiced.totalInvoiced.toLocaleString()} / R {monthlyStats.poVsInvoiced.totalPO.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* General Stats */}
      <div className="stats-grid-small">
        <div className="small-stat">
          <span className="small-stat-value">{stats.jobs.active}</span>
          <span className="small-stat-label">Active Jobs</span>
        </div>
        <div className="small-stat">
          <span className="small-stat-value">{stats.jobs.completed}</span>
          <span className="small-stat-label">Completed Jobs</span>
        </div>
        <div className="small-stat">
          <span className="small-stat-value">{stats.employees.total}</span>
          <span className="small-stat-label">Total Employees</span>
        </div>
        <div className="small-stat">
          <span className="small-stat-value">{stats.clients.total}</span>
          <span className="small-stat-label">Active Clients</span>
        </div>
        <div className="small-stat">
          <span className="small-stat-value">{stats.quotes.pending}</span>
          <span className="small-stat-label">Pending Quotes</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link href="/clients/new" className="action-card">
            <div className="action-icon">🏢</div>
            <div className="action-title">Add Client</div>
            <div className="action-desc">Register new client</div>
          </Link>
          <Link href="/employees/new" className="action-card">
            <div className="action-icon">👤</div>
            <div className="action-title">Add Employee</div>
            <div className="action-desc">Register team member</div>
          </Link>
          <Link href="/quotes/new" className="action-card">
            <div className="action-icon">💰</div>
            <div className="action-title">Create Quote</div>
            <div className="action-desc">Generate estimate</div>
          </Link>
          <Link href="/jobs/new" className="action-card">
            <div className="action-icon">📋</div>
            <div className="action-title">New Job</div>
            <div className="action-desc">Create project</div>
          </Link>
          <Link href="/employees/time" className="action-card">
            <div className="action-icon">⏰</div>
            <div className="action-title">Log Time</div>
            <div className="action-desc">Record work hours</div>
          </Link>
        </div>
      </div>

      {/* Management Centers */}
      <div className="section">
        <h2>Management Centers</h2>
        <div className="management-grid">
          <Link href="/jobs" className="management-card">
            <div className="management-icon">📋</div>
            <div className="management-info">
              <div className="management-title">Job Management</div>
              <div className="management-desc">Track projects, budgets, and invoicing</div>
            </div>
            <div className="management-arrow">→</div>
          </Link>
          <Link href="/employees" className="management-card">
            <div className="management-icon">👥</div>
            <div className="management-info">
              <div className="management-title">Employee Management</div>
              <div className="management-desc">Manage staff, certifications, and labor</div>
            </div>
            <div className="management-arrow">→</div>
          </Link>
          <Link href="/clients" className="management-card">
            <div className="management-icon">🏢</div>
            <div className="management-info">
              <div className="management-title">Client Management</div>
              <div className="management-desc">View and manage client relationships</div>
            </div>
            <div className="management-arrow">→</div>
          </Link>
          <Link href="/quotes" className="management-card">
            <div className="management-icon">💰</div>
            <div className="management-info">
              <div className="management-title">Quote Management</div>
              <div className="management-desc">Track quotes and convert to jobs</div>
            </div>
            <div className="management-arrow">→</div>
          </Link>
          <Link href="/reports/monthly" className="management-card">
            <div className="management-icon">📊</div>
            <div className="management-info">
              <div className="management-title">Monthly Summary</div>
              <div className="management-desc">Labor productivity and invoicing reports</div>
            </div>
            <div className="management-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-grid">
        <div className="recent-card">
          <div className="recent-header">
            <h3>📋 Recent Jobs</h3>
            <Link href="/jobs" className="view-all">View All →</Link>
          </div>
          <div className="recent-list">
            {recentItems.jobs.length === 0 ? (
              <div className="empty-message">No jobs yet.</div>
            ) : (
              recentItems.jobs.map(job => (
                <Link href={`/jobs/${job.id}`} key={job.id} className="recent-item">
                  <div>
                    <div className="recent-title">{job.lc_number}</div>
                    <div className="recent-meta">{job.completion_status?.replace('_', ' ')}</div>
                  </div>
                  <div className="recent-value">R {job.total_invoiced?.toLocaleString() || 0}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="recent-card">
          <div className="recent-header">
            <h3>👥 Recent Employees</h3>
            <Link href="/employees" className="view-all">View All →</Link>
          </div>
          <div className="recent-list">
            {recentItems.employees.length === 0 ? (
              <div className="empty-message">No employees yet.</div>
            ) : (
              recentItems.employees.map(emp => (
                <Link href={`/employees/${emp.id}`} key={emp.id} className="recent-item">
                  <div>
                    <div className="recent-title">{emp.name} {emp.surname}</div>
                    <div className="recent-meta">{emp.employee_number}</div>
                  </div>
                  <div className="recent-value">{Math.round(emp.total_hours_worked || 0)} hrs</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="recent-card">
          <div className="recent-header">
            <h3>💰 Recent Quotes</h3>
            <Link href="/quotes" className="view-all">View All →</Link>
          </div>
          <div className="recent-list">
            {recentItems.quotes.length === 0 ? (
              <div className="empty-message">No quotes yet.</div>
            ) : (
              recentItems.quotes.map(quote => (
                <Link href={`/quotes/${quote.id}`} key={quote.id} className="recent-item">
                  <div>
                    <div className="recent-title">{quote.quote_number}</div>
                    <div className="recent-meta">{quote.client_name || 'No client'}</div>
                  </div>
                  <div className="recent-value">R {quote.quote_amount?.toLocaleString()}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard { max-width: 1400px; margin: 0 auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .dashboard-header h1 { font-size: 2rem; margin: 0 0 0.25rem 0; color: #111827; }
        .dashboard-header p { color: #6b7280; margin: 0; }
        .header-date { color: #6b7280; font-size: 0.875rem; background: #f3f4f6; padding: 0.5rem 1rem; border-radius: 0.5rem; }
        
        .section { margin-bottom: 2rem; }
        .section h2 { font-size: 1.25rem; margin-bottom: 1rem; color: #374151; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 1rem; }
        .stat-card { background: white; border-radius: 1rem; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .stat-icon { font-size: 2.5rem; }
        .stat-info { flex: 1; }
        .stat-value { font-size: 1.75rem; font-weight: bold; color: #111827; line-height: 1; }
        .stat-label { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
        .stat-sub { font-size: 0.7rem; color: #9ca3af; margin-top: 0.25rem; }
        
        .stats-grid-small { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .small-stat { background: white; padding: 1rem; border-radius: 0.75rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .small-stat-value { font-size: 1.25rem; font-weight: bold; display: block; color: #111827; }
        .small-stat-label { font-size: 0.7rem; color: #6b7280; }
        
        .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
        .action-card { background: white; padding: 1rem; border-radius: 0.75rem; text-align: center; text-decoration: none; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s; }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #f9fafb; }
        .action-icon { font-size: 1.75rem; margin-bottom: 0.5rem; }
        .action-title { font-weight: 600; margin-bottom: 0.25rem; font-size: 0.8rem; }
        .action-desc { font-size: 0.65rem; color: #6b7280; }
        
        .management-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
        .management-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 0.75rem; text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s; }
        .management-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #f9fafb; }
        .management-icon { font-size: 1.75rem; }
        .management-info { flex: 1; }
        .management-title { font-weight: 600; margin-bottom: 0.25rem; font-size: 0.875rem; }
        .management-desc { font-size: 0.7rem; color: #6b7280; }
        .management-arrow { font-size: 1.25rem; color: #9ca3af; }
        
        .recent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .recent-card { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .recent-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .recent-header h3 { margin: 0; font-size: 0.85rem; }
        .view-all { font-size: 0.7rem; color: #2563eb; text-decoration: none; }
        .recent-list { padding: 0.5rem; }
        .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem; text-decoration: none; color: inherit; border-radius: 0.5rem; transition: background 0.2s; }
        .recent-item:hover { background: #f9fafb; }
        .recent-title { font-weight: 500; font-size: 0.8rem; }
        .recent-meta { font-size: 0.65rem; color: #6b7280; margin-top: 0.15rem; }
        .recent-value { font-weight: 600; color: #2563eb; font-size: 0.8rem; }
        .empty-message { text-align: center; padding: 1.5rem; color: #6b7280; font-size: 0.75rem; }
        
        @media (max-width: 768px) { .dashboard { padding: 1rem; } .stats-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}