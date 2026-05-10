// app/employees/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchEmployee();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setEmployee(data.employee || data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employee details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="error-container">
        <h2>Error Loading Employee</h2>
        <p>{error || 'Employee not found'}</p>
        <Link href="/employees" className="btn-primary">Back to Employees</Link>
      </div>
    );
  }

  return (
    <div className="employee-detail-container">
      <div className="page-header">
        <div>
          <Link href="/employees" className="back-link">← Back to Employees</Link>
          <h1>{employee.name} {employee.surname}</h1>
          <p className="subtitle">Employee #{employee.employee_number}</p>
        </div>
        <div className="header-actions">
          <Link href={`/employees/${employee.id}/edit`} className="btn-edit">
            Edit Employee
          </Link>
        </div>
      </div>

      <div className="detail-card">
        <h2>Personal Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Employee Number</span>
            <span className="info-value">{employee.employee_number}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Full Name</span>
            <span className="info-value">{employee.name} {employee.surname}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date of Birth</span>
            <span className="info-value">{formatDate(employee.date_of_birth)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age</span>
            <span className="info-value">{employee.age || '-'} years</span>
          </div>
          <div className="info-item">
            <span className="info-label">Nationality</span>
            <span className="info-value">{employee.nationality || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Passport Number</span>
            <span className="info-value">{employee.passport_number || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Work Permit</span>
            <span className="info-value">{employee.work_permit || '-'}</span>
          </div>
        </div>
      </div>

      <div className="detail-card">
        <h2>Employment Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Start Date</span>
            <span className="info-value">{formatDate(employee.company_start_date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Years Worked</span>
            <span className="info-value">{employee.years_worked || 0} years</span>
          </div>
          <div className="info-item">
            <span className="info-label">Hourly Rate</span>
            <span className="info-value">{formatCurrency(employee.hourly_rate)}/hour</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .employee-detail-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .subtitle {
          color: #64748b;
          margin: 0.25rem 0 0;
        }

        .btn-edit {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .btn-edit:hover {
          background: #2563eb;
        }

        .detail-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .detail-card h2 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
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

        .error-container {
          text-align: center;
          padding: 4rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-block;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .employee-detail-container {
            padding: 1rem;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}