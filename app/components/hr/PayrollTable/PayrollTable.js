// components/hr/PayrollTable/PayrollTable.js
'use client';

import { useState } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function PayrollTable({ 
  payrollData = [], 
  loading = false,
  onProcessPayroll,
  onViewDetails 
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const statuses = ['pending', 'processed', 'paid', 'failed'];
  
  const filteredData = payrollData.filter(entry => {
    const matchesSearch = entry.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
                          entry.employeeId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status) => {
    const config = {
      pending: { class: 'pending', text: 'Pending' },
      processed: { class: 'processed', text: 'Processed' },
      paid: { class: 'paid', text: 'Paid' },
      failed: { class: 'failed', text: 'Failed' }
    };
    const { class: className, text } = config[status] || config.pending;
    return <span className={`status-badge ${className}`}>{text}</span>;
  };
  
  const columns = [
    { header: 'Employee ID', accessor: 'employeeId', width: '12%' },
    { header: 'Employee Name', accessor: 'employeeName', width: '20%' },
    { 
      header: 'Gross Pay', 
      accessor: 'grossPay', 
      width: '12%',
      render: (value) => <CurrencyAmount amount={value} />
    },
    { 
      header: 'Deductions', 
      accessor: 'deductions', 
      width: '12%',
      render: (value) => <CurrencyAmount amount={value} />
    },
    { 
      header: 'Net Pay', 
      accessor: 'netPay', 
      width: '12%',
      render: (value) => <strong><CurrencyAmount amount={value} /></strong>
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      width: '12%',
      render: (value) => getStatusBadge(value)
    },
    { 
      header: 'Payment Date', 
      accessor: 'paymentDate', 
      width: '12%',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Not paid'
    },
    { 
      header: 'Actions', 
      accessor: 'id', 
      width: '8%',
      align: 'center',
      render: (value, row) => (
        <button 
          className="view-btn"
          onClick={() => onViewDetails?.(row)}
        >
          View
        </button>
      )
    }
  ];
  
  return (
    <div className="payroll-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by employee name or ID..."
        />
        <div className="toolbar-actions">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          {onProcessPayroll && (
            <button className="process-btn" onClick={onProcessPayroll}>
              Process Payroll
            </button>
          )}
        </div>
      </div>
      
      <Table 
        columns={columns} 
        data={filteredData} 
        loading={loading}
        emptyMessage="No payroll records found"
      />
      
      <style jsx>{`
        .payroll-table {
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
        
        .process-btn {
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .process-btn:hover {
          background: #059669;
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
        
        .status-badge.processed {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-badge.paid {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.failed {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .view-btn {
          padding: 0.25rem 0.75rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          cursor: pointer;
        }
        
        .view-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}