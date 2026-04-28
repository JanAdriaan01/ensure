// components/operations/ToolTable/ToolTable.js
'use client';

import { useState } from 'react';
import ToolStatusBadge from '../ToolStatusBadge';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function ToolTable({ 
  tools = [], 
  loading = false, 
  onRowClick,
  onCheckout,
  onReturn 
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const categories = [...new Set(tools.map(t => t.category).filter(Boolean))];
  const statuses = ['Available', 'Checked Out', 'Maintenance', 'Lost', 'Damaged'];
  
  const filteredTools = tools.filter(tool => {
    const matchesSearch = !search || 
      tool.name?.toLowerCase().includes(search.toLowerCase()) ||
      tool.serialNumber?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !categoryFilter || tool.category === categoryFilter;
    const matchesStatus = !statusFilter || tool.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const columns = [
    { header: 'Tool Name', accessor: 'name', width: '20%' },
    { header: 'Serial #', accessor: 'serialNumber', width: '15%' },
    { header: 'Category', accessor: 'category', width: '15%' },
    { header: 'Location', accessor: 'location', width: '15%' },
    { header: 'Status', accessor: 'status', width: '12%', align: 'center' },
    { header: 'Value', accessor: 'value', width: '10%', align: 'right' },
    { header: 'Actions', accessor: 'actions', width: '13%', align: 'center' }
  ];
  
  const processedData = filteredTools.map(tool => ({
    ...tool,
    status: <ToolStatusBadge status={tool.status} size="sm" />,
    value: tool.purchasePrice ? <CurrencyAmount amount={tool.purchasePrice} /> : 'N/A',
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {tool.status === 'available' && onCheckout && (
          <button 
            onClick={(e) => { e.stopPropagation(); onCheckout(tool); }}
            style={{ padding: '0.25rem 0.5rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Checkout
          </button>
        )}
        {tool.status === 'checked-out' && onReturn && (
          <button 
            onClick={(e) => { e.stopPropagation(); onReturn(tool); }}
            style={{ padding: '0.25rem 0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Return
          </button>
        )}
      </div>
    )
  }));
  
  return (
    <div className="tool-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by tool name or serial number..."
        />
        
        <div className="filters">
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      <Table 
        columns={columns} 
        data={processedData} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No tools found"
      />
      
      <style jsx>{`
        .tool-table {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .table-toolbar {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .filters {
          display: flex;
          gap: 0.5rem;
        }
        
        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .table-toolbar {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}