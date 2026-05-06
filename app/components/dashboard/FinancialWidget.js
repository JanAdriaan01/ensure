// app/components/FinancialWidget.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export function FinancialWidget() {
  const { token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingQuotes: 0,
    totalInvoiced: 0,
    poAmount: 0,
    thisMonthRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchStats();
    }
  }, [isAuthenticated, token]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/financial', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setStats({
          activeJobs: result.data.jobs?.active || 0,
          pendingQuotes: result.data.quotes?.pending || 0,
          totalInvoiced: result.data.overview?.totalInvoiced || 0,
          poAmount: result.data.overview?.totalRevenue || 0,
          thisMonthRevenue: result.data.monthlyRevenue?.[result.data.monthlyRevenue.length - 1]?.amount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching financial stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="financial-widget loading">
        <div className="loading-spinner-small"></div>
        <style jsx>{`
          .financial-widget.loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 150px;
          }
          .loading-spinner-small {
            width: 24px;
            height: 24px;
            border: 2px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="financial-widget">
      <div className="widget-header">
        <span className="widget-icon">💰</span>
        <h3>Financial Overview</h3>
        <Link href="/financial" className="widget-link">View Details →</Link>
      </div>
      <div className="widget-stats">
        <div className="stat">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{stats.activeJobs}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{stats.pendingQuotes}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value">{formatCurrency(stats.totalInvoiced)}</div>
        </div>
      </div>
      <div className="widget-footer">
        <div className="stat">
          <div className="stat-label">PO Amount</div>
          <div className="stat-value">{formatCurrency(stats.poAmount)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{formatCurrency(stats.thisMonthRevenue)}</div>
        </div>
      </div>

      <style jsx>{`
        .financial-widget {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        .widget-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .widget-icon {
          font-size: 1.25rem;
        }
        .widget-header h3 {
          margin: 0;
          font-size: 0.9rem;
          flex: 1;
          color: var(--text-primary);
        }
        .widget-link {
          font-size: 0.7rem;
          color: var(--primary);
          text-decoration: none;
        }
        .widget-stats {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .stat {
          flex: 1;
          text-align: center;
        }
        .stat-label {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .widget-footer {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
        }
      `}</style>
    </div>
  );
}