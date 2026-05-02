'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCertifications() {
      try {
        const response = await fetch('/api/employees/certifications');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle both response formats
        let data = [];
        if (Array.isArray(result)) {
          data = result;
        } else if (result.data && Array.isArray(result.data)) {
          data = result.data;
        } else {
          data = [];
        }
        
        setCertifications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching certifications:', err);
        setError('Failed to load certifications. Please try again.');
        setCertifications([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCertifications();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading certifications...</p>
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
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Unable to load certifications</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
        <style jsx>{`
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
            padding: 2rem;
          }
          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .error-container h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
          }
          .error-container p {
            color: #6b7280;
            margin-bottom: 1rem;
          }
          .retry-btn {
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
          }
          .retry-btn:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="certifications-container">
      <div className="page-header">
        <div>
          <h1>Employee Certifications</h1>
          <p>Track employee certifications and renewals</p>
        </div>
        <Link href="/employees/new" className="btn-primary">
          + Add Employee
        </Link>
      </div>

      <div className="stats-card">
        <div className="stat-item">
          <span className="stat-label">Total Certifications</span>
          <span className="stat-value">{certifications.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Valid</span>
          <span className="stat-value valid">{certifications.filter(c => c.status === 'valid').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Expired</span>
          <span className="stat-value expired">{certifications.filter(c => c.status === 'expired').length}</span>
        </div>
      </div>

      <div className="table-container">
        {certifications.length === 0 ? (
          <div className="empty-state">
            <p>No certifications found</p>
            <p className="empty-hint">Add employees and assign certifications to see them here.</p>
          </div>
        ) : (
          <table className="certifications-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Certification</th>
                <th>Issued Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((cert) => (
                <tr key={cert.id}>
                  <td>{cert.employee_name}</td>
                  <td>{cert.certification_name}</td>
                  <td>{cert.issued_date}</td>
                  <td>{cert.expiry_date}</td>
                  <td>
                    <span className={`status ${cert.status === 'valid' ? 'valid' : 'expired'}`}>
                      {cert.status === 'valid' ? 'Valid' : 'Expired'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .certifications-container {
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
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .page-header p {
          color: #6b7280;
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

        .stats-card {
          display: flex;
          gap: 2rem;
          background: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6b7280;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .stat-value.valid {
          color: #10b981;
        }

        .stat-value.expired {
          color: #ef4444;
        }

        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }

        .certifications-table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }

        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status.valid {
          background: #d1fae5;
          color: #065f46;
        }

        .status.expired {
          background: #fee2e2;
          color: #991b1b;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-hint {
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .certifications-container {
            padding: 1rem;
          }
          .stats-card {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}