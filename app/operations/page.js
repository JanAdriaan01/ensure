'use client'

'use client';

import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function OperationsPage() {
  const { data: tools, loading: toolsLoading } = useFetch('/api/tools');
  const { data: stock, loading: stockLoading } = useFetch('/api/stock');
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  
  const loading = toolsLoading || stockLoading || jobsLoading;

  const sections = [
    {
      title: 'Tools Management',
      icon: '🔧',
      description: 'Manage tools, checkouts, and returns',
      links: [
        { href: '/tools', label: 'View All Tools', icon: '🔧' },
        { href: '/tools/new', label: 'Add New Tool', icon: '➕' },
        { href: '/tools/checkout', label: 'Tool Checkout', icon: '📋' },
        { href: '/tools/returns', label: 'Tool Returns', icon: '🔄' }
      ],
      stats: { value: tools?.length || 0, label: 'Total Tools' }
    },
    {
      title: 'Inventory Management',
      icon: '📦',
      description: 'Manage stock, purchasing, and materials',
      links: [
        { href: '/inventory', label: 'Inventory Dashboard', icon: '📊' },
        { href: '/stock/purchasing', label: 'Purchasing', icon: '🛒' },
        { href: '/stock/issued', label: 'Issued to Jobs', icon: '📤' },
        { href: '/stock/receiving', label: 'Receive Stock', icon: '📥' }
      ],
      stats: { value: stock?.length || 0, label: 'Stock Items' }
    },
    {
      title: 'Scheduling',
      icon: '📅',
      description: 'Schedule work orders and assign teams',
      links: [
        { href: '/schedule', label: 'Work Orders', icon: '📋' },
        { href: '/schedule/calendar', label: 'Calendar View', icon: '📅' },
        { href: '/teams', label: 'Team Management', icon: '👥' },
        { href: '/schedule/assignments', label: 'Assign Teams', icon: '✏️' }
      ],
      stats: { value: jobs?.filter(j => j.completion_status === 'in_progress').length || 0, label: 'Active Jobs' }
    },
    {
      title: 'OHS Compliance',
      icon: '🛡️',
      description: 'Occupational Health and Safety management',
      links: [
        { href: '/ohs', label: 'OHS Dashboard', icon: '📊' },
        { href: '/ohs/incidents', label: 'Incident Reporting', icon: '⚠️' },
        { href: '/ohs/training', label: 'Safety Training', icon: '📚' },
        { href: '/ohs/audits', label: 'Compliance Audits', icon: '✅' }
      ]
    }
  ];

  if (loading) return <LoadingSpinner text="Loading Operations Module..." />;

  return (
    <div className="operations-page">
      <PageHeader 
        title="⚙️ Operations" 
        description="Manage tools, inventory, scheduling, and safety compliance"
      />
      
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{tools?.length || 0}</div>
          <div className="stat-label">Tools</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stock?.length || 0}</div>
          <div className="stat-label">Stock Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{jobs?.filter(j => j.completion_status === 'in_progress').length || 0}</div>
          <div className="stat-label">Active Jobs</div>
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
        .operations-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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
          .operations-page { padding: 1rem; }
          .stats-row { grid-template-columns: 1fr; }
          .sections-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
