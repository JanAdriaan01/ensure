'use client';

import PageHeader from '../PageHeader/PageHeader';
import Breadcrumb from '../../ui/Breadcrumb/Breadcrumb';

export default function ModuleLayout({ 
  title, 
  description, 
  icon,
  actions,
  breadcrumb,
  children,
  stats = [],
  className = ''
}) {
  return (
    <div className={`module-layout ${className}`}>
      <div className="module-container">
        {breadcrumb && (
          <div className="module-breadcrumb">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        
        <div className="module-header-wrapper">
          <PageHeader 
            title={title}
            description={description}
            icon={icon}
            action={actions}
          />
        </div>

        {stats.length > 0 && (
          <div className="module-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  {stat.trend && (
                    <div className={`stat-trend ${stat.trend.isPositive ? 'positive' : 'negative'}`}>
                      {stat.trend.isPositive ? '↑' : '↓'} {stat.trend.value}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="module-content">
          {children}
        </div>
      </div>

      <style jsx>{`
        .module-layout {
          min-height: 100vh;
          background: #f3f4f6;
        }
        .module-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .module-breadcrumb {
          margin-bottom: 1rem;
        }
        .module-header-wrapper {
          margin-bottom: 1.5rem;
        }
        .module-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .stat-icon {
          font-size: 2rem;
        }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 0.7rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .stat-trend {
          font-size: 0.65rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        .stat-trend.positive {
          color: #10b981;
        }
        .stat-trend.negative {
          color: #ef4444;
        }
        .module-content {
          background: transparent;
        }
        @media (max-width: 768px) {
          .module-container {
            padding: 1rem;
          }
          .module-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}