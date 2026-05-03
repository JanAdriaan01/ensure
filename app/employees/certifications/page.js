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
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--danger)' }}>!</div>
        <h2>Unable to load certifications</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
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
          .error-container h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
          }
          .error-container p {
            color: var(--text-tertiary);
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  const validCount = certifications.filter(c => c.status === 'valid').length;
  const expiredCount = certifications.filter(c => c.status === 'expired').length;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Employee Certifications</h1>
          <p>Track employee certifications and renewals</p>
        </div>
        <Link href="/employees/new" className="btn-primary">
          Add Employee
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Certifications</div>
          <div className="stat-value">{certifications.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Valid</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{validCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expired</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{expiredCount}</div>
        </div>
      </div>

      <div className="table-container">
        {certifications.length === 0 ? (
          <div className="empty-state">
            <p>No certifications found</p>
            <p className="empty-hint">Add employees and assign certifications to see them here.</p>
          </div>
        ) : (
          <table className="data-table">
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
                    <span className={`status-badge ${cert.status === 'valid' ? 'status-approved' : 'status-rejected'}`}>
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
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }
        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-light);
        }
        .data-table th {
          background: var(--bg-tertiary);
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .data-table td {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-tertiary);
        }
        .empty-hint {
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}