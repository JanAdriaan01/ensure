// app/employees/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function EmployeesPage() {
  const { token, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchEmployees();
    }
  }, [isAuthenticated, token]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Handle both array response and object with data property
      setEmployees(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fixed search to use correct field names (name and surname)
  const filteredEmployees = employees.filter(emp =>
    emp.employee_number?.toLowerCase().includes(search.toLowerCase()) ||
    `${emp.name || ''} ${emp.surname || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employees...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
              <div className="employee-name">{`${emp.name || ''} ${emp.surname || ''}`.trim() || 'Unnamed'}</div>
            </div>
            <div className="employee-details">
              <div className="detail-item">
                <span className="detail-label">Hourly Rate</span>
                <span className="detail-value">R {emp.hourly_rate || 0}/hr</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{emp.company_start_date ? new Date(emp.company_start_date).toLocaleDateString() : '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Years Worked</span>
                <span className="detail-value">{emp.years_worked || 0} years</span>
              </div>
            </div>
            <div className="employee-footer">
              <span className={`employee-status ${emp.status || 'active'}`}>
                {emp.status || 'active'}
              </span>
              <span className="view-link">View Details →</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <div className="empty-state">No employees found. Click "New Employee" to add one.</div>
      )}

      <style jsx>{`
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        .search-bar {
          margin-bottom: 1.5rem;
        }
        .search-bar input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          color: #1e293b;
          transition: all 0.2s;
        }
        .search-bar input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .employee-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-decoration: none;
          transition: all 0.2s;
          display: block;
        }
        .employee-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #3b82f6;
        }
        .employee-header {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .employee-number {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .employee-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
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
          color: #64748b;
          font-weight: 400;
        }
        .detail-value {
          color: #1e293b;
          font-weight: 500;
        }
        .employee-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }
        .employee-status {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          text-transform: capitalize;
          background: #d1fae5;
          color: #065f46;
        }
        .view-link {
          font-size: 0.75rem;
          color: #3b82f6;
          font-weight: 500;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}