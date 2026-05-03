'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertifications() {
      try {
        const response = await fetch('/api/employees/certifications');
        const result = await response.json();
        const data = Array.isArray(result) ? result : (result.data || []);
        setCertifications(data);
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
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Employee Certifications</h1>
        <p>Track employee certifications and renewals</p>
      </div>

      <div className="table-container">
        {certifications.length === 0 ? (
          <div className="empty-state">
            <p>No certifications found</p>
            <Link href="/employees/new" className="btn-primary">Add Employee</Link>
          </div>
        ) : (
          <table>
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
    </div>
  );
}