'use client';

import Link from 'next/link';
import Card from '../../ui/Card/Card';
import CurrencyAmount from '../../CurrencyAmount';

export default function RecentActivityList({ title, viewAllLink, items, type }) {
  const getValueDisplay = (item) => {
    if (type === 'jobs') {
      return <CurrencyAmount amount={item.total_invoiced || 0} />;
    }
    if (type === 'employees') {
      return `${Math.round(item.total_hours_worked || 0)} hrs`;
    }
    if (type === 'quotes') {
      return <CurrencyAmount amount={item.quote_amount || 0} />;
    }
    return null;
  };

  const getMetaDisplay = (item) => {
    if (type === 'jobs') {
      return item.completion_status?.replace('_', ' ');
    }
    if (type === 'employees') {
      return item.employee_number;
    }
    if (type === 'quotes') {
      return item.client_name || 'No client';
    }
    return null;
  };

  const getTitleDisplay = (item) => {
    if (type === 'jobs') return item.lc_number;
    if (type === 'employees') return `${item.name} ${item.surname}`;
    if (type === 'quotes') return item.quote_number;
    return null;
  };

  const getLink = (item) => {
    if (type === 'jobs') return `/jobs/${item.id}`;
    if (type === 'employees') return `/employees/${item.id}`;
    if (type === 'quotes') return `/quotes/${item.id}`;
    return '#';
  };

  return (
    <Card>
      <div className="recent-header">
        <h3>{title}</h3>
        <Link href={viewAllLink} className="view-all">View All →</Link>
      </div>
      <div className="recent-list">
        {items.length === 0 ? (
          <div className="empty-state">No items yet</div>
        ) : (
          items.map((item, idx) => (
            <Link href={getLink(item)} key={idx} className="recent-item">
              <div>
                <div className="recent-title">{getTitleDisplay(item)}</div>
                <div className="recent-meta">{getMetaDisplay(item)}</div>
              </div>
              <div className="recent-value">{getValueDisplay(item)}</div>
            </Link>
          ))
        )}
      </div>
      <style jsx>{`
        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .recent-header h3 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .view-all {
          font-size: 0.7rem;
          color: #2563eb;
          text-decoration: none;
        }
        .view-all:hover {
          text-decoration: underline;
        }
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          text-decoration: none;
          color: inherit;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        .recent-item:hover {
          background: #f9fafb;
        }
        .recent-title {
          font-weight: 500;
          font-size: 0.875rem;
        }
        .recent-meta {
          font-size: 0.7rem;
          color: #6b7280;
          margin-top: 0.15rem;
        }
        .recent-value {
          font-weight: 600;
          color: #2563eb;
          font-size: 0.875rem;
        }
        .empty-state {
          text-align: center;
          padding: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>
    </Card>
  );
}