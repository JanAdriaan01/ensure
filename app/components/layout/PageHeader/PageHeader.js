'use client';

export default function PageHeader({ title, description, action, date }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="page-header-right">
        {date && <div className="header-date">{date}</div>}
        {action && <div className="header-action">{action}</div>}
      </div>
      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-header h1 {
          font-size: 2rem;
          margin: 0 0 0.25rem 0;
          color: #111827;
        }
        .page-header p {
          color: #6b7280;
          margin: 0;
        }
        .page-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-date {
          background: #f3f4f6;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}