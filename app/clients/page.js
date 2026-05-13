// app/clients/page.js - Ensure it handles array response
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function ClientsPage() {
  const { token, isAuthenticated } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchClients();
    }
  }, [isAuthenticated, token]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Ensure we always have an array
      let clientsArray = [];
      if (Array.isArray(data)) {
        clientsArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        clientsArray = data.data;
      } else if (data.success && data.data) {
        clientsArray = data.data;
      } else {
        clientsArray = [];
      }
      
      setClients(clientsArray);
      console.log('Clients loaded:', clientsArray.length);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading clients...</p>
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
            border: 3px solid #e2e8f0;
            border-top-color: #22c55e;
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
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage your client contacts ({clients.length} total)</p>
        </div>
        <Link href="/clients/new" className="btn-primary">+ New Client</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>No clients found. Create your first client.</p>
        </div>
      ) : (
        <div className="clients-grid">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Organization</th>
                <th>Job Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td className="client-name">
                    {client.first_name} {client.last_name}
                   </td>
                  <td className="client-email">{client.email || '-'}</td>
                  <td className="client-phone">{client.phone || client.mobile || '-'}</td>
                  <td className="client-org">{client.organization_name || '-'}</td>
                  <td className="client-title">{client.job_title || '-'}</td>
                  <td className="actions">
                    <Link href={`/clients/${client.id}`} className="btn-view">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          color: #1e293b;
          margin: 0;
        }
        .page-header p {
          color: #64748b;
          margin: 0.25rem 0 0;
        }
        .btn-primary {
          background: #22c55e;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
        }
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .clients-grid {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow-x: auto;
        }
        .clients-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }
        .clients-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .clients-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }
        .client-name {
          font-weight: 500;
        }
        .actions {
          white-space: nowrap;
        }
        .btn-view {
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.75rem;
        }
        .empty-state {
          text-align: center;
          padding: 4rem;
          color: #64748b;
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
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}