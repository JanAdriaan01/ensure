'use client';

import { useState, useEffect } from 'react';

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/payroll')
      .then(res => res.json())
      .then(data => {
        setPayrollData(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading payroll data...</div>;
  }

  return (
    <div className="payroll-container">
      <div className="page-header">
        <h1>Payroll Management</h1>
        <p>Process payroll and manage employee compensation</p>
      </div>

      <div className="table-container">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Month</th>
              <th>Year</th>
              <th>Regular Hours</th>
              <th>Overtime Hours</th>
              <th>Total Pay</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No payroll records found</td>
              </tr>
            ) : (
              payrollData.map(record => (
                <tr key={record.id}>
                  <td>{record.employee_name}</td>
                  <td>{record.month}</td>
                  <td>{record.year}</td>
                  <td>{record.regular_hours}</td>
                  <td>{record.overtime_hours || 0}</td>
                  <td>{formatCurrency(record.total_pay)}</td>
                  <td>
                    <span className={`status ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .payroll-container {
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
        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .dark .table-container {
          background: #1f2937;
          border-color: #374151;
        }
        .payroll-table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark td {
          color: #f9fafb;
        }
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .status.processed {
          background: #d1fae5;
          color: #065f46;
        }
        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }
        @media (max-width: 768px) {
          .payroll-container { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}