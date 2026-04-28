'use client'

'use client';

import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function Home() {
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');
  const { data: employees, loading: employeesLoading } = useFetch('/api/employees');
  
  const loading = jobsLoading || quotesLoading || employeesLoading;

  const activeJobs = jobs?.filter(j => j.completion_status !== 'completed').length || 0;
  const pendingQuotes = quotes?.filter(q => q.status === 'pending' && !q.po_received).length || 0;
  const totalEmployees = employees?.length || 0;

  if (loading) return <LoadingSpinner text="Loading ENSURE..." />;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🔧 ENSURE System</h1>
        <p>Complete Business Management Platform</p>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-value">{activeJobs}</div>
          <div className="stat-label">Active Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingQuotes}</div>
          <div className="stat-label">Pending Quotes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalEmployees}</div>
          <div className="stat-label">Employees</div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="modules-grid">
        <Link href="/jobs" className="module-card financial">
          <div className="module-icon">💰</div>
          <div className="module-title">Financial</div>
          <div className="module-links">
            <span>Job Management</span>
            <span>Quoting</span>
            <span>Invoicing</span>
            <span>Reconciliation</span>
            <span>Client Management</span>
            <span>Monthly Reports</span>
          </div>
        </Link>

        <Link href="/employees" className="module-card hr">
          <div className="module-icon">👥</div>
          <div className="module-title">Human Resources</div>
          <div className="module-links">
            <span>Create Employee</span>
            <span>Payroll</span>
            <span>Employee Management</span>
            <span>Add Skill</span>
            <span>Add Certificate</span>
          </div>
        </Link>

        <Link href="/tools" className="module-card operations">
          <div className="module-icon">⚙️</div>
          <div className="module-title">Operations</div>
          <div className="module-links">
            <span>Tools Management</span>
            <span>Scheduling</span>
            <span>Inventory</span>
            <span>OHS Compliance</span>
          </div>
        </Link>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .dashboard-header {
          text-align: center;
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
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .module-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          text-align: center;
        }
        .module-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .module-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }
        .module-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .module-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .module-links span {
          padding: 0.25rem 0;
        }
        .financial:hover { border-top: 4px solid #2563eb; }
        .hr:hover { border-top: 4px solid #10b981; }
        .operations:hover { border-top: 4px solid #f59e0b; }
        @media (max-width: 768px) {
          .dashboard { padding: 1rem; }
          .quick-stats { grid-template-columns: 1fr; }
          .modules-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
