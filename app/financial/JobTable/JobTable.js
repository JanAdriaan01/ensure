'use client';

import { useState } from 'react';
import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge/StatusBadge';
import Table from '@/app/components/ui/Table/Table';
import Pagination from '@/app/components/ui/Pagination/Pagination';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function JobTable({ 
  jobs, 
  loading = false,
  onRowClick,
  showPagination = true,
  pageSize = 10
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobs = jobs?.filter(job => 
    job.lc_number?.toLowerCase().includes(search.toLowerCase()) ||
    job.client_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paginatedJobs = showPagination
    ? filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredJobs;

  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  const columns = [
    { header: 'Job Number', accessor: 'lc_number', width: '15%' },
    { header: 'Client', accessor: 'client_name', width: '20%' },
    { 
      header: 'Status', 
      accessor: 'completion_status', 
      width: '12%',
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
      header: 'Invoiced', 
      accessor: 'total_invoiced', 
      width: '15%',
      align: 'right',
      render: (value) => <CurrencyAmount amount={value || 0} />
    },
    { 
      header: 'Progress', 
      accessor: 'progress', 
      width: '15%',
      render: (value, row) => {
        const progress = row.total_quoted > 0 
          ? ((row.completed_value || 0) / row.total_quoted) * 100 
          : 0;
        return (
          <div className="progress-cell">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <span className="progress-text">{progress.toFixed(0)}%</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="job-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by job number or client..."
        />
      </div>
      
      <Table 
        columns={columns} 
        data={paginatedJobs} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No jobs found"
      />
      
      {showPagination && totalPages > 1 && (
        <div className="table-footer">
          <div className="page-info">
            Showing {paginatedJobs.length} of {filteredJobs.length} jobs
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      
      <style jsx>{`
        .job-table {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .table-toolbar {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .page-info {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .progress-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #2563eb;
          border-radius: 3px;
        }
        .progress-text {
          font-size: 0.7rem;
          color: #6b7280;
          min-width: 35px;
        }
        @media (max-width: 768px) {
          .table-footer {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}