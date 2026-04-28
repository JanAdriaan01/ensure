// components/operations/WorkOrderTable/WorkOrderTable.js
'use client';

import { useState } from 'react';
import WorkOrderStatusBadge from '../WorkOrderStatusBadge';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function WorkOrderTable({ 
  workOrders = [], 
  loading = false, 
  onRowClick,
  onUpdateStatus 
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const types = [...new Set(workOrders.map(wo => wo.type).filter(Boolean))];
  const statuses = ['Draft', 'Scheduled', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
  
  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = !search || 
      order.number?.toLowerCase().includes(search.toLowerCase()) ||
      order.title?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !typeFilter || order.type === typeFilter;
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const getPriorityBadge = (priority) => {
    const colors = {
      high: { bg: '#fee2e2', color: '#991b1b', text: '🔴 High' },
      medium: { bg: '#fed7aa', color: '#92400e', text: '🟡 Medium' },
      low: { bg: '#d1fae5', color: '#065f46', text: '🟢 Low' }
    };
    const config = colors[priority?.toLowerCase()] || colors.medium;
    return (
      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: config.bg, color: config.color, fontSize: '0.75rem' }}>
        {config.text}
      </span>
    );
  };
  
  const columns = [
    { header: 'Order #', accessor: 'number', width: '10%' },
    { header: 'Title', accessor: 'title', width: '20%' },
    { header: 'Type', accessor: 'type', width: '10%' },
    { header: 'Priority', accessor: 'priority', width: '8%' },
    { header: 'Assigned To', accessor: 'assignedTo', width: '12%' },
    { header: 'Due Date', accessor: 'dueDate', width: '10%' },
    { header: 'Status', accessor: 'status', width: '10%', align: 'center' },
    { header: 'Cost', accessor: 'cost', width: '10%', align: 'right' },
    { header: 'Actions', accessor: 'actions', width: '10%', align: 'center' }
  ];
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  const isOverdue = (dueDate, status) => {
    return dueDate && new Date(dueDate) < new Date() && status !== 'completed';
  };
  
  const processedData = filteredOrders.map(order => ({
    ...order,
    priority: getPriorityBadge(order.priority),
    dueDate: <span className={isOverdue(order.dueDate, order.status) ? 'overdue' : ''}>{formatDate(order.dueDate)}</span>,
    status: <WorkOrderStatusBadge status={order.status} size="sm" />,
    cost: <CurrencyAmount amount={order.cost} />,
    actions: onUpdateStatus && order.status !== 'completed' && (
      <select 
        value={order.status}
        onChange={(e) => onUpdateStatus(order, e.target.value)}
        style={{ padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer' }}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="draft">Draft</option>
        <option value="scheduled">Scheduled</option>
        <option value="in-progress">In Progress</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
      </select>
    )
  }));
  
  return (
    <div className="workorder-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by order # or title..."
        />
        
        <div className="filters">
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
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
        emptyMessage="No work orders found"
      />
      
      <style jsx>{`
        .workorder-table {
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
        
        .overdue {
          color: #ef4444;
          font-weight: 600;
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