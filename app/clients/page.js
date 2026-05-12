// app/clients/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

export default function ClientsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchClients();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      let clientsData = [];
      if (Array.isArray(data)) {
        clientsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        clientsData = data.data;
      } else {
        clientsData = [];
      }
      
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
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
    <div className="clients-container">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage your client database</p>
        </div>
        <Link href="/clients/new" className="btn-primary">+ New Client</Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchClients} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="clients-grid">
        {clients.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor"/>
              </svg>
            </div>
            <h3>No Clients Found</h3>
            <p>Create your first client to get started.</p>
            <Link href="/clients/new" className="btn-primary">Create Client</Link>
          </div>
        ) : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Signup Date</th>
                <th>Jobs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="client-row">
                  <td className="client-name">
                    <Link href={`/clients/${client.id}`} className="client-link">
                      {client.client_name}
                    </Link>
                    
                  </td>
                  <td className="contact-person">{client.contact_person || '-'} 
                  </td>
                  <td className="email">{client.email || '-'} 
                  </td>
                  <td className="phone">{client.phone || '-'} 
                  </td>
                  <td className="signup-date">{formatDate(client.signup_date)} 
                  </td>
                  <td className="jobs-count">{client.total_jobs || 0} 
                  </td>
                  <td className="actions">
                    <Link href={`/clients/${client.id}`} className="action-btn view">
                      View Details →
                    </Link>
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .clients-container {
          max-width: 1400px;
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
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .page-header p {
          color: #64748b;
        }

        .btn-primary {
          background: #22c55e;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #16a34a;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .retry-btn {
          background: #dc2626;
          color: white;
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .clients-grid {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .clients-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .clients-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .clients-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .client-row:hover {
          background: #f8fafc;
        }

        .client-name {
          font-weight: 600;
        }

        .client-link {
          color: #22c55e;
          text-decoration: none;
        }

        .client-link:hover {
          text-decoration: underline;
        }

        .actions {
          text-align: right;
        }

        .action-btn {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .action-btn.view {
          color: #22c55e;
        }

        .action-btn.view:hover {
          text-decoration: underline;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .clients-container {
            padding: 1rem;
          }
          .clients-table th,
          .clients-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}