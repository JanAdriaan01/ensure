// components/hr/EmployeeSearch/EmployeeSearch.js
'use client';

import { useState, useEffect } from 'react';
import EmployeeCard from '../EmployeeCard';

export default function EmployeeSearch({ 
  employees = [], 
  onSelect,
  placeholder = "Search employees...",
  maxResults = 10 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
  
  useEffect(() => {
    if (searchTerm.length > 1) {
      const results = employees.filter(employee => {
        const matchesSearch = 
          employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.role?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
        
        return matchesSearch && matchesDepartment;
      }).slice(0, maxResults);
      
      setFilteredEmployees(results);
      setShowResults(true);
    } else {
      setFilteredEmployees([]);
      setShowResults(false);
    }
  }, [searchTerm, employees, selectedDepartment, maxResults]);
  
  const handleSelect = (employee) => {
    setSearchTerm(employee.name);
    setShowResults(false);
    onSelect?.(employee);
  };
  
  return (
    <div className="employee-search">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length > 1 && setShowResults(true)}
        />
        {searchTerm && (
          <button 
            className="clear-btn"
            onClick={() => {
              setSearchTerm('');
              setShowResults(false);
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      {departments.length > 0 && (
        <div className="department-filters">
          <button 
            className={`filter-chip ${!selectedDepartment ? 'active' : ''}`}
            onClick={() => setSelectedDepartment('')}
          >
            All
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              className={`filter-chip ${selectedDepartment === dept ? 'active' : ''}`}
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      )}
      
      {showResults && (
        <div className="search-results">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(employee => (
              <div 
                key={employee.id} 
                className="result-item"
                onClick={() => handleSelect(employee)}
              >
                <div className="result-avatar">
                  {employee.avatar ? (
                    <img src={employee.avatar} alt={employee.name} />
                  ) : (
                    <div className="avatar-placeholder">{employee.name?.charAt(0)}</div>
                  )}
                </div>
                <div className="result-info">
                  <div className="result-name">{employee.name}</div>
                  <div className="result-meta">
                    <span>{employee.role}</span>
                    <span className="dot">•</span>
                    <span>{employee.department}</span>
                    <span className="dot">•</span>
                    <span>ID: {employee.employeeId}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No employees found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .employee-search {
          position: relative;
          width: 100%;
        }
        
        .search-input-wrapper {
          position: relative;
          margin-bottom: 0.75rem;
        }
        
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
        }
        
        .search-input {
          width: 100%;
          padding: 0.625rem 2rem 0.625rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .clear-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          font-size: 0.875rem;
          padding: 0.25rem;
        }
        
        .clear-btn:hover {
          color: #ef4444;
        }
        
        .department-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .filter-chip {
          padding: 0.25rem 0.75rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 9999px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-chip:hover {
          background: #f3f4f6;
        }
        
        .filter-chip.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
        }
        
        .result-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .result-item:hover {
          background: #f3f4f6;
        }
        
        .result-avatar {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          overflow: hidden;
          background: #e5e7eb;
          flex-shrink: 0;
        }
        
        .result-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3b82f6;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }
        
        .result-info {
          flex: 1;
        }
        
        .result-name {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .result-meta {
          font-size: 0.75rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .dot {
          color: #d1d5db;
        }
        
        .no-results {
          padding: 1rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}