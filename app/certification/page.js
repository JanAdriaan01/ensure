'use client';

import { useState, useEffect } from 'react';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertifications() {
      try {
        const response = await fetch('/api/employees/certifications');
        const result = await response.json();
        setCertifications(result.data || []);
      } catch (error) {
        console.error('Error fetching certifications:', error);
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

  return (
    <div className="certifications-container">
      <div className="page-header">
        <h1>Employee Certifications</h1>
        <p>Track employee certifications and renewals</p>
      </div>
      <div className="table-container">
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
            {certifications.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">No certifications found</td>
              </tr>
            ) : (
              certifications.map(cert => (
                <tr key={cert.id}>
                  <td>{cert.employee_name}</td>
                  <td>{cert.certification_name}</td>
                  <td>{cert.issued_date}</td>
                  <td>{cert.expiry_date}</td>
                  <td>
                    <span className={cert.status === 'valid' ? 'status valid' : 'status expired'}>
                      {cert.status === 'valid' ? 'Valid' : 'Expired'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .certifications-container {
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
          color: #6b7280;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}