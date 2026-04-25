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
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    success('Quotes refreshed');
  };

  const updateQuoteStatus = async (id, newStatus) => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      success(`Quote status updated to ${newStatus}`);
      refetch();
    } else {
      toastError('Failed to update status');
    }
  };

  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      quote.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const columns = [
    { header: 'Quote #', accessor: 'quote_number', width: '12%' },
    { header: 'Date', accessor: 'quote_date', width: '10%', render: (v) => new Date(v).toLocaleDateString() },
    { header: 'Client', accessor: 'client_name', width: '15%' },
    { header: 'Scope', accessor: 'scope_subject', width: '20%', render: (v) => v?.substring(0, 30) + (v?.length > 30 ? '...' : '') },
    { header: 'Amount', accessor: 'total_amount', width: '12%', align: 'right', render: (v) => <CurrencyAmount amount={v || 0} /> },
    { 
      header: 'Status', 
      accessor: 'status', 
      width: '12%',
      render: (value, row) => (
        <select
          value={value}
          onChange={(e) => updateQuoteStatus(row.id, e.target.value)}
          style={{ padding: '0.25rem', fontSize: '0.7rem', borderRadius: '0.25rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      )
    },
    { 
      header: 'Linked Job', 
      accessor: 'job_lc_number', 
      width: '12%',
      render: (value, row) => value ? (
        <Link href={`/jobs/${row.job_id}`} onClick={(e) => e.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'none' }}>
          {value}
        </Link>
      ) : row.status === 'approved' ? 'Creating...' : '-'
    }
  ];

  if (loading) return <LoadingSpinner text="Loading quotes..." />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="💰 Quote Management"
        description="Create quotes. When approved, jobs are automatically created."
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
        fontSize: '0.875rem'
      }}>
        <span>ℹ️ When you change a quote status to "Approved", a Job is automatically created.</span>
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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Quotes Table */}
      <Table 
        columns={columns} 
        data={filteredQuotes} 
        onRowClick={(row) => router.push(`/quotes/${row.id}`)}
        emptyMessage="No quotes found. Click 'New Quote' to create one."
      />
    </div>
  );
}