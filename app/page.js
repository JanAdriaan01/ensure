'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/app/context/CurrencyContext';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function Home() {
  const { formatAmount } = useCurrency();
  const [summary, setSummary] = useState({
    monthlyInvoiced: 0,
    productiveHours: 0,
    unproductiveHours: 0,
    poTotal: 0,
    invoicedTotal: 0,
    poPercentage: 0,
    activeJobs: 0,
    totalEmployees: 0,
    totalClients: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await fetch('/api/reports/monthly');
      const summaryData = await summaryRes.json();
      
      const jobsRes = await fetch('/api/jobs');
      const jobs = await jobsRes.json();
      
      const employeesRes = await fetch('/api/employees');
      const employees = await employeesRes.json();
      
      const clientsRes = await fetch('/api/clients');
      const clients = await clientsRes.json();
      
      const quotesRes = await fetch('/api/quotes');
      const quotes = await quotesRes.json();
      
      setSummary({
        monthlyInvoiced: summaryData.monthlyInvoiced || 0,
        productiveHours: summaryData.productiveHours || 0,
        unproductiveHours: summaryData.unproductiveHours || 0,
        poTotal: summaryData.poTotal || 0,
        invoicedTotal: summaryData.invoicedTotal || 0,
        poPercentage: summaryData.poTotal > 0 ? ((summaryData.invoicedTotal / summaryData.poTotal) * 100).toFixed(1) : 0,
        activeJobs: jobs.filter(j => j.completion_status !== 'completed').length,
        totalEmployees: employees.length,
        totalClients: clients.length
      });
      
      setRecentJobs(jobs.slice(0, 5));
      setRecentEmployees(employees.slice(0, 5));
      setRecentQuotes(quotes.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading ENSURE Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>🔧 ENSURE System</h1>
          <p>Complete Project & Workforce Management Platform</p>
        </div>
        <div className="header-date">{currentMonth}</div>
      </div>

      {/* Monthly Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">
              <CurrencyAmount amount={summary.monthlyInvoiced} />
            </div>
            <div className="stat-label">Total Monthly Invoicing</div>
            <div className="stat-sub">1st to last day of month</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-value">{summary.productiveHours} hrs</div>
            <div className="stat-label">Productive Labor</div>
            <div className="stat-sub">{summary.unproductiveHours} hrs unproductive</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{summary.poPercentage}%</div>
            <div className="stat-label">PO vs Invoiced</div>
            <div className="stat-sub">
              <CurrencyAmount amount={summary.invoicedTotal} /> / <CurrencyAmount amount={summary.poTotal} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <div className="stat-info">
            <div className="stat-value">{summary.activeJobs}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <div className="stat-info">
            <div className="stat-value">{summary.totalEmployees}</div>
            <div className="stat-label">Employees</div>
          </div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <div className="stat-info">
            <div className="stat-value">{summary.totalClients}</div>
            <div className="stat-label">Clients</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h2>
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
            <div className="action-desc">Generate estimate for client</div>
          </Link>
          <Link href="/jobs/new" className="action-card">
            <div className="action-icon">📋</div>
            <div className="action-title">New Job</div>
            <div className="action-desc">Create new project</div>
          </Link>
          <Link href="/employees/time" className="action-card">
            <div className="action-icon">⏰</div>
            <div className="action-title">Log Time</div>
            <div className="action-desc">Record work hours</div>
          </Link>
        </div>
      </div>

      {/* Management Centers */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Management Centers</h2>
        <div className="management-grid">
          <Link href="/jobs" className="management-card">
            <span className="management-icon">📋</span>
            <div className="management-info">
              <div className="management-title">Job Management</div>
              <div className="management-desc">Track projects, budgets, assign employees, invoice items</div>
            </div>
            <span className="management-arrow">→</span>
          </Link>
          <Link href="/employees" className="management-card">
            <span className="management-icon">👥</span>
            <div className="management-info">
              <div className="management-title">Employee Management</div>
              <div className="management-desc">Manage staff, certifications, skills, labor tracking</div>
            </div>
            <span className="management-arrow">→</span>
          </Link>
          <Link href="/clients" className="management-card">
            <span className="management-icon">🏢</span>
            <div className="management-info">
              <div className="management-title">Client Management</div>
              <div className="management-desc">View and manage all clients</div>
            </div>
            <span className="management-arrow">→</span>
          </Link>
          <Link href="/quotes" className="management-card">
            <span className="management-icon">💰</span>
            <div className="management-info">
              <div className="management-title">Quote Management</div>
              <div className="management-desc">Create quotes, convert to jobs</div>
            </div>
            <span className="management-arrow">→</span>
          </Link>
          <Link href="/reports/monthly" className="management-card">
            <span className="management-icon">📊</span>
            <div className="management-info">
              <div className="management-title">Monthly Summary</div>
              <div className="management-desc">Labor productivity, invoicing reports</div>
            </div>
            <span className="management-arrow">→</span>
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
              <div className="empty-state" style={{ padding: '1rem', textAlign: 'center' }}>No jobs yet</div>
            ) : (
              recentJobs.map(job => (
                <Link href={`/jobs/${job.id}`} key={job.id} className="recent-item">
                  <div>
                    <div className="recent-title">{job.lc_number}</div>
                    <div className="recent-meta">{job.completion_status?.replace('_', ' ')}</div>
                  </div>
                  <div className="recent-value">
                    <CurrencyAmount amount={job.total_invoiced || 0} />
                  </div>
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
              <div className="empty-state" style={{ padding: '1rem', textAlign: 'center' }}>No employees yet</div>
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
              <div className="empty-state" style={{ padding: '1rem', textAlign: 'center' }}>No quotes yet</div>
            ) : (
              recentQuotes.map(quote => (
                <Link href={`/quotes/${quote.id}`} key={quote.id} className="recent-item">
                  <div>
                    <div className="recent-title">{quote.quote_number}</div>
                    <div className="recent-meta">{quote.client_name || 'No client'}</div>
                  </div>
                  <div className="recent-value">
                    <CurrencyAmount amount={quote.quote_amount || 0} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .view-all {
          font-size: 0.7rem;
          color: #2563eb;
          text-decoration: none;
        }
        .view-all:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}