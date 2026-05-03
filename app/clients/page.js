'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        const data = await response.json();
        setClients(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

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
        <Link href="/clients/new" className="btn-primary">+ New Client</Link>
      </div>

      <div className="cards-grid">
        {clients.map((client) => (
          <Link key={client.id} href={`/clients/${client.id}`} className="client-card">
            <div className="client-name">{client.name}</div>
            <div className="client-contact">{client.contact_person || 'No contact person'}</div>
            <div className="client-email">{client.email || 'No email'}</div>
            <div className="client-footer">
              <span className="view-link">View Details →</span>
            </div>
          </Link>
        ))}
        {clients.length === 0 && (
          <div className="empty-state">
            <p>No clients found. Create your first client.</p>
          </div>
        )}
      </div>

      <style jsx>{`
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