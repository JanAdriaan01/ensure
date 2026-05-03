'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : (data.data || []));
    setLoading(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.employee_number?.toLowerCase().includes(search.toLowerCase()) ||
    `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Employee Management</h1>
        <Link href="/employees/new" className="btn-primary">New Employee</Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by employee number or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="cards-grid">
        {filteredEmployees.map((emp) => (
          <Link href={`/employees/${emp.id}`} key={emp.id} className="employee-card">
            <div className="employee-header">
              <div className="employee-number">{emp.employee_number}</div>
              <div className="employee-name">{`${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unnamed'}</div>
            </div>
            <div className="employee-details">
              <div className="detail-item">
                <span className="detail-label">Position</span>
                <span className="detail-value">{emp.position || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{emp.department || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Hours</span>
                <span className="detail-value">{emp.total_hours_worked || 0} hrs</span>
              </div>
            </div>
            <div className="employee-footer">
              <span className={`employee-status ${emp.status || 'active'}`}>
                {emp.status || 'active'}
              </span>
              <span className="view-link">View Details</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="empty-state">No employees found. Click "New Employee" to add one.</div>
      )}

      <style jsx>{`
        .search-bar {
          margin-bottom: 1.5rem;
        }
        .search-bar input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: all 0.2s;
        }
        .search-bar input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .search-bar input::placeholder {
          color: var(--text-muted);
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .employee-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-decoration: none;
          transition: all 0.2s;
          display: block;
        }
        .employee-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        .employee-header {
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .employee-number {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .employee-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 0.25rem;
        }
        .employee-details {
          margin-bottom: 0.75rem;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.375rem 0;
          font-size: 0.8rem;
        }
        .detail-label {
          color: var(--text-tertiary);
          font-weight: 400;
        }
        .detail-value {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .employee-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-light);
        }
        .employee-status {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          text-transform: capitalize;
          background: var(--success-bg);
          color: var(--success-dark);
        }
        .employee-status.inactive {
          background: var(--danger-bg);
          color: var(--danger-dark);
        }
        .employee-status.on_leave {
          background: var(--warning-bg);
          color: var(--warning-dark);
        }
        .view-link {
          font-size: 0.7rem;
          color: var(--primary);
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}