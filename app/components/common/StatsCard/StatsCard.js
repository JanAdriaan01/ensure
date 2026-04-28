'use client';

import Card from '../ui/Card/Card';
import CurrencyAmount from '../CurrencyAmount';

export default function StatsCard({ title, value, icon, color = 'blue', isCurrency = false, trend }) {
  const colors = {
    blue: { bg: '#eff6ff', icon: '#2563eb' },
    green: { bg: '#d1fae5', icon: '#10b981' },
    yellow: { bg: '#fef3c7', icon: '#f59e0b' },
    red: { bg: '#fee2e2', icon: '#dc2626' },
    purple: { bg: '#f3e8ff', icon: '#9333ea' }
  };

  return (
    <Card variant="stat" hover>
      <div className="stats-card">
        <div className="stats-icon" style={{ background: colors[color].bg }}>
          <span style={{ color: colors[color].icon }}>{icon}</span>
        </div>
        <div className="stats-content">
          <div className="stats-value">
            {isCurrency ? <CurrencyAmount amount={value} /> : value}
          </div>
          <div className="stats-title">{title}</div>
          {trend && (
            <div className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .stats-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stats-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        .stats-content {
          flex: 1;
        }
        .stats-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          line-height: 1.2;
        }
        .stats-title {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .stats-trend {
          font-size: 0.7rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        .stats-trend.positive {
          color: #10b981;
        }
        .stats-trend.negative {
          color: #ef4444;
        }
      `}</style>
    </Card>
  );
}