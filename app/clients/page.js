'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id, clientName) => {
    if (confirm(`Delete client "${clientName}"? This will also delete all associated quotes and jobs.`)) {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchClients();
    }
  };

  const filteredClients = clients.filter(client =>
    client.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>🏢 Client Management</h1>
          <p>Manage your clients and their information</p>
        </div>
        <Link href="/clients/new" className="btn-primary">+ New Client</Link>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, contact person, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="no-data">
          <p>No clients found.</p>
          <Link href="/clients/new" className="btn-secondary">Add your first client →</Link>
        </div>
      ) : (
        <div className="clients-grid">
          {filteredClients.map(client => (
            <div key={client.id} className="client-card">
              <div className="client-header">
                <div className="client-icon">🏢</div>
                <div className="client-info">
                  <h3>{client.client_name}</h3>
                  <p className="contact-person">{client.contact_person || 'No contact person'}</p>
                </div>
              </div>
              <div className="client-details">
                {client.email && (
                  <div className="detail-row">
                    <span className="detail-label">📧 Email:</span>
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="detail-row">
                    <span className="detail-label">📞 Phone:</span>
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.client_address && (
                  <div className="detail-row">
                    <span className="detail-label">📍 Address:</span>
                    <span className="address">{client.client_address}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">📅 Signed up:</span>
                  <span>{new Date(client.signup_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row stats">
                  <span>📋 {client.quote_count || 0} quotes</span>
                  <span>📊 {client.job_count || 0} jobs</span>
                </div>
              </div>
              <div className="client-actions">
                <Link href={`/clients/${client.id}`} className="btn-edit">Edit</Link>
                <button onClick={() => deleteClient(client.id, client.client_name)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; }
        .page-header h1 { margin: 0; }
        .page-header p { color: #6b7280; margin: 0.25rem 0 0 0; }
        .search-bar { margin-bottom: 2rem; }
        .search-bar input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 1rem; }
        .clients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
        .client-card { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
        .client-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .client-header { display: flex; gap: 1rem; padding: 1.25rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .client-icon { font-size: 2.5rem; }
        .client-info h3 { margin: 0 0 0.25rem 0; font-size: 1.1rem; }
        .contact-person { margin: 0; color: #6b7280; font-size: 0.875rem; }
        .client-details { padding: 1.25rem; }
        .detail-row { display: flex; margin-bottom: 0.5rem; font-size: 0.875rem; }
        .detail-label { width: 70px; font-weight: 500; color: #6b7280; }
        .address { flex: 1; }
        .stats { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; gap: 1rem; }
        .stats span { background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
        .client-actions { display: flex; gap: 0.5rem; padding: 1rem 1.25rem; background: #f9fafb; border-top: 1px solid #e5e7eb; }
        .btn-primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; }
        .btn-edit { background: #10b981; color: white; padding: 0.375rem 0.75rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem; }
        .btn-delete { background: #ef4444; color: white; padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: none; cursor: pointer; font-size: 0.875rem; }
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .no-data { text-align: center; padding: 3rem; background: white; border-radius: 0.75rem; }
        @media (max-width: 768px) { .container { padding: 1rem; } .clients-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}