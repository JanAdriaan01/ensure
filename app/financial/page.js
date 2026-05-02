'use client';

import { useState } from 'react';

export default function FinancialPage() {
  // Mock data directly in component - no API calls
  const [stats] = useState({
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
    ]
  });

  const [recentInvoices] = useState([
    { id: 1, number: 'INV-001', client: 'ABC Construction', amount: 25000, status: 'Paid', date: '2024-03-15' },
    { id: 2, number: 'INV-002', client: 'XYZ Developers', amount: 18750, status: 'Pending', date: '2024-03-20' },
    { id: 3, number: 'INV-003', client: 'Smith Properties', amount: 32500, status: 'Overdue', date: '2024-02-28' },
    { id: 4, number: 'INV-004', client: 'Johnson & Co', amount: 15750, status: 'Paid', date: '2024-03-10' },
    { id: 5, number: 'INV-005', client: 'Williams Ltd', amount: 28000, status: 'Pending', date: '2024-03-25' },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
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
    <div className="financial-container">
      <div className="page-header">
        <h1>Financial Dashboard</h1>
        <p>Overview of financial performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-trend positive">↑ 12% vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invoiced Amount</div>
          <div className="stat-value">{formatCurrency(stats.totalInvoiced)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Amount Paid</div>
          <div className="stat-value">{formatCurrency(stats.totalPaid)}</div>
          <div className="stat-sub">{Math.round((stats.totalPaid / stats.totalInvoiced) * 100)}% of invoiced</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Payment</div>
          <div className="stat-value">{formatCurrency(stats.pendingAmount)}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Overdue Amount</div>
          <div className="stat-value">{formatCurrency(stats.overdueAmount)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{stats.activeJobs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Quotes</div>
          <div className="stat-value">{stats.pendingQuotes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{stats.totalClients}</div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="chart-section">
        <h2>Monthly Revenue</h2>
        <div className="chart-bars">
          {stats.monthlyRevenue.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div className="chart-bar-label">{item.month}</div>
              <div 
                className="chart-bar" 
                style={{ height: `${(item.amount / 50000) * 100}%` }}
              >
                <span className="chart-bar-value">{formatCurrency(item.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="invoices-section">
        <div className="section-header">
          <h2>Recent Invoices</h2>
          <button className="view-all-btn">View All →</button>
        </div>
        <div className="invoices-table">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(invoice => (
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
        .financial-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .dark .page-header h1 {
          color: #f9fafb;
        }
        
        .page-header p {
          color: #6b7280;
        }
        
        .dark .page-header p {
          color: #9ca3af;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .dark .stat-card {
          background: #1f2937;
          border-color: #374151;
        }
        
        .stat-card.warning .stat-value {
          color: #dc2626;
        }
        
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        
        .dark .stat-label {
          color: #9ca3af;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .dark .stat-value {
          color: #f9fafb;
        }
        
        .stat-trend {
          font-size: 0.75rem;
          color: #10b981;
        }
        
        .stat-trend.positive {
          color: #10b981;
        }
        
        .stat-sub {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .chart-section, .invoices-section {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .dark .chart-section, .dark .invoices-section {
          background: #1f2937;
          border-color: #374151;
        }
        
        .chart-section h2, .section-header h2 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }
        
        .dark .chart-section h2, .dark .section-header h2 {
          color: #f9fafb;
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
          color: #6b7280;
        }
        
        .chart-bar {
          width: 100%;
          max-width: 60px;
          background: #3b82f6;
          border-radius: 0.375rem;
          position: relative;
          transition: height 0.3s ease;
          min-height: 4px;
          cursor: pointer;
        }
        
        .chart-bar:hover {
          background: #2563eb;
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
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .view-all-btn {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .invoices-table {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          text-align: left;
          padding: 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dark th {
          color: #9ca3af;
          border-bottom-color: #374151;
        }
        
        td {
          padding: 0.75rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dark td {
          color: #f9fafb;
          border-bottom-color: #374151;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
          color: white;
        }
        
        @media (max-width: 768px) {
          .financial-container {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .stat-value {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
}