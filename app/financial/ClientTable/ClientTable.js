'use client';

import { useState } from 'react';
import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function ClientTable({ clients, loading = false, onRowClick }) {
  const [search, setSearch] = useState('');

  const filteredClients = clients?.filter(client => 
    client.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const columns = [
    { header: 'Client Name', accessor: 'client_name', width: '25%' },
    { header: 'Contact Person', accessor: 'contact_person', width: '20%' },
    { header: 'Email', accessor: 'email', width: '25%' },
    { header: 'Phone', accessor: 'phone', width: '15%' },
    { 
      header: 'Total Jobs', 
      accessor: 'job_count', 
      width: '15%',
      align: 'center',
      render: (v) => v || 0
    }
  ];

  return (
    <div className="client-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by client name or contact person..."
        />
      </div>
      
      <Table 
        columns={columns} 
        data={filteredClients} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No clients found"
      />
      
      <style jsx>{`
        .client-table {
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