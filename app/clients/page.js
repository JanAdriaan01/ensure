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
    } else if (!isAuthenticated && !loading) {
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
      
      // Handle both response formats
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
              <div className="client-name">{client.client_name || client.name}</div>
              <div className="client-contact">{client.contact_person || 'No contact person'}</div>
              <div className="client-email">{client.email || 'No email'}</div>
              <div className="client-footer">
                <span className="view-link">View Details</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <style jsx>{`
        .error-message {
          background: var(--danger-bg);
          color: var(--danger-dark);
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
          background: var(--danger);
          color: white;
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .client-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1rem;
          text-decoration: none;
          transition: all 0.2s;
          display: block;
        }
        .client-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        .client-name {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        .client-contact {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        .client-email {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-bottom: 0.75rem;
        }
        .client-footer {
          text-align: right;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-light);
        }
        .view-link {
          font-size: 0.7rem;
          color: var(--primary);
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}