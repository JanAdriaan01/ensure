// components/hr/EmployeeTable/EmployeeTable.js
'use client';

import { useState } from 'react';
import EmployeeStatusBadge from '../EmployeeStatusBadge';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function EmployeeTable({ 
  employees, 
  loading = false, 
  onRowClick,
  onEdit,
  onDelete,
  showActions = true 
}) {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const departments = [...new Set(employees?.map(e => e.department).filter(Boolean))];
  const statuses = ['active', 'on-leave', 'probation', 'terminated'];
  
  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(search.toLowerCase()) ||
                          employee.email?.toLowerCase().includes(search.toLowerCase()) ||
                          employee.employeeId?.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  }) || [];
  
  const columns = [
    { header: 'Employee ID', accessor: 'employeeId', width: '12%' },
    { header: 'Name', accessor: 'name', width: '20%' },
    { header: 'Department', accessor: 'department', width: '15%' },
    { header: 'Role', accessor: 'role', width: '15%' },
    { 
      header: 'Status', 
      accessor: 'status', 
      width: '12%',
      render: (value) => <EmployeeStatusBadge status={value} size="sm" />
    },
    { 
      header: 'Start Date', 
      accessor: 'startDate', 
      width: '12%',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      header: 'Email', 
      accessor: 'email', 
      width: '14%',
      render: (value) => <span className="email-cell">{value}</span>
    }
  ];
  
  if (showActions) {
    columns.push({
      header: 'Actions',
      accessor: 'id',
      width: '10%',
      align: 'center',
      render: (value, row) => (
        <div className="action-buttons">
          <button 
            className="action-btn edit" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(row);
            }}
          >
            ✏️
          </button>
          <button 
            className="action-btn delete" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(row);
            }}
          >
            🗑️
          </button>
        </div>
      )
    });
  }
  
  return (
    <div className="employee-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by name, email, or ID..."
        />
        <div className="filters">
          <select 
            className="filter-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
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
        </div>
      </div>
      
      <Table 
        columns={columns} 
        data={filteredEmployees} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No employees found"
      />
      
      <style jsx>{`
        .employee-table {
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
        
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .email-cell {
          font-size: 0.75rem;
          font-family: monospace;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
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
        
        .action-btn.edit {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .action-btn.edit:hover {
          background: #bfdbfe;
        }
        
        .action-btn.delete {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .action-btn.delete:hover {
          background: #fecaca;
        }
        
        @media (max-width: 768px) {
          .table-toolbar {
            flex-direction: column;
          }
          
          .filters {
            width: 100%;
          }
          
          .filter-select {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}