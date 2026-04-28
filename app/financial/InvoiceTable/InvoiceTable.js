'use client';

import { useState } from 'react';
import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge/StatusBadge';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function InvoiceTable({ invoices, loading = false, onRowClick }) {
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices?.filter(inv => 
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.job_lc_number?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const columns = [
    { header: 'Invoice #', accessor: 'invoice_number', width: '15%' },
    { header: 'Date', accessor: 'invoice_date', width: '10%', render: (v) => new Date(v).toLocaleDateString() },
    { header: 'Job/Client', accessor: 'client_name', width: '25%', render: (v, row) => row.client_name || row.job_lc_number },
    { 
      header: 'Amount', 
      accessor: 'total_amount', 
      width: '15%',
      align: 'right',
      render: (v) => <CurrencyAmount amount={v || 0} />
    },
    { 
      header: 'Due Date', 
      accessor: 'due_date', 
      width: '12%',
      render: (v) => v ? new Date(v).toLocaleDateString() : '-',
      align: 'center'
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      width: '15%',
      render: (v) => <StatusBadge status={v || 'sent'} size="sm" />
    }
  ];

  return (
    <div className="invoice-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by invoice number, job, or client..."
        />
      </div>
      
      <Table 
        columns={columns} 
        data={filteredInvoices} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No invoices found"
      />
      
      <style jsx>{`
        .invoice-table {
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