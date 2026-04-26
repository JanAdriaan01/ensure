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

export default function JobsPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
    success('Jobs refreshed');
  };

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.lc_number?.toLowerCase().includes(search.toLowerCase()) ||
      job.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && job.completion_status !== 'completed') ||
      (filter === 'completed' && job.completion_status === 'completed');
    return matchesSearch && matchesFilter;
  }) || [];

  const columns = [
    { header: 'LC Number', accessor: 'lc_number', width: '18%' },
    { header: 'Client', accessor: 'client_name', width: '22%' },
    { 
      header: 'Status', 
      accessor: 'completion_status', 
      width: '15%',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    { 
      header: 'PO Amount', 
      accessor: 'po_amount', 
      width: '15%',
      align: 'right',
      render: (value) => value ? <CurrencyAmount amount={value} /> : '-'
    },
    { 
      header: 'Total Hours', 
      accessor: 'total_hours', 
      width: '15%',
      align: 'right',
      render: (value) => `${Math.round(value || 0)} hrs`
    },
    { 
      header: 'Quote #', 
      accessor: 'quote_number', 
      width: '15%',
      render: (value, row) => value || '-'
    }
  ];

  if (loading) return <LoadingSpinner text="Loading jobs..." />;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}<br /><button onClick={fetchJobs}>Retry</button></div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="📋 Job Management"
        description="Jobs are automatically created from quotes when PO is received"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
        Jobs are automatically created when you record a PO on an approved quote. Manage all job work here.
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by LC number or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1rem',
                background: filter === f ? '#2563eb' : '#f3f4f6',
                color: filter === f ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-value">{jobs?.length || 0}</div><div className="stat-label">Total Jobs</div></div>
        <div className="stat-card"><div className="stat-value">{jobs?.filter(j => j.completion_status !== 'completed').length || 0}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value">{jobs?.filter(j => j.completion_status === 'completed').length || 0}</div><div className="stat-label">Completed</div></div>
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '0.75rem' }}>
          <p>No jobs found.</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Jobs are created when you record a PO on an approved quote in the Quotes section.
          </p>
          <Link href="/quotes">
            <Button variant="primary" style={{ marginTop: '1rem' }}>Go to Quotes →</Button>
          </Link>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredJobs} 
          onRowClick={(row) => router.push(`/jobs/${row.id}`)}
          emptyMessage="No jobs found"
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