'use client';

import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function FinancialPage() {
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');
  const { data: clients, loading: clientsLoading } = useFetch('/api/clients');
  
  const loading = jobsLoading || quotesLoading || clientsLoading;

  const activeJobs = jobs?.filter(j => j.completion_status !== 'completed').length || 0;
  const pendingQuotes = quotes?.filter(q => q.status === 'pending' && !q.po_received).length || 0;
  const totalInvoiced = jobs?.reduce((sum, j) => sum + (j.total_invoiced || 0), 0) || 0;

  const sections = [
    {
      title: 'Job Management',
      icon: '📋',
      description: 'Track projects, budgets, and completion',
      links: [
        { href: '/jobs', label: 'View All Jobs', icon: '📋' },
        { href: '/jobs?status=active', label: 'Active Jobs', icon: '🔄' },
        { href: '/jobs?status=completed', label: 'Completed Jobs', icon: '✅' }
      ],
      stats: { value: activeJobs, label: 'Active Jobs' }
    },
    {
      title: 'Quoting',
      icon: '📄',
      description: 'Create and manage quotes',
      links: [
        { href: '/quotes', label: 'View All Quotes', icon: '📄' },
        { href: '/quotes/new', label: 'Create Quote', icon: '➕' },
        { href: '/quotes?status=pending', label: 'Pending Quotes', icon: '⏳' }
      ],
      stats: { value: pendingQuotes, label: 'Pending Quotes' }
    },
    {
      title: 'Invoicing',
      icon: '🧾',
      description: 'Manage invoices and payments',
      links: [
        { href: '/invoicing', label: 'All Invoices', icon: '🧾' },
        { href: '/invoicing?status=pending', label: 'Pending Payment', icon: '⏳' },
        { href: '/reconciliation', label: 'Reconciliation', icon: '🔄' }
      ],
      stats: { value: `R ${totalInvoiced.toLocaleString()}`, label: 'Total Invoiced' }
    },
    {
      title: 'Client Management',
      icon: '🏢',
      description: 'Manage client relationships',
      links: [
        { href: '/clients', label: 'View All Clients', icon: '🏢' },
        { href: '/clients/new', label: 'Add Client', icon: '➕' }
      ],
      stats: { value: clients?.length || 0, label: 'Total Clients' }
    },
    {
      title: 'Reporting',
      icon: '📊',
      description: 'Financial reports and analytics',
      links: [
        { href: '/reports/monthly', label: 'Monthly Summary', icon: '📊' },
        { href: '/reports/financial', label: 'Financial Report', icon: '💰' }
      ]
    }
  ];

  if (loading) return <LoadingSpinner text="Loading Financial Module..." />;

  return (
    <div className="financial-page">
      <PageHeader 
        title="💰 Financial Management" 
        description="Manage jobs, quotes, invoicing, and reporting"
      />
      
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{activeJobs}</div>
          <div className="stat-label">Active Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingQuotes}</div>
          <div className="stat-label">Pending Quotes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">R {totalInvoiced.toLocaleString()}</div>
          <div className="stat-label">Total Invoiced</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{clients?.length || 0}</div>
          <div className="stat-label">Active Clients</div>
        </div>
      </div>

      <div className="sections-grid">
        {sections.map(section => (
          <div key={section.title} className="section-card">
            <div className="section-header">
              <span className="section-icon">{section.icon}</span>
              <h3>{section.title}</h3>
            </div>
            <p className="section-description">{section.description}</p>
            {section.stats && (
              <div className="section-stats">
                <span className="stat-number">{section.stats.value}</span>
                <span className="stat-text">{section.stats.label}</span>
              </div>
            )}
            <div className="section-links">
              {section.links.map(link => (
                <Link key={link.href} href={link.href} className="section-link">
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .financial-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          padding: 1rem;
          border-radius: 0.75rem;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .section-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .section-card:hover {
          transform: translateY(-2px);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .section-icon {
          font-size: 1.5rem;
        }
        .section-header h3 {
          margin: 0;
          font-size: 1rem;
        }
        .section-description {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .section-stats {
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.5rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        .stat-number {
          display: block;
          font-size: 1.25rem;
          font-weight: bold;
        }
        .stat-text {
          font-size: 0.7rem;
          color: #6b7280;
        }
        .section-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .section-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          text-decoration: none;
          color: #374151;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .section-link:hover {
          background: #f3f4f6;
        }
        @media (max-width: 768px) {
          .financial-page { padding: 1rem; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .sections-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}