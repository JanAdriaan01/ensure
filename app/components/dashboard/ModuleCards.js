'use client';

import Link from 'next/link';

export function ModuleCards() {
  const modules = [
    {
      title: 'Financial',
      icon: '💰',
      description: 'Manage jobs, quotes, invoicing, and reconciliation',
      href: '/financial',
      color: '#2563eb',
      features: ['Job Management', 'Quoting', 'Invoicing', 'Client Management', 'Reports'],
    },
    {
      title: 'Human Resources',
      icon: '👥',
      description: 'Manage employees, payroll, skills, and certifications',
      href: '/hr',
      color: '#10b981',
      features: ['Employee Management', 'Payroll', 'Skills', 'Certifications', 'Time Tracking'],
    },
    {
      title: 'Operations',
      icon: '⚙️',
      description: 'Manage tools, inventory, scheduling, and safety',
      href: '/operations',
      color: '#f59e0b',
      features: ['Tools Management', 'Inventory', 'Scheduling', 'OHS Compliance'],
    },
  ];

  return (
    <div className="module-cards">
      {modules.map(module => (
        <Link key={module.title} href={module.href} className="module-card">
          <div className="module-icon" style={{ color: module.color }}>{module.icon}</div>
          <h3 className="module-title">{module.title}</h3>
          <p className="module-description">{module.description}</p>
          <div className="module-features">
            {module.features.map(feature => (
              <span key={feature} className="feature-tag">{feature}</span>
            ))}
          </div>
          <div className="module-arrow">→</div>
        </Link>
      ))}
      <style jsx>{`
        .module-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin: 1.5rem 0;
        }
        .module-card {
          background: var(--bg-primary);
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-decoration: none;
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .module-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          border-color: transparent;
        }
        .module-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .module-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }
        .module-description {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          margin-bottom: 1rem;
        }
        .module-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .feature-tag {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: var(--bg-tertiary);
          border-radius: 0.25rem;
          color: var(--text-secondary);
        }
        .module-arrow {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          font-size: 1.25rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        .module-card:hover .module-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        @media (max-width: 768px) {
          .module-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}