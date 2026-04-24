'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [jobStats, setJobStats] = useState({ active: 0, completed: 0, totalHours: 0 });
  const [employeeStats, setEmployeeStats] = useState({ total: 0, totalHours: 0, activeToday: 0 });
  const [recentTimeEntries, setRecentTimeEntries] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      await Promise.all([
        fetchJobStats(),
        fetchEmployeeStats(),
        fetchRecentTimeEntries(),
        fetchRecentJobs()
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
    setJobStats({
      active: activeJobs.length,
      completed: jobs.filter(j => j.completion_status === 'completed').length,
      totalHours: jobs.reduce((sum, j) => sum + (j.total_hours || 0), 0)
    });
  };

  const fetchEmployeeStats = async () => {
    const res = await fetch('/api/employees');
    const employees = await res.json();
    const totalHours = employees.reduce((sum, e) => sum + (e.total_hours_worked || 0), 0);
    
    // Count employees who worked in last 7 days
    const activeToday = employees.filter(e => (e.total_hours_worked || 0) > 0).length;
    
    setEmployeeStats({
      total: employees.length,
      totalHours: totalHours,
      activeToday: activeToday
    });
  };

  const fetchRecentTimeEntries = async () => {
    const res = await fetch('/api/employees');
    const employees = await res.json();
    // Get last 5 employees who had time entries (simplified)
    const recent = employees
      .filter(e => e.total_hours_worked > 0)
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        name: `${e.name} ${e.surname}`,
        number: e.employee_number,
        hours: e.total_hours_worked
      }));
    setRecentTimeEntries(recent);
  };

  const fetchRecentJobs = async () => {
    const res = await fetch('/api/jobs');
    const jobs = await res.json();
    setRecentJobs(jobs.slice(0, 5));
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
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>🔧 ENSURE System</h1>
        <p>Complete Employee & Schedule Management Platform</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card jobs">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{jobStats.active}</div>
            <div className="stat-label">Active Jobs</div>
            <div className="stat-sub">{jobStats.completed} completed</div>
          </div>
        </div>

        <div className="stat-card employees">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{employeeStats.total}</div>
            <div className="stat-label">Total Employees</div>
            <div className="stat-sub">{employeeStats.activeToday} active</div>
          </div>
        </div>

        <div className="stat-card hours">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(jobStats.totalHours)}</div>
            <div className="stat-label">Job Hours</div>
            <div className="stat-sub">{Math.round(employeeStats.totalHours)} employee hrs</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link href="/employees/new" className="action-card">
            <div className="action-icon">➕</div>
            <div className="action-title">Add Employee</div>
            <div className="action-desc">Register new team member</div>
          </Link>
          <Link href="/employees/time" className="action-card">
            <div className="action-icon">⏰</div>
            <div className="action-title">Log Time</div>
            <div className="action-desc">Record daily work hours</div>
          </Link>
          <Link href="#" className="action-card" onClick={(e) => {
            e.preventDefault();
            document.querySelector('[class*="btn-primary"]')?.click();
          }}>
            <div className="action-icon">📋</div>
            <div className="action-title">New Job</div>
            <div className="action-desc">Create work order</div>
          </Link>
          <Link href="/employees" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-title">View All</div>
            <div className="action-desc">Manage employees</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section">
        <div className="recent-column">
          <h2>🕐 Recent Time Entries</h2>
          <div className="recent-list">
            {recentTimeEntries.length === 0 ? (
              <div className="empty-state">
                <p>No time entries yet</p>
                <Link href="/employees/time" className="empty-link">Log your first time entry →</Link>
              </div>
            ) : (
              recentTimeEntries.map(entry => (
                <Link href={`/employees/${entry.id}`} key={entry.id} className="recent-item">
                  <div className="recent-info">
                    <div className="recent-title">{entry.name}</div>
                    <div className="recent-meta">{entry.number}</div>
                  </div>
                  <div className="recent-value">{Math.round(entry.hours)} hrs</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="recent-column">
          <h2>📋 Recent Jobs</h2>
          <div className="recent-list">
            {recentJobs.length === 0 ? (
              <div className="empty-state">
                <p>No jobs yet</p>
                <button className="empty-link" onClick={() => {
                  const btn = document.querySelector('[class*="btn-primary"]');
                  if (btn) btn.click();
                }}>Create your first job →</button>
              </div>
            ) : (
              recentJobs.map(job => (
                <div key={job.id} className="recent-item" onClick={() => {
                  const modalEvent = new CustomEvent('openJobModal', { detail: job.id });
                  window.dispatchEvent(modalEvent);
                }} style={{ cursor: 'pointer' }}>
                  <div className="recent-info">
                    <div className="recent-title">{job.lc_number}</div>
                    <div className="recent-meta">
                      <span className={`status-badge status-${job.completion_status?.replace('_', '-')}`}>
                        {job.completion_status?.replace('_', ' ') || 'not started'}
                      </span>
                    </div>
                  </div>
                  <div className="recent-value">{Math.round(job.total_hours || 0)} hrs</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="nav-links-section">
        <div className="nav-grid">
          <Link href="/employees" className="nav-link-card">
            <div className="nav-icon">👥</div>
            <div className="nav-text">
              <h3>Employee Management</h3>
              <p>View, edit, and manage all employees</p>
            </div>
            <div className="nav-arrow">→</div>
          </Link>
          <Link href="/employees/time" className="nav-link-card">
            <div className="nav-icon">⏰</div>
            <div className="nav-text">
              <h3>Daily Time Entry</h3>
              <p>Log work hours for today</p>
            </div>
            <div className="nav-arrow">→</div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Loading Spinner */
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.2rem;
          color: #6b7280;
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Welcome Section */
        .welcome-section {
          margin-bottom: 2rem;
        }
        .welcome-section h1 {
          font-size: 2.5rem;
          font-weight: bold;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }
        .welcome-section p {
          color: #6b7280;
          margin: 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .stat-icon {
          font-size: 2.5rem;
        }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .stat-sub {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }

        /* Quick Actions */
        .quick-actions {
          margin-bottom: 2rem;
        }
        .quick-actions h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #374151;
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .action-card {
          background: white;
          padding: 1.25rem;
          border-radius: 0.75rem;
          text-align: center;
          text-decoration: none;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s;
          cursor: pointer;
          display: block;
        }
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          background: #f9fafb;
        }
        .action-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .action-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .action-desc {
          font-size: 0.75rem;
          color: #6b7280;
        }

        /* Recent Section */
        .recent-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .recent-column h2 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #374151;
        }
        .recent-list {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          text-decoration: none;
          color: inherit;
          transition: background 0.2s;
        }
        .recent-item:last-child {
          border-bottom: none;
        }
        .recent-item:hover {
          background: #f9fafb;
        }
        .recent-info {
          flex: 1;
        }
        .recent-title {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .recent-meta {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .recent-value {
          font-weight: 600;
          color: #2563eb;
        }
        .empty-state {
          padding: 2rem;
          text-align: center;
          color: #6b7280;
        }
        .empty-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #2563eb;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
        }
        .empty-link:hover {
          text-decoration: underline;
        }

        /* Status Badge */
        .status-badge {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }

        /* Navigation Links */
        .nav-links-section {
          margin-top: 1rem;
        }
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        .nav-link-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border-radius: 0.75rem;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .nav-link-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          background: #f9fafb;
        }
        .nav-icon {
          font-size: 2rem;
        }
        .nav-text {
          flex: 1;
        }
        .nav-text h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }
        .nav-text p {
          margin: 0;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .nav-arrow {
          font-size: 1.25rem;
          color: #9ca3af;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          .welcome-section h1 {
            font-size: 1.75rem;
          }
          .stats-grid {
            gap: 1rem;
          }
          .stat-card {
            padding: 1rem;
          }
          .stat-value {
            font-size: 1.5rem;
          }
          .action-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .recent-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}