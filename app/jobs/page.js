'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import { useRouter } from 'next/navigation';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Table from '@/app/components/ui/Table/Table';
import Button from '@/app/components/ui/Button/Button';
import StatusBadge from '@/app/components/common/StatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import EmptyState from '@/app/components/ui/EmptyState/EmptyState';
import { useToast } from '@/app/context/ToastContext';

export default function JobsPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: jobs, loading, refetch } = useFetch('/api/jobs');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const handleDelete = async (id, lcNumber) => {
    if (!confirm(`Delete job "${lcNumber}"? This will also delete all attendance records.`)) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Job deleted successfully');
        refetch();
      } else {
        toastError('Failed to delete job');
      }
    } catch (err) {
      toastError('Error deleting job');
    }
  };

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.lc_number?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && job.completion_status !== 'completed') ||
      (filter === 'completed' && job.completion_status === 'completed');
    return matchesSearch && matchesFilter;
  }) || [];

  const columns = [
    { header: 'LC Number', accessor: 'lc_number', width: '15%' },
    { header: 'Client', accessor: 'client_name', width: '20%' },
    { 
      header: 'PO Status', 
      accessor: 'po_status', 
      width: '12%',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    { 
      header: 'Completion', 
      accessor: 'completion_status', 
      width: '15%',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    { 
      header: 'Total Hours', 
      accessor: 'total_hours', 
      width: '12%',
      align: 'right',
      render: (value) => `${Math.round(value || 0)} hrs`
    },
    { 
      header: 'Invoiced', 
      accessor: 'total_invoiced', 
      width: '13%',
      align: 'right',
      render: (value) => <CurrencyAmount amount={value || 0} />
    },
    { 
      header: 'Actions', 
      accessor: 'id', 
      width: '13%',
      align: 'center',
      render: (id, row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); router.push(`/jobs/${id}`); }}
          >
            View
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleDelete(id, row.lc_number); }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner text="Loading jobs..." />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="📋 Job Management"
        description="Track and manage all projects"
        action={<Link href="/jobs/new"><Button>+ New Job</Button></Link>}
      />

      {/* Search and Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by LC number..."
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

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-value">{jobs?.length || 0}</div><div className="stat-label">Total Jobs</div></div>
        <div className="stat-card"><div className="stat-value">{jobs?.filter(j => j.completion_status !== 'completed').length || 0}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value">{jobs?.filter(j => j.completion_status === 'completed').length || 0}</div><div className="stat-label">Completed</div></div>
      </div>

      {/* Jobs Table */}
      <Table 
        columns={columns} 
        data={filteredJobs} 
        onRowClick={(row) => router.push(`/jobs/${row.id}`)}
        emptyMessage="No jobs found. Click 'New Job' to get started."
      />

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