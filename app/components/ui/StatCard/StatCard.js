'use client';

import Card from '../Card/Card';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function StatCard({ icon, title, value, subValue, valueIsCurrency = false, trend = null }) {
  return (
    <Card variant="stat" hover>
      <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
          <div className="stat-value">
            {valueIsCurrency ? <CurrencyAmount amount={value} /> : value}
          </div>
          <div className="stat-label">{title}</div>
          {subValue && <div className="stat-sub">{subValue}</div>}
          {trend && (
            <div className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-icon {
          font-size: 2rem;
        }
        .stat-info {
          flex: 1;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .stat-sub {
          font-size: 0.7rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
        .stat-trend {
          font-size: 0.7rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        .stat-trend.positive {
          color: #10b981;
        }
        .stat-trend.negative {
          color: #ef4444;
        }
      `}</style>
    </Card>
  );
}