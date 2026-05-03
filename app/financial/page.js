'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FinancialPage() {
  const [data] = useState({
    totalRevenue: 245000,
    totalInvoiced: 189500,
    totalPaid: 142125,
    pendingAmount: 47375,
    overdueAmount: 15750,
    activeJobs: 8,
    pendingQuotes: 5,
    totalClients: 24,
    monthlyRevenue: [
      { month: 'Jan', amount: 25000 },
      { month: 'Feb', amount: 28500 },
      { month: 'Mar', amount: 32000 },
      { month: 'Apr', amount: 40000 },
      { month: 'May', amount: 38500 },
      { month: 'Jun', amount: 41000 },
    ],
    recentInvoices: [
      { id: 1, number: 'INV-001', client: 'ABC Construction', amount: 25000, status: 'Paid', date: '2024-03-15' },
      { id: 2, number: 'INV-002', client: 'XYZ Developers', amount: 18750, status: 'Pending', date: '2024-03-20' },
      { id: 3, number: 'INV-003', client: 'Smith Properties', amount: 32500, status: 'Overdue', date: '2024-02-28' },
    ]
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Financial Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(data.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invoiced Amount</div>
          <div className="stat-value">{formatCurrency(data.totalInvoiced)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Amount Paid</div>
          <div className="stat-value">{formatCurrency(data.totalPaid)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Payment</div>
          <div className="stat-value">{formatCurrency(data.pendingAmount)}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Overdue Amount</div>
          <div className="stat-value">{formatCurrency(data.overdueAmount)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{data.activeJobs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{data.pendingQuotes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{data.totalClients}</div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="card">
        <div className="section-header">
          <h2>Monthly Revenue</h2>
        </div>
        <div className="chart-bars">
          {data.monthlyRevenue.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div className="chart-bar-label">{item.month}</div>
              <div className="chart-bar-wrapper">
                <div className="chart-bar" style={{ height: `${(item.amount / 50000) * 100}%` }}>
                  <span className="chart-bar-value">{formatCurrency(item.amount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="section-header">
          <h2>Recent Invoices</h2>
          <Link href="/invoicing" className="view-all">View All</Link>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{invoice.client}</td>
                  <td>{invoice.date}</td>
                  <td>{formatCurrency(invoice.amount)}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(invoice.status) }}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card.warning .stat-value {
          color: #ef4444;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .section-header h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .view-all {
          color: var(--primary);
          text-decoration: none;
          font-size: 0.875rem;
        }
        .view-all:hover {
          text-decoration: underline;
        }
        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 2rem;
          justify-content: center;
          min-height: 300px;
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
          color: var(--text-tertiary);
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
          background: var(--primary);
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
          color: var(--primary);
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .chart-bars {
            gap: 0.5rem;
          }
          .chart-bar-wrapper {
            max-width: 40px;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}