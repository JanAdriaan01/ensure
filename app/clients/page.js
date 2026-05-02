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
        <style jsx>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
          .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="clients-container">
      <div className="page-header">
        <div><h1>Clients</h1><p>Manage your client database</p></div>
        <Link href="/clients/new" className="btn-primary">+ New Client</Link>
      </div>

      <div className="clients-grid">
        {clients.map(client => (
          <Link key={client.id} href={`/clients/${client.id}`} className="client-card">
            <div className="client-name">{client.name}</div>
            <div className="client-contact">{client.contact_person || 'No contact person'}</div>
            <div className="client-email">{client.email || 'No email'}</div>
            <div className="client-footer"><span className="view-link">View Details →</span></div>
          </Link>
        ))}
        {clients.length === 0 && <div className="empty-state">No clients found. Create your first client.</div>}
      </div>

      <style jsx>{`
        .clients-container { max-width: 1280px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { font-size: 1.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
        .page-header p { color: var(--text-tertiary); }
        .btn-primary { background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; }
        .clients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .client-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 0.75rem; padding: 1rem; text-decoration: none; transition: all 0.2s; display: block; }
        .client-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--primary); }
        .client-name { font-weight: 600; font-size: 1rem; color: var(--text-primary); margin-bottom: 0.5rem; }
        .client-contact { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
        .client-email { font-size: 0.7rem; color: var(--text-tertiary); margin-bottom: 0.75rem; }
        .client-footer { text-align: right; padding-top: 0.5rem; border-top: 1px solid var(--border-light); }
        .view-link { font-size: 0.7rem; color: var(--primary); }
        .empty-state { text-align: center; padding: 3rem; color: var(--text-tertiary); }
        @media (max-width: 768px) { .clients-container { padding: 1rem; } }
      `}</style>
    </div>
  );
}