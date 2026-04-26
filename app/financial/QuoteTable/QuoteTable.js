'use client';

import { useState } from 'react';
import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function QuoteTable({ quotes, loading = false, onRowClick }) {
  const [search, setSearch] = useState('');

  const filteredQuotes = quotes?.filter(quote => 
    quote.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
    quote.client_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const columns = [
    { header: 'Quote #', accessor: 'quote_number', width: '15%' },
    { header: 'Date', accessor: 'quote_date', width: '12%', render: (v) => new Date(v).toLocaleDateString() },
    { header: 'Client', accessor: 'client_name', width: '25%' },
    { 
      header: 'Amount', 
      accessor: 'total_amount', 
      width: '15%',
      align: 'right',
      render: (v) => <CurrencyAmount amount={v || 0} />
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      width: '15%',
      render: (v) => <StatusBadge status={v} size="sm" />
    },
    { 
      header: 'PO', 
      accessor: 'po_received', 
      width: '10%',
      render: (v) => v ? <span style={{ color: '#10b981' }}>✓ Received</span> : '-'
    }
  ];

  return (
    <div className="quote-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by quote number or client..."
        />
      </div>
      
      <Table 
        columns={columns} 
        data={filteredQuotes} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No quotes found"
      />
      
      <style jsx>{`
        .quote-table {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .table-toolbar {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}