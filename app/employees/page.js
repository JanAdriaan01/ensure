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
    setEmployees(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.employee_number.toLowerCase().includes(search.toLowerCase()) ||
    `${emp.name} ${emp.surname}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>👥 Employee Management</h1>
        <Link href="/employees/new" className="btn-primary">+ New Employee</Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by employee number or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="employee-grid">
        {filteredEmployees.map(emp => (
          <Link href={`/employees/${emp.id}`} key={emp.id} className="employee-card">
            <div className="employee-header">
              <div className="employee-number">{emp.employee_number}</div>
              <div className="employee-name">{emp.name} {emp.surname}</div>
            </div>
            <div className="employee-details">
              <div>📍 Age: {emp.age || '-'} years</div>
              <div>📅 Years Worked: {Math.round(emp.years_worked || 0)} yrs</div>
              <div>🕐 Total Hours: {emp.total_hours_worked || 0} hrs</div>
            </div>
            <div className="employee-flag">
              {emp.nationality}
            </div>
          </Link>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="no-data">No employees found. Click "New Employee" to add one.</div>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h1 {
          margin: 0;
        }
        .search-bar {
          margin-bottom: 2rem;
        }
        .search-bar input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          font-size: 1rem;
        }
        .employee-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .employee-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
          display: block;
        }
        .employee-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .employee-header {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .employee-number {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .employee-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0.25rem;
        }
        .employee-details {
          font-size: 0.875rem;
          color: #4b5563;
        }
        .employee-details div {
          margin-bottom: 0.25rem;
        }
        .employee-flag {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}