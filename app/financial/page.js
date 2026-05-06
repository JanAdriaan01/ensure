// app/financial/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function FinancialPage() {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFinancialData();
    }
  }, [isAuthenticated, token]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/financial', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch financial data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading financial data...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
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

  if (!data) {
    return (
      <div className="error-container">
        <h2>Unable to load financial data</h2>
        <p>Please try again later.</p>
        <button onClick={fetchFinancialData} className="retry-btn">Retry</button>
        <style jsx>{`
          .error-container { text-align: center; padding: 4rem; }
          .retry-btn {
            background: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="financial-container">
      <div className="page-header">
        <div>
          <h1>Financial Dashboard</h1>
          <p>Real-time financial overview and analytics</p>
        </div>
        <div className="date-range">
          <span className="date-badge">Year to Date</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue (PO Value)</div>
            <div className="stat-value">{formatCurrency(data.overview?.totalRevenue)}</div>
            <div className="stat-trend">Total active contracts</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-label">Total Invoiced</div>
            <div className="stat-value">{formatCurrency(data.overview?.totalInvoiced)}</div>
            <div className="stat-trend">{Math.round((data.overview?.totalInvoiced / data.overview?.totalRevenue) * 100)}% of total revenue</div>
          </div>
        </div>
        <div className="stat-card paid">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Total Paid</div>
            <div className="stat-value">{formatCurrency(data.overview?.totalPaid)}</div>
            <div className="stat-trend">{Math.round((data.overview?.totalPaid / data.overview?.totalInvoiced) * 100)}% collection rate</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending Payment</div>
            <div className="stat-value">{formatCurrency(data.overview?.pendingAmount)}</div>
            <div className="stat-trend">{data.invoices?.pendingCount} invoices pending</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">Overdue</div>
            <div className="stat-value">{formatCurrency(data.overview?.overdueAmount)}</div>
            <div className="stat-trend">Action required</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Net Profit (est.)</div>
            <div className="stat-value">{formatCurrency(data.overview?.netProfit)}</div>
            <div className="stat-trend">Based on 30% margin</div>
          </div>
        </div>
      </div>

      {/* Secondary Stats - Jobs, Quotes, Clients */}
      <div className="secondary-stats">
        <div className="stat-card-small">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{data.jobs?.active}</div>
          <Link href="/jobs" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Completed Jobs</div>
          <div className="stat-value">{data.jobs?.completed}</div>
          <Link href="/jobs?status=completed" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{data.quotes?.pending}</div>
          <Link href="/quotes?status=pending" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Accepted Quotes</div>
          <div className="stat-value">{data.quotes?.accepted}</div>
          <div className="stat-subvalue">{formatCurrency(data.quotes?.acceptedValue)}</div>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{data.clients?.total}</div>
          <Link href="/clients" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Active Clients</div>
          <div className="stat-value">{data.clients?.active}</div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="card">
        <div className="section-header">
          <h2>Monthly Revenue</h2>
          <div className="chart-legend">
            <span className="legend-dot"></span>
            <span>Paid Invoices</span>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-bars">
            {data.monthlyRevenue?.map((item, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar-label">{item.month}</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ height: `${Math.min(100, (item.amount / (Math.max(...data.monthlyRevenue.map(m => m.amount)) || 1)) * 100}%` }}
                  >
                    <span className="chart-bar-value">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-total">
          <span>Total Revenue YTD: {formatCurrency(data.monthlyRevenue?.reduce((sum, m) => sum + m.amount, 0))}</span>
        </div>
      </div>

      {/* Invoices Overview */}
      <div className="card">
        <div className="section-header">
          <h2>Invoices Overview</h2>
          <Link href="/invoicing" className="view-all">View All Invoices →</Link>
        </div>
        <div className="invoice-stats">
          <div className="invoice-stat">
            <div className="invoice-stat-value">{data.invoices?.paidCount}</div>
            <div className="invoice-stat-label">Paid Invoices</div>
            <div className="invoice-stat-amount">{formatCurrency(data.invoices?.paid)}</div>
          </div>
          <div className="invoice-stat">
            <div className="invoice-stat-value">{data.invoices?.pendingCount}</div>
            <div className="invoice-stat-label">Pending Invoices</div>
            <div className="invoice-stat-amount">{formatCurrency(data.invoices?.pending)}</div>
          </div>
          <div className="invoice-stat">
            <div className="invoice-stat-value">{data.invoices?.overdueCount || 0}</div>
            <div className="invoice-stat-label">Overdue Invoices</div>
            <div className="invoice-stat-amount overdue">{formatCurrency(data.invoices?.overdue)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/invoicing/new" className="action-btn primary">+ New Invoice</Link>
        <Link href="/jobs/new" className="action-btn secondary">+ New Job</Link>
        <Link href="/quotes/new" className="action-btn secondary">+ New Quote</Link>
        <Link href="/reports/financial" className="action-btn outline">📊 Generate Report</Link>
      </div>

      <style jsx>{`
        .financial-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .page-header p {
          color: #64748b;
          margin: 0;
        }

        .date-badge {
          background: #e2e8f0;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: #475569;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-card.primary { border-left: 4px solid #3b82f6; }
        .stat-card.success { border-left: 4px solid #10b981; }
        .stat-card.paid { border-left: 4px solid #10b981; }
        .stat-card.warning { border-left: 4px solid #f59e0b; }
        .stat-card.danger { border-left: 4px solid #ef4444; }
        .stat-card.info { border-left: 4px solid #8b5cf6; }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-trend {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        /* Secondary Stats */
        .secondary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card-small {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }

        .stat-card-small .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.25rem 0;
        }

        .stat-link {
          display: inline-block;
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: #3b82f6;
          text-decoration: none;
        }

        .stat-subvalue {
          font-size: 0.7rem;
          color: #10b981;
          margin-top: 0.25rem;
        }

        /* Chart */
        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-header h2 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .view-all {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .chart-container {
          overflow-x: auto;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
          justify-content: center;
          min-height: 280px;
          min-width: 500px;
        }

        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .chart-bar-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .chart-bar-wrapper {
          width: 100%;
          max-width: 60px;
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .chart-bar {
          background: #3b82f6;
          border-radius: 0.375rem;
          position: relative;
          transition: height 0.3s ease;
          min-height: 4px;
        }

        .chart-bar-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          white-space: nowrap;
          color: #3b82f6;
        }

        .chart-total {
          text-align: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Invoice Stats */
        .invoice-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          text-align: center;
        }

        .invoice-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .invoice-stat-label {
          font-size: 0.7rem;
          color: #64748b;
          margin: 0.25rem 0;
        }

        .invoice-stat-amount {
          font-size: 0.875rem;
          font-weight: 500;
          color: #10b981;
        }

        .invoice-stat-amount.overdue {
          color: #ef4444;
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover {
          background: #2563eb;
        }

        .action-btn.secondary {
          background: #f1f5f9;
          color: #1e293b;
        }

        .action-btn.secondary:hover {
          background: #e2e8f0;
        }

        .action-btn.outline {
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
        }

        .action-btn.outline:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        @media (max-width: 768px) {
          .financial-container {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .secondary-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .invoice-stats {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}