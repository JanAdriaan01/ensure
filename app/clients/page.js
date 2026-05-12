// app/clients/page.js - Ensure it fetches after navigation
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
      }
      
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add an effect to refetch when coming back from new client page
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && token) {
        fetchClients();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage your client database</p>
        </div>
        <Link href="/clients/new" className="btn-primary">New Client</Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchClients} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="cards-grid">
        {clients.length === 0 && !error ? (
          <div className="empty-state">
            <p>No clients found. Create your first client.</p>
          </div>
        ) : (
          clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="client-card">
              <div className="client-name">{client.client_name}</div>
              <div className="client-contact">{client.contact_person || 'No contact person'}</div>
              <div className="client-email">{client.email || 'No email'}</div>
              <div className="client-footer">
                <span className="view-link">View Details →</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <style jsx>{`
        .container {
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
          margin-bottom: 0.25rem;
          color: #1e293b;
        }
        .page-header p {
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
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .client-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-decoration: none;
          transition: all 0.2s;
          display: block;
        }
        .client-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #22c55e;
        }
        .client-name {
          font-weight: 600;
          font-size: 1rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .client-contact {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        .client-email {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-bottom: 0.75rem;
        }
        .client-footer {
          text-align: right;
          padding-top: 0.5rem;
          border-top: 1px solid #e2e8f0;
        }
        .view-link {
          font-size: 0.7rem;
          color: #22c55e;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}