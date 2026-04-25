'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Table from '@/app/components/ui/Table/Table';
import Button from '@/app/components/ui/Button/Button';
import StatusBadge from '@/app/components/common/StatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function QuotesPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: quotes, loading, refetch } = useFetch('/api/quotes');
  const [search, setSearch] = useState('');
  const [poFilter, setPoFilter] = useState('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    success('Quotes refreshed');
  };

  const updatePoStatus = async (id, status) => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ po_status: status })
    });
    if (res.ok) {
      success('PO Status updated');
      refetch();
    } else {
      toastError('Failed to update status');
    }
  };

  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      quote.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesPo = poFilter === 'all' || quote.po_status === poFilter;
    const matchesInvoice = invoiceFilter === 'all' || quote.invoice_status === invoiceFilter;
    return matchesSearch && matchesPo && matchesInvoice;
  }) || [];

  const columns = [
    { header: 'Quote #', accessor: 'quote_number', width: '12%' },
    { header: 'Date', accessor: 'quote_date', width: '10%', render: (v) => new Date(v).toLocaleDateString() },
    { header: 'Client', accessor: 'client_name', width: '15%' },
    { header: 'Site', accessor: 'site_name', width: '12%' },
    { header: 'Scope', accessor: 'scope_subject', width: '15%', render: (v) => v?.substring(0, 30) + (v?.length > 30 ? '...' : '') },
    { header: 'Amount', accessor: 'total_amount', width: '12%', align: 'right', render: (v) => <CurrencyAmount amount={v || 0} /> },
    { 
      header: 'PO Status', 
      accessor: 'po_status', 
      width: '10%',
      render: (value, row) => (
        <select
          value={value}
          onChange={(e) => updatePoStatus(row.id, e.target.value)}
          style={{ padding: '0.25rem', fontSize: '0.7rem', borderRadius: '0.25rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      )
    },
    { header: 'Invoice Status', accessor: 'invoice_status', width: '10%', render: (v) => <StatusBadge status={v} size="sm" /> },
    { header: 'Version', accessor: 'version', width: '6%', align: 'center' }
  ];

  if (loading) return <LoadingSpinner text="Loading quotes..." />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="💰 Quote Management"
        description="Create and manage quotes. Quotes cannot be deleted - only versioned."
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/quotes/new">
              <Button>+ New Quote</Button>
            </Link>
            <Button onClick={handleRefresh} disabled={refreshing} variant="secondary">
              {refreshing ? '⟳...' : '⟳ Refresh'}
            </Button>
          </div>
        }
      />

      {/* Info Banner */}
      <div style={{ 
        background: '#dbeafe', 
        padding: '0.75rem 1rem', 
        borderRadius: '0.5rem', 
        marginBottom: '1rem',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>ℹ️</span>
        Quotes cannot be deleted. When edited, a new version is created. Approved quotes automatically create Jobs.
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by quote number or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
        />
        <select value={poFilter} onChange={(e) => setPoFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
          <option value="all">All PO Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={invoiceFilter} onChange={(e) => setInvoiceFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
          <option value="all">All Invoice Status</option>
          <option value="pending">Pending</option>
          <option value="invoiced">Invoiced</option>
        </select>
      </div>

      {/* Quotes Table - No Delete Button */}
      <Table 
        columns={columns} 
        data={filteredQuotes} 
        onRowClick={(row) => router.push(`/quotes/${row.id}`)}
        emptyMessage="No quotes found. Click 'New Quote' to create one."
      />

      <style jsx>{`
        select {
          border: 1px solid #ddd;
          background: white;
        }
      `}</style>
    </div>
  );
}