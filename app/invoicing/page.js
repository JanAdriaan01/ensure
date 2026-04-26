'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function InvoicingPage() {
  const { data: jobs, loading } = useFetch('/api/jobs');
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // Fetch all invoices across jobs
    const fetchInvoices = async () => {
      const res = await fetch('/api/invoices');
      setInvoices(await res.json());
    };
    fetchInvoices();
  }, []);

  if (loading) return <LoadingSpinner text="Loading invoices..." />;

  const totalInvoiced = jobs?.reduce((sum, j) => sum + (j.total_invoiced || 0), 0) || 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="🧾 Invoicing" description="Manage all invoices across jobs" />
      
      <div className="stats-grid">
        <Card><div className="stat-value"><CurrencyAmount amount={totalInvoiced} /></div><div className="stat-label">Total Invoiced</div></Card>
        <Card><div className="stat-value">{invoices.length}</div><div className="stat-label">Total Invoices</div></Card>
        <Card><div className="stat-value">{invoices.filter(i => i.status === 'pending').length}</div><div className="stat-label">Pending Payment</div></Card>
      </div>

      <div className="invoices-list">
        {invoices.map(invoice => (
          <Link href={`/jobs/${invoice.job_id}/financial`} key={invoice.id} className="invoice-card">
            <div><strong>{invoice.invoice_number}</strong><br/><small>{invoice.job_lc_number}</small></div>
            <div><CurrencyAmount amount={invoice.total_amount} /></div>
            <div>{new Date(invoice.invoice_date).toLocaleDateString()}</div>
          </Link>
        ))}
        {invoices.length === 0 && <div className="empty">No invoices created yet.</div>}
      </div>

      <style jsx>{`
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .stat-value { font-size: 1.5rem; font-weight: bold; }
        .stat-label { font-size: 0.75rem; color: #6b7280; }
        .invoices-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .invoice-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 0.5rem; text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .empty { text-align: center; padding: 2rem; color: #6b7280; }
      `}</style>
    </div>
  );
}