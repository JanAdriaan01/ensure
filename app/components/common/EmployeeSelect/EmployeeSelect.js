// app/components/common/EmployeeSelect/EmployeeSelect.js
'use client';

import { useState, useEffect } from 'react';

export default function EmployeeSelect({ 
  value, 
  onChange, 
  onEmployeeSelect,
  employees = [],
  loading: externalLoading = false,
  required = false,
  disabled = false,
  placeholder = 'Select an employee...',
  error = '',
  helperText = '',
  className = '',
  fetchEmployees = null,
  filterByDepartment = null,
  filterByStatus = 'active'
}) {
  const [internalEmployees, setInternalEmployees] = useState(employees);
  const [loading, setLoading] = useState(externalLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  useEffect(() => {
    if (employees.length > 0) {
      setInternalEmployees(employees);
    } else if (fetchEmployees) {
      loadEmployees();
    }
  }, [employees, fetchEmployees]);
  
  useEffect(() => {
    if (value && internalEmployees.length > 0) {
      const found = internalEmployees.find(e => e.id === value || e.employee_id === value);
      setSelectedEmployee(found);
    }
  }, [value, internalEmployees]);
  
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees();
      setInternalEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredEmployees = internalEmployees
    .filter(emp => !filterByStatus || emp.status === filterByStatus)
    .filter(emp => !filterByDepartment || emp.department === filterByDepartment)
    .filter(emp =>
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const handleSelect = (employee) => {
    setSelectedEmployee(employee);
    setIsOpen(false);
    setSearchTerm('');
    
    if (onChange) {
      onChange({
        target: {
          name: 'employeeId',
          value: employee.id || employee.employee_id
        }
      });
    }
    
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    }
  };
  
  const getFullName = (emp) => {
    return `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.trim();
  };
  
  return (
    <div className={`employee-select ${className}`}>
      <div className="select-wrapper">
        <div 
          className={`select-trigger ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedEmployee ? (
            <div className="selected-value">
              <span className="employee-name">{getFullName(selectedEmployee)}</span>
              {selectedEmployee.position && (
                <span className="employee-position">({selectedEmployee.position})</span>
              )}
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
          <span className="arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="select-dropdown">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="options-list">
              {loading ? (
                <div className="loading-state">Loading employees...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="empty-state">No employees found</div>
              ) : (
                filteredEmployees.map(emp => (
                  <div
                    key={emp.id || emp.employee_id}
                    className={`option-item ${selectedEmployee?.id === emp.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(emp)}
                  >
                    <div className="option-name">{getFullName(emp)}</div>
                    <div className="option-details">
                      <span className="option-position">{emp.position || emp.role}</span>
                      {emp.department && (
                        <span className="option-department">• {emp.department}</span>
                      )}
                    </div>
                    <div className="option-email">{emp.email}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {error && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .employee-select {
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .select-wrapper {
          position: relative;
        }
        
        .select-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 42px;
        }
        
        .select-trigger:hover:not(.disabled) {
          border-color: #9ca3af;
        }
        
        .select-trigger.error {
          border-color: #ef4444;
        }
        
        .select-trigger.disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .selected-value {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: baseline;
        }
        
        .employee-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
        }
        
        .employee-position {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .placeholder {
          color: #9ca3af;
          font-size: 0.875rem;
        }
        
        .arrow {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 50;
          max-height: 350px;
          overflow: hidden;
        }
        
        .search-input-wrapper {
          padding: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .search-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .options-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .loading-state, .empty-state {
          padding: 1rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .option-item {
          padding: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .option-item:hover {
          background: #f3f4f6;
        }
        
        .option-item.selected {
          background: #dbeafe;
        }
        
        .option-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .option-details {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        .option-position, .option-department {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .option-email {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        
        .helper-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .error-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}