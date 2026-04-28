'use client';

import Link from 'next/link';

export default function PageHeader({ 
  title, 
  description, 
  icon, 
  action, 
  breadcrumb,
  backUrl,
  onBack,
  className = '' 
}) {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-left">
        {backUrl || onBack ? (
          <button 
            className="back-button"
            onClick={onBack ? onBack : () => window.location.href = backUrl}
            aria-label="Go back"
          >
            ←
          </button>
        ) : null}
        {icon && <span className="page-header-icon">{icon}</span>}
        <div className="page-header-info">
          {breadcrumb && (
            <div className="page-breadcrumb">
              {breadcrumb.map((item, index) => (
                <span key={index} className="breadcrumb-item">
                  {item.href ? (
                    <Link href={item.href} className="breadcrumb-link">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="breadcrumb-current">{item.label}</span>
                  )}
                  {index < breadcrumb.length - 1 && (
                    <span className="breadcrumb-separator">/</span>
                  )}
                </span>
              ))}
            </div>
          )}
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
          gap: 1rem;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          background: transparent;
          border: 1px solid var(--border-light);
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-secondary);
        }
        
        .back-button:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-medium);
        }
        
        .page-header-icon {
          font-size: 2rem;
        }
        
        .page-header-info {
          flex: 1;
        }
        
        .page-header-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.3;
        }
        
        .page-header-description {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          margin: 0.25rem 0 0 0;
        }
        
        .page-breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
        }
        
        .breadcrumb-item {
          display: inline-flex;
          align-items: center;
        }
        
        .breadcrumb-link {
          color: var(--text-tertiary);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .breadcrumb-link:hover {
          color: var(--primary);
          text-decoration: underline;
        }
        
        .breadcrumb-current {
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .breadcrumb-separator {
          margin: 0 0.5rem;
          color: var(--text-quaternary);
        }
        
        .page-header-action {
          flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .page-header-left {
            flex-wrap: wrap;
          }
          
          .page-header-action {
            width: 100%;
          }
          
          .page-header-action :global(> *) {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}