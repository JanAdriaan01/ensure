// app/reconciliation/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function ReconciliationPage() {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchReconciliationData();
    }
  }, [isAuthenticated, token, period]);

  const fetchReconciliationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reconciliation?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load reconciliation data');
      }
    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
      setError('Failed to load data');
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

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const getVarianceColor = (amount) => {
    if (amount > 0) return '#10b981';
    if (amount < 0) return '#ef4444';
    return '#64748b';
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-draft';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reconciliation data...</p>
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
            border-top-color: #22c55e;
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

  if (error || !data) {
    return (
      <div className="error-container">
        <h2>Unable to load reconciliation data</h2>
        <p>{error || 'No data available'}</p>
        <button onClick={fetchReconciliationData} className="retry-btn">Retry</button>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 4rem;
          }
          .retry-btn {
            background: #22c55e;
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

  const { summary, monthly, recent } = data;

  return (
    <div className="reconciliation-container">
      <div className="page-header">
        <div>
          <h1>Reconciliation Dashboard</h1>
          <p>Compare invoices, payments, and financial performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-title">Total Invoiced</div>
          <div className="card-value">{formatCurrency(summary.total_invoiced)}</div>
          <div className="card-sub">{summary.invoice_count} invoices</div>
        </div>
        <div className="summary-card success">
          <div className="card-title">Total Paid</div>
          <div className="card-value">{formatCurrency(summary.total_paid)}</div>
          <div className="card-sub">{summary.paid_count} paid</div>
        </div>
        <div className="summary-card warning">
          <div className="card-title">Pending Payment</div>
          <div className="card-value">{formatCurrency(summary.total_pending)}</div>
          <div className="card-sub">{summary.pending_count} pending</div>
        </div>
        <div className="summary-card danger">
          <div className="card-title">Overdue</div>
          <div className="card-value">{formatCurrency(summary.total_overdue)}</div>
          <div className="card-sub">{summary.overdue_count} overdue</div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="comparison-grid">
        <div className="comparison-card">
          <h3>Quotes vs Jobs</h3>
          <div className="comparison-item">
            <span>Total Quotes Value</span>
            <span>{formatCurrency(summary.total_quote_value)}</span>
          </div>
          <div className="comparison-item">
            <span>Total Jobs (PO) Value</span>
            <span>{formatCurrency(summary.total_po_value)}</span>
          </div>
          <div className="comparison-item variance">
            <span>Variance</span>
            <span style={{ color: getVarianceColor(summary.variance.quotes_vs_jobs) }}>
              {formatCurrency(summary.variance.quotes_vs_jobs)}
            </span>
          </div>
          <div className="comparison-note">
            {summary.variance.quotes_vs_jobs > 0 ? 'Quotes exceed jobs value' : 
             summary.variance.quotes_vs_jobs < 0 ? 'Jobs exceed quotes value' : 'Balanced'}
          </div>
        </div>

        <div className="comparison-card">
          <h3>Invoiced vs PO Value</h3>
          <div className="comparison-item">
            <span>Total Invoiced</span>
            <span>{formatCurrency(summary.total_invoiced)}</span>
          </div>
          <div className="comparison-item">
            <span>Total PO Value (Jobs)</span>
            <span>{formatCurrency(summary.total_po_value)}</span>
          </div>
          <div className="comparison-item variance">
            <span>Variance</span>
            <span style={{ color: getVarianceColor(summary.variance.invoiced_vs_po) }}>
              {formatCurrency(summary.variance.invoiced_vs_po)}
            </span>
          </div>
          <div className="comparison-note">
            {summary.variance.invoiced_vs_po > 0 ? 'Over-invoiced vs PO' : 
             summary.variance.invoiced_vs_po < 0 ? 'Under-invoiced vs PO' : 'Matched PO value'}
          </div>
        </div>

        <div className="comparison-card">
          <h3>Paid vs Invoiced</h3>
          <div className="comparison-item">
            <span>Total Invoiced</span>
            <span>{formatCurrency(summary.total_invoiced)}</span>
          </div>
          <div className="comparison-item">
            <span>Total Paid</span>
            <span>{formatCurrency(summary.total_paid)}</span>
          </div>
          <div className="comparison-item variance">
            <span>Outstanding</span>
            <span style={{ color: getVarianceColor(summary.total_pending) }}>
              {formatCurrency(summary.total_pending)}
            </span>
          </div>
          <div className="comparison-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(summary.total_paid / summary.total_invoiced) * 100}%` }}
              ></div>
            </div>
            <div className="progress-label">
              {Math.round((summary.total_paid / summary.total_invoiced) * 100)}% Collection Rate
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Reconciliation Table */}
      <div className="card">
        <div className="card-header">
          <h3>Monthly Reconciliation</h3>
        </div>
        <div className="table-container">
          {monthly.length === 0 ? (
            <div className="empty-state">No monthly data available</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Paid Amount</th>
                  <th>Pending Amount</th>
                  <th>Paid Invoices</th>
                  <th>Pending Invoices</th>
                  <th>Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((item, index) => {
                  const total = item.paid_amount + item.pending_amount;
                  const collectionRate = total > 0 ? (item.paid_amount / total) * 100 : 0;
                  return (
                    <tr key={index}>
                      <td className="month">{item.month}</td>
                      <td className="paid">{formatCurrency(item.paid_amount)}</td>
                      <td className="pending">{formatCurrency(item.pending_amount)}</td>
                      <td>{item.paid_count}</td>
                      <td>{item.pending_count}</td>
                      <td>
                        <div className="rate-cell">
                          <div className="mini-progress">
                            <div 
                              className="mini-progress-fill" 
                              style={{ width: `${collectionRate}%`, backgroundColor: collectionRate > 80 ? '#10b981' : collectionRate > 50 ? '#f59e0b' : '#ef4444' }}
                            ></div>
                          </div>
                          <span>{Math.round(collectionRate)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Transactions</h3>
        </div>
        <div className="table-container">
          {recent.length === 0 ? (
            <div className="empty-state">No recent transactions</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`type-badge type-${item.type}`}>
                        {item.type === 'invoice' ? '💰 Invoice' : 
                         item.type === 'job' ? '🔨 Job' : '📋 Quote'}
                      </span>
                    </td>
                    <td className="reference">
                      <Link href={`/${item.type}s/${item.id}`} className="reference-link">
                        {item.reference}
                      </Link>
                    </td>
                    <td>{item.client_name || '-'}</td>
                    <td>{formatDate(item.date)}</td>
                    <td className="amount">{formatCurrency(item.amount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .reconciliation-container {
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
          margin-bottom: 0.25rem;
        }

        .page-header p {
          color: #64748b;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .summary-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }

        .card-title {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0.25rem 0;
        }

        .card-sub {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .summary-card.success .card-value { color: #10b981; }
        .summary-card.warning .card-value { color: #f59e0b; }
        .summary-card.danger .card-value { color: #ef4444; }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .comparison-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
        }

        .comparison-card h3 {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .comparison-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .comparison-item.variance {
          font-weight: 600;
          border-bottom: none;
        }

        .comparison-note {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          font-size: 0.7rem;
          color: #64748b;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }

        .comparison-progress {
          margin-top: 1rem;
        }

        .progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #10b981;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-label {
          font-size: 0.7rem;
          text-align: center;
          margin-top: 0.5rem;
          color: #64748b;
        }

        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .card-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .month {
          font-weight: 500;
        }

        .paid {
          color: #10b981;
          font-weight: 500;
        }

        .pending {
          color: #f59e0b;
          font-weight: 500;
        }

        .rate-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mini-progress {
          width: 60px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .mini-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .type-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .type-invoice { background: #dbeafe; color: #1e40af; }
        .type-job { background: #d1fae5; color: #065f46; }
        .type-quote { background: #fef3c7; color: #92400e; }

        .reference-link {
          color: #22c55e;
          text-decoration: none;
        }

        .reference-link:hover {
          text-decoration: underline;
        }

        .amount {
          font-weight: 600;
          font-family: monospace;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-paid { background: #d1fae5; color: #065f46; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fee2e2; color: #dc2626; }
        .status-draft { background: #f3f4f6; color: #4b5563; }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        @media (max-width: 1024px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .comparison-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .reconciliation-container {
            padding: 1rem;
          }
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}