'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    jobs: { active: 0, completed: 0, totalHours: 0 },
    employees: { total: 0, activeToday: 0, totalHours: 0 },
    clients: { total: 0, withJobs: 0 },
    quotes: { total: 0, pending: 0, approved: 0 }
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      await Promise.all([
        fetchJobStats(),
        fetchEmployeeStats(),
        fetchClientStats(),
        fetchQuoteStats(),
        fetchRecentJobs(),
        fetchRecentEmployees(),
        fetchRecentQuotes()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStats = async () => {
    const res = await fetch('/api/jobs');
    const jobs = await res.json();
    const activeJobs = jobs.filter(j => j.completion_status !== 'completed');
    setStats(prev => ({
      ...prev,
      jobs: {
        active: activeJobs.length,
        completed: jobs.filter(j => j.completion_status === 'completed').length,
        totalHours: jobs.reduce((sum, j) => sum + (j.total_hours || 0), 0)
      }
    }));
  };

  const fetchEmployeeStats = async () => {
    const res = await fetch('/api/employees');
    const employees = await res.json();
    const totalHours = employees.reduce((sum, e) => sum + (e.total_hours_worked || 0), 0);
    setStats(prev => ({
      ...prev,
      employees: {
        total: employees.length,
        activeToday: employees.filter(e => (e.total_hours_worked || 0) > 0).length,
        totalHours: totalHours
      }
    }));
  };

  const fetchClientStats = async () => {
    const res = await fetch('/api/clients');
    const clients = await res.json();
    const withJobs = clients.filter(c => (c.job_count || 0) > 0).length;
    setStats(prev => ({
      ...prev,
      clients: {
        total: clients.length,
        withJobs: withJobs
      }
    }));
  };

  const fetchQuoteStats = async () => {
    const res = await fetch('/api/quotes');
    const quotes = await res.json();
    setStats(prev => ({
      ...prev,
      quotes: {
        total: quotes.length,
        pending: quotes.filter(q => q.status === 'pending').length,
        approved: quotes.filter(q => q.status === 'approved').length
      }
    }));
  };

  const fetchRecentJobs = async () => {
    const res = await fetch('/api/jobs');
    const jobs = await res.json();
    setRecentJobs(jobs.slice(0, 5));
  };

  const fetchRecentEmployees = async () => {
    const res = await fetch('/api/employees');
    const employees = await res.json();
    setRecentEmployees(employees.slice(0, 5));
  };

  const fetchRecentQuotes = async () => {
    const res = await fetch('/api/quotes');
    const quotes = await res.json();
    setRecentQuotes(quotes.slice(0, 5));
  };

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
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card jobs">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats.jobs.active}</div>
            <div className="stat-label">Active Jobs</div>
            <div className="stat-sub">{stats.jobs.completed} completed</div>
          </div>
        </div>
        <div className="stat-card employees">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.employees.total}</div>
            <div className="stat-label">Employees</div>
            <div className="stat-sub">{Math.round(stats.employees.totalHours)} hrs logged</div>
          </div>
        </div>
        <div className="stat-card clients">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <div className="stat-value">{stats.clients.total}</div>
            <div className="stat-label">Clients</div>
            <div className="stat-sub">{stats.clients.withJobs} with active jobs</div>
          </div>
        </div>
        <div className="stat-card quotes">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">{stats.quotes.total}</div>
            <div className="stat-label">Quotes</div>
            <div className="stat-sub">{stats.quotes.pending} pending approval</div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="section">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link href="/jobs/new" className="action-card">
            <div className="action-icon">➕</div>
            <div className="action-title">New Job</div>
            <div className="action-desc">Create a new project</div>
          </Link>
          <Link href="/employees/new" className="action-card">
            <div className="action-icon">👤</div>
            <div className="action-title">Add Employee</div>
            <div className="action-desc">Register team member</div>
          </Link>
          <Link href="/employees/time" className="action-card">
            <div className="action-icon">⏰</div>
            <div className="action-title">Log Time</div>
            <div className="action-desc">Record work hours</div>
          </Link>
          <Link href="/clients/new" className="action-card">
            <div className="action-icon">🏢</div>
            <div className="action-title">Add Client</div>
            <div className="action-desc">Register new client</div>
          </Link>
          <Link href="/quotes/new" className="action-card">
            <div className="action-icon">💰</div>
            <div className="action-title">Create Quote</div>
            <div className="action-desc">Generate estimate</div>
          </Link>
        </div>
      </div>

      {/* Management Sections */}
      <div className="section">
        <h2>Management Centers</h2>
        <div className="management-grid">
          <Link href="/jobs" className="management-card">
            <div className="management-icon">📋</div>
            <div className="management-info">
              <div className="management-title">Job Management</div>
              <div className="management-desc">Track projects, budgets, and completion</div>
            </div>
            <div className="management-arrow">→</div>
          </Link>
          <Link href="/employees" className="management-card">
            <div className="management-icon">👥</div>
            <div className="management-info">
              <div className="management-title">Employee Management</div>
              <div className="management-desc">Manage staff, certifications, and skills</div>
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
            {recentJobs.length === 0 ? (
              <div className="empty-message">No jobs yet. Create your first job.</div>
            ) : (
              recentJobs.map(job => (
                <Link href={`/jobs/${job.id}`} key={job.id} className="recent-item">
                  <div>
                    <div className="recent-title">{job.lc_number}</div>
                    <div className="recent-meta">
                      <span className={`status-badge status-${job.completion_status?.replace('_', '-')}`}>
                        {job.completion_status?.replace('_', ' ') || 'not started'}
                      </span>
                    </div>
                  </div>
                  <div className="recent-value">{Math.round(job.total_hours || 0)} hrs</div>
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
            {recentEmployees.length === 0 ? (
              <div className="empty-message">No employees yet. Add your first employee.</div>
            ) : (
              recentEmployees.map(emp => (
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
            {recentQuotes.length === 0 ? (
              <div className="empty-message">No quotes yet. Create your first quote.</div>
            ) : (
              recentQuotes.map(quote => (
                <Link href={`/quotes/${quote.id}`} key={quote.id} className="recent-item">
                  <div>
                    <div className="recent-title">{quote.quote_number}</div>
                    <div className="recent-meta">{quote.client_name || 'No client'}</div>
                  </div>
                  <div className="recent-value">${quote.quote_amount?.toLocaleString()}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Loading */
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .dashboard-header h1 {
          font-size: 2rem;
          margin: 0 0 0.25rem 0;
          color: #111827;
        }
        .dashboard-header p {
          color: #6b7280;
          margin: 0;
        }
        .header-date {
          color: #6b7280;
          font-size: 0.875rem;
          background: #f3f4f6;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .stat-icon { font-size: 2.5rem; }
        .stat-info { flex: 1; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #111827; line-height: 1; }
        .stat-label { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
        .stat-sub { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }

        /* Section */
        .section {
          margin-bottom: 2rem;
        }
        .section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #374151;
        }

        /* Action Grid */
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .action-card {
          background: white;
          padding: 1rem;
          border-radius: 0.75rem;
          text-align: center;
          text-decoration: none;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #f9fafb; }
        .action-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .action-title { font-weight: 600; margin-bottom: 0.25rem; font-size: 0.875rem; }
        .action-desc { font-size: 0.7rem; color: #6b7280; }

        /* Management Grid */
        .management-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .management-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 0.75rem;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .management-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #f9fafb; }
        .management-icon { font-size: 2rem; }
        .management-info { flex: 1; }
        .management-title { font-weight: 600; margin-bottom: 0.25rem; }
        .management-desc { font-size: 0.75rem; color: #6b7280; }
        .management-arrow { font-size: 1.25rem; color: #9ca3af; }

        /* Recent Grid */
        .recent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .recent-card {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .recent-header h3 { margin: 0; font-size: 0.9rem; }
        .view-all { font-size: 0.75rem; color: #2563eb; text-decoration: none; }
        .view-all:hover { text-decoration: underline; }
        .recent-list { padding: 0.5rem; }
        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          text-decoration: none;
          color: inherit;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        .recent-item:hover { background: #f9fafb; }
        .recent-title { font-weight: 500; font-size: 0.875rem; }
        .recent-meta { font-size: 0.7rem; color: #6b7280; margin-top: 0.2rem; }
        .recent-value { font-weight: 600; color: #2563eb; font-size: 0.875rem; }
        .empty-message { text-align: center; padding: 2rem; color: #6b7280; font-size: 0.875rem; }

        /* Status Badge */
        .status-badge {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.65rem;
          font-weight: 500;
        }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard { padding: 1rem; }
          .stats-grid { gap: 1rem; }
          .stat-card { padding: 1rem; }
          .stat-value { font-size: 1.5rem; }
          .stat-icon { font-size: 2rem; }
          .action-grid { grid-template-columns: repeat(2, 1fr); }
          .management-grid { grid-template-columns: 1fr; }
          .recent-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}