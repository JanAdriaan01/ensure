'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuotes();
    setRefreshing(false);
    success('Quotes refreshed');
  };

  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      quote.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const columns = [
    { header: 'Quote #', accessor: 'quote_number', width: '15%' },
    { header: 'Date', accessor: 'quote_date', width: '12%', render: (v) => new Date(v).toLocaleDateString() },
    { header: 'Client', accessor: 'client_name', width: '20%' },
    { header: 'Scope', accessor: 'scope_subject', width: '25%', render: (v) => v?.substring(0, 40) + (v?.length > 40 ? '...' : '') },
    { header: 'Amount', accessor: 'total_amount', width: '13%', align: 'right', render: (v) => <CurrencyAmount amount={v || 0} /> },
    { 
      header: 'Status', 
      accessor: 'status', 
      width: '15%',
      render: (value, row) => {
        if (row.po_received) {
          return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', background: '#d1fae5', color: '#065f46' }}>PO Received</span>;
        }
        return <StatusBadge status={value} size="sm" />;
      }
    }
  ];

  if (loading) return <LoadingSpinner text="Loading quotes..." />;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}<br /><button onClick={fetchQuotes}>Retry</button></div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="💰 Quote Management"
        description="Create quotes. When PO is received, a job is automatically created."
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/quotes/new">
              <Button variant="primary">+ New Quote</Button>
            </Link>
            <Button onClick={handleRefresh} disabled={refreshing} variant="secondary">
              {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
            </Button>
          </div>
        }
      />

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
        Quotes start as "pending". Click on a quote to approve it and record the PO - this will automatically create a job.
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by quote number or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="po_received">PO Received</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-value">{quotes?.length || 0}</div><div className="stat-label">Total Quotes</div></div>
        <div className="stat-card"><div className="stat-value">{quotes?.filter(q => q.status === 'pending' && !q.po_received).length || 0}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value">{quotes?.filter(q => q.po_received === true).length || 0}</div><div className="stat-label">PO Received</div></div>
      </div>

      {filteredQuotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '0.75rem' }}>
          <p>No quotes found.</p>
          <Link href="/quotes/new">
            <Button variant="primary" style={{ marginTop: '1rem' }}>Create your first quote →</Button>
          </Link>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredQuotes} 
          onRowClick={(row) => router.push(`/quotes/${row.id}`)}
          emptyMessage="No quotes found"
        />
      )}

      <style jsx>{`
        .stat-card {
          background: white;
          padding: 1rem;
          border-radius: 0.75rem;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}