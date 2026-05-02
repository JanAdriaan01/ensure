'use client';

import { useState } from 'react';

export default function ReconciliationPage() {
  const [transactions] = useState([
    { id: 1, date: '2024-03-25', description: 'Payment from ABC Construction', amount: 25000, status: 'matched', reference: 'INV-001' },
    { id: 2, date: '2024-03-24', description: 'Bank Fee', amount: -150, status: 'unmatched', reference: '' },
    { id: 3, date: '2024-03-23', description: 'Payment from XYZ Developers', amount: 18750, status: 'matched', reference: 'INV-002' },
    { id: 4, date: '2024-03-22', description: 'Supplier Payment - Materials', amount: -5000, status: 'pending', reference: 'PO-001' },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(Math.abs(amount));
  };

  const stats = {
    totalMatched: transactions.filter(t => t.status === 'matched').reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0),
    totalUnmatched: transactions.filter(t => t.status === 'unmatched').reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0),
    totalPending: transactions.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="reconciliation-container">
      <div className="page-header">
        <h1>Reconciliation</h1>
        <p>Match transactions with invoices and payments</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Matched Amount</div><div className="stat-value">{formatCurrency(stats.totalMatched)}</div></div>
        <div className="stat-card"><div className="stat-label">Unmatched Amount</div><div className="stat-value">{formatCurrency(stats.totalUnmatched)}</div></div>
        <div className="stat-card"><div className="stat-label">Pending Items</div><div className="stat-value">{stats.totalPending}</div></div>
      </div>

      <div className="table-container">
        <table className="transactions-table">
          <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Reference</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{t.date}</td><td>{t.description}</td>
                <td className={t.amount < 0 ? 'negative' : 'positive'}>{formatCurrency(t.amount)}</td>
                <td>{t.reference || '-'}</td>
                <td><span className={`status ${t.status}`}>{t.status}</span></td>
                <td>{t.status === 'unmatched' && <button className="match-btn">Match</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .reconciliation-container { max-width: 1280px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
        .page-header p { color: var(--text-tertiary); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: var(--card-bg); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--card-border); }
        .stat-label { font-size: 0.75rem; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 0.5rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .table-container { background: var(--card-bg); border-radius: 0.75rem; border: 1px solid var(--card-border); overflow-x: auto; }
        .transactions-table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); }
        td { padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); }
        .positive { color: #10b981; font-weight: 600; }
        .negative { color: #ef4444; font-weight: 600; }
        .status { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status.matched { background: var(--success-bg); color: var(--success-dark); }
        .status.unmatched { background: var(--danger-bg); color: var(--danger-dark); }
        .status.pending { background: var(--warning-bg); color: var(--warning-dark); }
        .match-btn { background: var(--primary); color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 0.25rem; cursor: pointer; }
        @media (max-width: 768px) { .reconciliation-container { padding: 1rem; } }
      `}</style>
    </div>
  );
}