// components/operations/StockTable/StockTable.js
'use client';

import { useState } from 'react';
import StockStatusBadge from '../StockStatusBadge';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function StockTable({ 
  items = [], 
  loading = false, 
  onRowClick,
  onReorder 
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const locations = [...new Set(items.map(i => i.location).filter(Boolean))];
  
  const filteredItems = items.filter(item => {
    const matchesSearch = !search || 
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesLocation = !locationFilter || item.location === locationFilter;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });
  
  const getStockIndicator = (quantity, reorderPoint) => {
    if (quantity === 0) return '🔴 Critical';
    if (quantity <= reorderPoint) return '🟡 Low';
    if (quantity <= reorderPoint * 2) return '🟠 Medium';
    return '🟢 Good';
  };
  
  const columns = [
    { header: 'Item Name', accessor: 'name', width: '20%' },
    { header: 'SKU', accessor: 'sku', width: '12%' },
    { header: 'Category', accessor: 'category', width: '12%' },
    { header: 'Quantity', accessor: 'quantity', width: '8%', align: 'center' },
    { header: 'Status', accessor: 'status', width: '10%', align: 'center' },
    { header: 'Unit Cost', accessor: 'unitCost', width: '10%', align: 'right' },
    { header: 'Total Value', accessor: 'totalValue', width: '12%', align: 'right' },
    { header: 'Actions', accessor: 'actions', width: '16%', align: 'center' }
  ];
  
  const processedData = filteredItems.map(item => ({
    ...item,
    quantity: `${item.quantity} ${item.unit || ''}`,
    status: <StockStatusBadge status={item.status} size="sm" />,
    unitCost: <CurrencyAmount amount={item.unitCost} />,
    totalValue: <CurrencyAmount amount={(item.unitCost || 0) * (item.quantity || 0)} />,
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          {getStockIndicator(item.quantity, item.reorderPoint)}
        </span>
        {item.quantity <= item.reorderPoint && onReorder && (
          <button 
            onClick={(e) => { e.stopPropagation(); onReorder(item); }}
            style={{ padding: '0.25rem 0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Reorder
          </button>
        )}
      </div>
    )
  }));
  
  return (
    <div className="stock-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by item name or SKU..."
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
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>
      
      <Table 
        columns={columns} 
        data={processedData} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No stock items found"
      />
      
      <style jsx>{`
        .stock-table {
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