// app/financial/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function FinancialPage() {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Period filter states
  const [period, setPeriod] = useState('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFinancialData();
    }
  }, [isAuthenticated, token, period, customStartDate, customEndDate]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/financial?period=' + period;
      if (period === 'custom' && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch financial data');
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError(error.message);
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

  const getMaxAmount = () => {
    if (!data?.monthlyRevenue || data.monthlyRevenue.length === 0) return 1;
    const amounts = data.monthlyRevenue.map(m => m.amount);
    return Math.max(...amounts, 1);
  };

  const maxAmount = getMaxAmount();

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

  if (error) {
    return (
      <div className="error-container">
        <h2>Unable to load financial data</h2>
        <p>{error}</p>
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

  if (!data) {
    return (
      <div className="error-container">
        <h2>No financial data available</h2>
        <p>Please check back later.</p>
        <style jsx>{`
          .error-container { text-align: center; padding: 4rem; }
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
      </div>

      {/* Period Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <span className="filter-label">📅 Period Filter</span>
        </div>
        <div className="period-selector">
          <button 
            className={`period-btn ${period === 'current' ? 'active' : ''}`}
            onClick={() => { setPeriod('current'); setShowCustomDate(false); }}
          >
            Current Financial Year
          </button>
          <button 
            className={`period-btn ${period === 'previous' ? 'active' : ''}`}
            onClick={() => { setPeriod('previous'); setShowCustomDate(false); }}
          >
            Previous Financial Year
          </button>
          <button 
            className={`period-btn ${period === 'custom' ? 'active' : ''}`}
            onClick={() => { setPeriod('custom'); setShowCustomDate(true); }}
          >
            Custom Range
          </button>
        </div>
        
        {showCustomDate && (
          <div className="custom-date-range">
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <span>→</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              placeholder="End Date"
            />
            <button onClick={fetchFinancialData} className="apply-btn">Apply</button>
          </div>
        )}
        
        {data?.comparison && period === 'current' && (
          <div className="comparison-badge">
            <span className="comparison-label">vs {data.comparison.period}:</span>
            <span className={data.comparison.percentageChange >= 0 ? 'positive' : 'negative'}>
              {data.comparison.percentageChange >= 0 ? '+' : ''}{data.comparison.percentageChange.toFixed(1)}%
            </span>
          </div>
        )}
        
        {data?.period && (
          <div className="period-info">
            📊 Showing data for: <strong>{data.period.label}</strong>
            <span className="period-dates">({data.period.startDate} to {data.period.endDate})</span>
          </div>
        )}
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
            <div className="stat-trend">
              {data.overview?.totalRevenue ? Math.round((data.overview?.totalInvoiced / data.overview?.totalRevenue) * 100) : 0}% of total revenue
            </div>
          </div>
        </div>
        <div className="stat-card paid">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Total Paid</div>
            <div className="stat-value">{formatCurrency(data.overview?.totalPaid)}</div>
            <div className="stat-trend">
              {data.overview?.totalInvoiced ? Math.round((data.overview?.totalPaid / data.overview?.totalInvoiced) * 100) : 0}% collection rate
            </div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending Payment</div>
            <div className="stat-value">{formatCurrency(data.overview?.pendingAmount)}</div>
            <div className="stat-trend">{data.invoices?.pendingCount || 0} invoices pending</div>
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

      {/* Secondary Stats */}
      <div className="secondary-stats">
        <div className="stat-card-small">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{data.jobs?.active || 0}</div>
          <Link href="/jobs" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Completed Jobs</div>
          <div className="stat-value">{data.jobs?.completed || 0}</div>
          <Link href="/jobs?status=completed" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{data.quotes?.pending || 0}</div>
          <Link href="/quotes?status=pending" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Accepted Quotes</div>
          <div className="stat-value">{data.quotes?.accepted || 0}</div>
          <div className="stat-subvalue">{formatCurrency(data.quotes?.acceptedValue)}</div>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{data.clients?.total || 0}</div>
          <Link href="/clients" className="stat-link">View All →</Link>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">Active Clients</div>
          <div className="stat-value">{data.clients?.active || 0}</div>
        </div>
      </div>

      {/* Monthly Revenue Chart - FIXED LAYOUT */}
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
            {data.monthlyRevenue?.map((item, index) => {
              const barHeight = maxAmount > 0 ? (item.amount / maxAmount) * 180 : 0;
              return (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${Math.min(180, barHeight)}px` }}
                    >
                      <span className="chart-bar-value">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                  <div className="chart-bar-label">{item.month}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-total">
          <span>Total Revenue for Period: {formatCurrency(data.monthlyRevenue?.reduce((sum, m) => sum + m.amount, 0))}</span>
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
            <div className="invoice-stat-value">{data.invoices?.paidCount || 0}</div>
            <div className="invoice-stat-label">Paid Invoices</div>
            <div className="invoice-stat-amount">{formatCurrency(data.invoices?.paid)}</div>
          </div>
          <div className="invoice-stat">
            <div className="invoice-stat-value">{data.invoices?.pendingCount || 0}</div>
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

      {/* Recent Invoices */}
      <div className="card">
        <div className="section-header">
          <h2>Recent Invoices</h2>
          <Link href="/invoicing" className="view-all">View All Invoices →</Link>
        </div>
        <div className="table-container">
          {data.recentInvoices?.length === 0 ? (
            <div className="empty-state">
              <p>No invoices found for this period</p>
            </div>
          ) : (
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices?.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="invoice-link">
                      <Link href={`/invoicing/${invoice.id}`}>
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="client-name">{invoice.client_name || 'Unknown Client'}</td>
                    <td className="date">{invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '-'}</td>
                    <td className="amount">{formatCurrency(invoice.total_amount)}</td>
                    <td>
                      <span className={`status-badge ${invoice.status}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/invoicing/${invoice.id}`} className="view-link">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/invoicing/new" className="action-btn primary">+ New Invoice</Link>
        <Link href="/jobs/new" className="action-btn secondary">+ New Job</Link>
        <Link href="/quotes/new" className="action-btn secondary">+ New Quote</Link>
      </div>

      <style jsx>{`
        .financial-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
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

        /* Filter Section */
        .filter-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }

        .filter-header {
          margin-bottom: 0.75rem;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .period-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .period-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .period-btn:hover {
          background: #f1f5f9;
        }

        .period-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .custom-date-range {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .custom-date-range input {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .apply-btn {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .comparison-badge {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comparison-label {
          color: #64748b;
        }

        .comparison-badge .positive {
          color: #10b981;
          font-weight: 600;
        }

        .comparison-badge .negative {
          color: #ef4444;
          font-weight: 600;
        }

        .period-info {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .period-dates {
          margin-left: 0.5rem;
          color: #94a3b8;
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
          justify-content: center;
          gap: 1.5rem;
          min-width: 500px;
          padding: 0.5rem 0;
        }

        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .chart-bar-wrapper {
          width: 100%;
          max-width: 80px;
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .chart-bar {
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 0.5rem 0.5rem 0 0;
          position: relative;
          transition: height 0.3s ease;
          min-height: 4px;
          cursor: pointer;
        }

        .chart-bar:hover {
          background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
        }

        .chart-bar-value {
          position: absolute;
          top: -28px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          white-space: nowrap;
          color: #1e293b;
          font-weight: 500;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .chart-bar-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-align: center;
        }

        .chart-total {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 500;
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

        /* Table */
        .table-container {
          overflow-x: auto;
        }

        .invoices-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoices-table th {
          text-align: left;
          padding: 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .invoices-table td {
          padding: 0.75rem;
          font-size: 0.875rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .invoice-link a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .client-name {
          color: #1e293b;
        }

        .date {
          color: #64748b;
        }

        .amount {
          font-weight: 600;
          color: #1e293b;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.paid {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.overdue {
          background: #fee2e2;
          color: #dc2626;
        }

        .view-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.75rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
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
          .chart-bars {
            gap: 0.75rem;
          }
          .chart-bar-wrapper {
            max-width: 50px;
          }
          .chart-bar-value {
            font-size: 0.6rem;
            top: -22px;
          }
        }
      `}</style>
    </div>
  );
}