'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HRReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: [],
    monthlyPayroll: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/employees');
        const employees = Array.isArray(await response.json()) ? await response.json() : [];
        
        const departments = {};
        employees.forEach(e => {
          const dept = e.department || 'Other';
          departments[dept] = (departments[dept] || 0) + 1;
        });
        
        setData({
          totalEmployees: employees.length,
          activeEmployees: employees.filter(e => e.status === 'active').length,
          departments: Object.entries(departments).map(([name, count]) => ({ name, count })),
          monthlyPayroll: employees.reduce((sum, e) => sum + ((e.hourly_rate || 0) * 160), 0)
        });
      } catch (error) {
        console.error('Error fetching HR report:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading report...</p>
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
            border: 3px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>HR Reports</h1>
        <p>View workforce analytics and payroll reports</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{data.totalEmployees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Employees</div>
          <div className="stat-value">{data.activeEmployees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Payroll</div>
          <div className="stat-value">{formatCurrency(data.monthlyPayroll)}</div>
        </div>
      </div>

      <div className="section-header">
        <h2>Employees by Department</h2>
      </div>
      <div className="departments-list">
        {data.departments.map(dept => (
          <div key={dept.name} className="dept-item">
            <span className="dept-name">{dept.name}</span>
            <span className="dept-count">{dept.count} employees</span>
          </div>
        ))}
      </div>

      <div className="back-link">
        <Link href="/reports/monthly">← Back to Reports</Link>
      </div>

      <style jsx>{`
        .reports-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: #6b7280;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }
        .section-header {
          margin-bottom: 1rem;
        }
        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        .departments-list {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }
        .dept-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .dept-item:last-child {
          border-bottom: none;
        }
        .dept-name {
          font-weight: 500;
          color: #111827;
        }
        .dept-count {
          color: #6b7280;
        }
        .back-link a {
          color: #3b82f6;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}