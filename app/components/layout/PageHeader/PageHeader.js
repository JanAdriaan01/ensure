'use client';

export default function PageHeader({ title, description, icon, action, breadcrumb }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        {icon && <span className="page-header-icon">{icon}</span>}
        <div>
          {breadcrumb && <div className="page-breadcrumb">{breadcrumb}</div>}
          <h1 className="page-header-title">{title}</h1>
          {description && <p className="page-header-description">{description}</p>}
        </div>
      </div>
      {action && <div className="page-header-action">{action}</div>}
      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .page-header-icon {
          font-size: 2rem;
        }
        .page-header-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }
        .page-header-description {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          margin: 0.25rem 0 0 0;
        }
        .page-breadcrumb {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 0.25rem;
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}