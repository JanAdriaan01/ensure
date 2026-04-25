'use client';

import Link from 'next/link';
import Card from '../../ui/Card/Card';

const actions = [
  { href: '/clients/new', icon: '🏢', title: 'Add Client', desc: 'Register new client' },
  { href: '/employees/new', icon: '👤', title: 'Add Employee', desc: 'Register team member' },
  { href: '/quotes/new', icon: '💰', title: 'Create Quote', desc: 'Generate estimate' },
  { href: '/jobs/new', icon: '📋', title: 'New Job', desc: 'Create project' },
  { href: '/employees/time', icon: '⏰', title: 'Log Time', desc: 'Record work hours' }
];

export default function QuickActionsGrid() {
  return (
    <div>
      <h2 className="section-title">Quick Actions</h2>
      <div className="action-grid">
        {actions.map((action, idx) => (
          <Link href={action.href} key={idx} className="action-link">
            <Card hover>
              <div className="action-card">
                <div className="action-icon">{action.icon}</div>
                <div className="action-title">{action.title}</div>
                <div className="action-desc">{action.desc}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <style jsx>{`
        .section-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #374151;
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }
        .action-link {
          text-decoration: none;
          color: inherit;
        }
        .action-card {
          text-align: center;
        }
        .action-icon {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .action-title {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .action-desc {
          font-size: 0.7rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}