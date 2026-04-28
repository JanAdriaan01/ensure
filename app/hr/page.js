'use client';

import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function HRPage() {
  const { data: employees, loading: employeesLoading } = useFetch('/api/employees');
  const { data: skills, loading: skillsLoading } = useFetch('/api/employees/skills');
  const { data: certifications, loading: certsLoading } = useFetch('/api/employees/certifications');
  
  const loading = employeesLoading || skillsLoading || certsLoading;

  const sections = [
    {
      title: 'Employee Management',
      icon: '👤',
      description: 'Manage employee information and records',
      links: [
        { href: '/employees', label: 'View All Employees', icon: '👥' },
        { href: '/employees/new', label: 'Create Employee', icon: '➕' },
        { href: '/employees/time', label: 'Daily Time Entry', icon: '⏰' }
      ],
      stats: { value: employees?.length || 0, label: 'Total Employees' }
    },
    {
      title: 'Payroll',
      icon: '💰',
      description: 'Process payroll and manage compensation',
      links: [
        { href: '/payroll', label: 'Payroll Dashboard', icon: '📊' },
        { href: '/payroll/process', label: 'Process Payroll', icon: '⚙️' },
        { href: '/payroll/history', label: 'Payment History', icon: '📜' }
      ]
    },
    {
      title: 'Skills Management',
      icon: '⭐',
      description: 'Manage employee skills database',
      links: [
        { href: '/employees/skills', label: 'View All Skills', icon: '⭐' },
        { href: '/employees/skills/new', label: 'Add Skill', icon: '➕' }
      ],
      stats: { value: skills?.length || 0, label: 'Total Skills' }
    },
    {
      title: 'Certifications',
      icon: '📜',
      description: 'Manage employee certifications and expiry dates',
      links: [
        { href: '/employees/certifications', label: 'View All Certifications', icon: '📜' },
        { href: '/employees/certifications/new', label: 'Add Certificate', icon: '➕' },
        { href: '/employees/certifications/expiring', label: 'Expiring Soon', icon: '⚠️' }
      ],
      stats: { value: certifications?.length || 0, label: 'Total Certifications' }
    },
    {
      title: 'Reports',
      icon: '📊',
      description: 'HR analytics and reports',
      links: [
        { href: '/reports/employee-hours', label: 'Employee Hours Report', icon: '⏰' },
        { href: '/reports/payroll', label: 'Payroll Report', icon: '💰' }
      ]
    }
  ];

  if (loading) return <LoadingSpinner text="Loading HR Module..." />;

  return (
    <div className="hr-page">
      <PageHeader 
        title="👥 Human Resources" 
        description="Manage employees, payroll, skills, and certifications"
      />
      
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{employees?.length || 0}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{skills?.length || 0}</div>
          <div className="stat-label">Skills</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{certifications?.length || 0}</div>
          <div className="stat-label">Certifications</div>
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
        .hr-page {
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
          .hr-page { padding: 1rem; }
          .stats-row { grid-template-columns: 1fr; }
          .sections-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}