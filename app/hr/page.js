'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HRPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    monthlyPayroll: 0
  });

  useEffect(() => {
    // Fetch HR stats
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const employees = data.data || [];
          setStats({
            totalEmployees: employees.length,
            activeEmployees: employees.filter(e => e.status === 'active').length,
            onLeave: employees.filter(e => e.status === 'on_leave').length,
            monthlyPayroll: employees.reduce((sum, e) => sum + (e.hourly_rate || 0) * 160, 0)
          });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="hr-container">
      <div className="page-header">
        <h1>Human Resources</h1>
        <p>Manage employees, payroll, and HR operations</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{stats.totalEmployees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Employees</div>
          <div className="stat-value">{stats.activeEmployees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On Leave</div>
          <div className="stat-value">{stats.onLeave}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Payroll</div>
          <div className="stat-value">R {stats.monthlyPayroll.toLocaleString()}</div>
        </div>
      </div>

      <div className="quick-links">
        <Link href="/employees" className="quick-link">
          <div className="quick-link-icon">👥</div>
          <div className="quick-link-text">Employee Management</div>
        </Link>
        <Link href="/payroll" className="quick-link">
          <div className="quick-link-icon">💰</div>
          <div className="quick-link-text">Payroll</div>
        </Link>
        <Link href="/employees/skills" className="quick-link">
          <div className="quick-link-icon">⭐</div>
          <div className="quick-link-text">Skills Management</div>
        </Link>
        <Link href="/employees/certifications" className="quick-link">
          <div className="quick-link-icon">📜</div>
          <div className="quick-link-text">Certifications</div>
        </Link>
      </div>

      <style jsx>{`
        .hr-container {
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
        .dark .page-header h1 {
          color: #f9fafb;
        }
        .page-header p {
          color: #6b7280;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .dark .stat-card {
          background: #1f2937;
          border-color: #374151;
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
        .dark .stat-value {
          color: #f9fafb;
        }
        .quick-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .quick-link {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }
        .quick-link:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
        }
        .quick-link-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .quick-link-text {
          color: #111827;
          font-weight: 500;
        }
        .dark .quick-link-text {
          color: #f9fafb;
        }
        @media (max-width: 768px) {
          .hr-container { padding: 1rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .quick-links { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}