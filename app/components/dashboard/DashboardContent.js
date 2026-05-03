'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useFetch } from '@/app/hooks/useFetch';

export default function DashboardContent() {
  const { user } = useAuth();
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');
  const { data: employees, loading: employeesLoading } = useFetch('/api/employees');
  
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingQuotes: 0,
    totalEmployees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      const safeJobs = Array.isArray(jobs) ? jobs : [];
      const safeQuotes = Array.isArray(quotes) ? quotes : [];
      const safeEmployees = Array.isArray(employees) ? employees : [];
      
      setStats({
        activeJobs: safeJobs.filter(j => j?.completion_status !== 'completed').length,
        pendingQuotes: safeQuotes.filter(q => q?.status === 'pending' && !q?.po_received).length,
        totalEmployees: safeEmployees.length
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
        <h1 className="dashboard-title">{getWelcomeMessage()}, {user?.name || 'User'}!</h1>
        <p className="dashboard-subtitle">Welcome to ENSURE - Your Complete Business Management Platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{stats.activeJobs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{stats.pendingQuotes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{stats.totalEmployees}</div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link href="/jobs/new" className="quick-action-card">New Job</Link>
          <Link href="/quotes/new" className="quick-action-card">New Quote</Link>
          <Link href="/employees/new" className="quick-action-card">Add Employee</Link>
          <Link href="/clients/new" className="quick-action-card">New Client</Link>
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
          max-width: 1280px;
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
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }
        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
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
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        .quick-action-card {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s;
        }
        .quick-action-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
        }
        @media (max-width: 768px) {
          .dashboard-container { padding: 1rem; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}