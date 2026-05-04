// app/jobs/[id]/payroll/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function JobPayrollPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [payroll, setPayroll] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [jobRes, payrollRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/jobs/${params.id}/payroll`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const jobData = await jobRes.json();
      const payrollData = await payrollRes.json();
      
      setJob(jobData);
      setPayroll(payrollData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const totalHours = payroll.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
  const totalOvertime = payroll.reduce((sum, entry) => sum + (parseFloat(entry.overtime_hours) || 0), 0);
  const totalPayrollCost = payroll.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payroll data...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="header">
        <Link href={`/jobs/${params.id}`} className="back-link">← Back to Job</Link>
        <h1>Payroll - {job?.job_number}</h1>
        <p className="subtitle">View all hours logged for this job</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Hours</div>
          <div className="stat-value">{totalHours}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overtime Hours</div>
          <div className="stat-value">{totalOvertime}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Payroll Cost</div>
          <div className="stat-value">{formatCurrency(totalPayrollCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Entries</div>
          <div className="stat-value">{payroll.length}</div>
        </div>
      </div>

      <div className="payroll-list">
        {payroll.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <p>No hours logged for this job yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Regular Hours</th>
                <th>Overtime</th>
                <th>Hourly Rate</th>
                <th>Total Cost</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map(entry => (
                <tr key={entry.id}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="employee-name">{entry.user_name || 'Unknown'}</td>
                  <td className="hours">{entry.hours}</td>
                  <td className="hours overtime">{entry.overtime_hours || 0}</td>
                  <td className="rate">{formatCurrency(entry.hourly_rate)}</td>
                  <td className="cost">{formatCurrency(entry.cost || ((entry.hours + (entry.overtime_hours || 0) * 1.5) * (entry.hourly_rate || 0)))}</td>
                  <td className="description">{entry.description || '-'}</td>
                  <td>
                    <span className={`status ${entry.approved ? 'approved' : 'pending'}`}>
                      {entry.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #1e293b;
        }

        .subtitle {
          color: #64748b;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
        }

        .employee-name {
          font-weight: 500;
          color: #1e293b;
        }

        .hours, .rate, .cost {
          font-family: monospace;
        }

        .hours.overtime {
          color: #f59e0b;
        }

        .description {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status.approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }

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