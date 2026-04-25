'use client';

import Link from 'next/link';
import Card from '../../ui/Card/Card';

const centers = [
  { href: '/jobs', icon: '📋', title: 'Job Management', desc: 'Track projects, budgets, invoicing' },
  { href: '/employees', icon: '👥', title: 'Employee Management', desc: 'Manage staff, certifications, labor' },
  { href: '/clients', icon: '🏢', title: 'Client Management', desc: 'View and manage clients' },
  { href: '/quotes', icon: '💰', title: 'Quote Management', desc: 'Create quotes, convert to jobs' },
  { href: '/reports/monthly', icon: '📊', title: 'Monthly Summary', desc: 'Labor productivity reports' }
];

export default function ManagementCenters() {
  return (
    <div>
      <h2 className="section-title">Management Centers</h2>
      <div className="management-grid">
        {centers.map((center, idx) => (
          <Link href={center.href} key={idx} className="management-link">
            <Card hover>
              <div className="management-card">
                <span className="management-icon">{center.icon}</span>
                <div className="management-info">
                  <div className="management-title">{center.title}</div>
                  <div className="management-desc">{center.desc}</div>
                </div>
                <span className="management-arrow">→</span>
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
        .management-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .management-link {
          text-decoration: none;
          color: inherit;
        }
        .management-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .management-icon {
          font-size: 1.75rem;
        }
        .management-info {
          flex: 1;
        }
        .management-title {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .management-desc {
          font-size: 0.7rem;
          color: #6b7280;
        }
        .management-arrow {
          font-size: 1.25rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}