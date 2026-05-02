'use client';

import { useState, useEffect } from 'react';
import { useFetch } from '@/app/hooks/useFetch';

export default function FinancialPage() {
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');
  const { data: invoices, loading: invoicesLoading } = useFetch('/api/invoices');
  const { data: clients, loading: clientsLoading } = useFetch('/api/clients');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    activeJobs: 0,
    pendingQuotes: 0,
    totalClients: 0
  });

  useEffect(() => {
    if (!jobsLoading && !quotesLoading && !invoicesLoading && !clientsLoading) {
      const safeJobs = jobs || [];
      const safeQuotes = quotes || [];
      const safeInvoices = invoices || [];
      const safeClients = clients || [];

      const totalRevenue = safeJobs.reduce((sum, j) => sum + (j.po_amount || 0), 0);
      const totalInvoiced = safeInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const totalPaid = safeInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const pendingAmount = safeInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const overdueAmount = safeInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const activeJobs = safeJobs.filter(j => j.completion_status !== 'completed').length;
      const pendingQuotes = safeQuotes.filter(q => q.status === 'pending').length;

      setStats({
        totalRevenue,
        totalInvoiced,
        totalPaid,
        pendingAmount,
        overdueAmount,
        activeJobs,
        pendingQuotes,
        totalClients: safeClients.length
      });
    }
  }, [jobs, quotes, invoices, clients, jobsLoading, quotesLoading, invoicesLoading, clientsLoading]);

  if (jobsLoading || quotesLoading || invoicesLoading || clientsLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="financial-container">
      <div className="page-header">
        <h1>Financial Dashboard</h1>
        <p>Overview of your financial performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">R {stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invoiced Amount</div>
          <div className="stat-value">R {stats.totalInvoiced.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Amount Paid</div>
          <div className="stat-value">R {stats.totalPaid.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Payment</div>
          <div className="stat-value">R {stats.pendingAmount.toLocaleString()}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Overdue Amount</div>
          <div className="stat-value">R {stats.overdueAmount.toLocaleString()}</div>
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
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        .page-header p {
          color: var(--text-tertiary);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .stat-card.warning .stat-value {
          color: #dc2626;
        }
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}