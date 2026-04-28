// components/hr/TimeEntryTable/TimeEntryTable.js
'use client';

import { useState } from 'react';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function TimeEntryTable({ 
  entries = [], 
  loading = false,
  onEdit,
  onDelete,
  onApprove,
  showActions = true 
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
                          entry.project?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status) => {
    const config = {
      pending: { class: 'pending', text: 'Pending' },
      approved: { class: 'approved', text: 'Approved' },
      rejected: { class: 'rejected', text: 'Rejected' },
      submitted: { class: 'submitted', text: 'Submitted' }
    };
    const { class: className, text } = config[status] || config.pending;
    return <span className={`status-badge ${className}`}>{text}</span>;
  };
  
  const columns = [
    { header: 'Date', accessor: 'date', width: '10%', render: (v) => new Date(v).toLocaleDateString() },
    { header: 'Employee', accessor: 'employeeName', width: '15%' },
    { header: 'Project/Job', accessor: 'project', width: '15%' },
    { header: 'Task', accessor: 'task', width: '15%' },
    { header: 'Hours', accessor: 'hoursWorked', width: '8%', render: (v) => `${v.toFixed(1)} hrs` },
    { header: 'Start', accessor: 'startTime', width: '8%' },
    { header: 'End', accessor: 'endTime', width: '8%' },
    { header: 'Status', accessor: 'status', width: '10%', render: (v) => getStatusBadge(v) }
  ];
  
  if (showActions) {
    columns.push({
      header: 'Actions',
      accessor: 'id',
      width: '11%',
      align: 'center',
      render: (value, row) => (
        <div className="action-buttons">
          {row.status === 'pending' && onApprove && (
            <button className="action-btn approve" onClick={() => onApprove(row)}>
              ✓
            </button>
          )}
          <button className="action-btn edit" onClick={() => onEdit(row)}>
            ✏️
          </button>
          <button className="action-btn delete" onClick={() => onDelete(row)}>
            🗑️
          </button>
        </div>
      )
    });
  }
  
  const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
  
  return (
    <div className="time-entry-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by employee or project..."
        />
        <div className="toolbar-actions">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      <Table 
        columns={columns} 
        data={filteredEntries} 
        loading={loading}
        emptyMessage="No time entries found"
      />
      
      <div className="table-footer">
        <div className="total-hours">
          <span>Total Hours:</span>
          <strong>{totalHours.toFixed(2)} hrs</strong>
        </div>
      </div>
      
      <style jsx>{`
        .time-entry-table {
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
        
        .toolbar-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge.pending {
          background: #fed7aa;
          color: #92400e;
        }
        
        .status-badge.submitted {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-badge.approved {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.25rem;
          justify-content: center;
        }
        
        .action-btn {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        
        .action-btn.approve {
          background: #10b981;
          color: white;
        }
        
        .action-btn.approve:hover {
          background: #059669;
        }
        
        .action-btn.edit {
          background: #f59e0b;
          color: white;
        }
        
        .action-btn.edit:hover {
          background: #d97706;
        }
        
        .action-btn.delete {
          background: #ef4444;
          color: white;
        }
        
        .action-btn.delete:hover {
          background: #dc2626;
        }
        
        .table-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .total-hours {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}