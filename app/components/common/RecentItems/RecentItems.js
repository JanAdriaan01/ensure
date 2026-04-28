'use client';

import Link from 'next/link';
import Card from '@/app/components/ui/Card/Card';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge';

export default function RecentItems({ items, type, title, limit = 5 }) {
  const getItemLink = (item) => {
    switch (type) {
      case 'jobs':
        return `/jobs/${item.id}`;
      case 'quotes':
        return `/quotes/${item.id}`;
      case 'employees':
        return `/employees/${item.id}`;
      case 'clients':
        return `/clients/${item.id}`;
      case 'invoices':
        return `/invoicing/${item.id}`;
      case 'tools':
        return `/tools/${item.id}`;
      default:
        return '#';
    }
  };

  const getItemDisplay = (item) => {
    switch (type) {
      case 'jobs':
        return {
          primary: item.lc_number,
          secondary: item.client_name,
          value: `${Math.round(item.total_hours || 0)} hrs`,
          status: item.completion_status,
        };
      case 'quotes':
        return {
          primary: item.quote_number,
          secondary: item.client_name,
          value: <CurrencyAmount amount={item.total_amount || 0} />,
          status: item.status,
        };
      case 'employees':
        return {
          primary: `${item.name} ${item.surname}`,
          secondary: item.employee_number,
          value: `${Math.round(item.total_hours_worked || 0)} hrs`,
          status: item.employment_status,
        };
      case 'clients':
        return {
          primary: item.client_name,
          secondary: item.contact_person || 'No contact',
          value: `${item.job_count || 0} jobs`,
          status: null,
        };
      case 'invoices':
        return {
          primary: item.invoice_number,
          secondary: item.client_name,
          value: <CurrencyAmount amount={item.total_amount || 0} />,
          status: item.status,
        };
      case 'tools':
        return {
          primary: item.tool_name,
          secondary: item.tool_code,
          value: item.status === 'checked_out' ? 'Checked Out' : 'Available',
          status: item.status,
        };
      default:
        return {
          primary: item.name || item.id,
          secondary: '',
          value: '',
          status: null,
        };
    }
  };

  const displayItems = Array.isArray(items) ? items.slice(0, limit) : [];

  if (displayItems.length === 0) {
    return (
      <Card>
        <div className="recent-header">
          <h3>{title}</h3>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No {type} found</p>
        </div>
        <style jsx>{`
          .recent-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-light);
          }
          .recent-header h3 {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 600;
          }
          .empty-state {
            text-align: center;
            padding: 1.5rem;
            color: var(--text-tertiary);
          }
          .empty-icon {
            font-size: 2rem;
            display: block;
            margin-bottom: 0.5rem;
          }
          .empty-state p {
            margin: 0;
            font-size: 0.875rem;
          }
        `}</style>
      </Card>
    );
  }

  return (
    <Card>
      <div className="recent-header">
        <h3>{title}</h3>
        <Link href={`/${type}`} className="view-all">
          View All →
        </Link>
      </div>
      <div className="recent-list">
        {displayItems.map((item) => {
          const display = getItemDisplay(item);
          return (
            <Link key={item.id} href={getItemLink(item)} className="recent-item">
              <div className="recent-info">
                <div className="recent-title">{display.primary}</div>
                {display.secondary && (
                  <div className="recent-meta">{display.secondary}</div>
                )}
              </div>
              <div className="recent-right">
                {display.status && (
                  <div className="recent-status">
                    <StatusBadge status={display.status} size="sm" />
                  </div>
                )}
                <div className="recent-value">{display.value}</div>
              </div>
            </Link>
          );
        })}
      </div>
      {displayItems.length > 0 && (
        <div className="recent-footer">
          <Link href={`/${type}`} className="view-all-link">
            View all {type} →
          </Link>
        </div>
      )}
      <style jsx>{`
        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .recent-header h3 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .view-all {
          font-size: 0.7rem;
          color: #2563eb;
          text-decoration: none;
        }
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 400px;
          overflow-y: auto;
        }
        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          text-decoration: none;
          color: inherit;
          border-radius: 0.5rem;
          transition: background 0.2s;
          gap: 1rem;
        }
        .recent-item:hover {
          background: var(--bg-tertiary);
        }
        .recent-info {
          flex: 1;
          min-width: 0;
        }
        .recent-title {
          font-weight: 500;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .recent-meta {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-top: 0.15rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .recent-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .recent-status {
          min-width: 60px;
        }
        .recent-value {
          font-weight: 600;
          color: #2563eb;
          font-size: 0.875rem;
          white-space: nowrap;
        }
        .recent-footer {
          margin-top: 0.75rem;
          padding-top: 0.5rem;
          text-align: center;
          border-top: 1px solid var(--border-light);
        }
        .view-all-link {
          font-size: 0.75rem;
          color: #2563eb;
          text-decoration: none;
        }
        .view-all-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 640px) {
          .recent-item {
            flex-wrap: wrap;
          }
          .recent-right {
            width: 100%;
            justify-content: space-between;
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </Card>
  );
}