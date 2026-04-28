'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.ok ? res.json() : [])
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading clients...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>🏢 Clients</h1>
        <Link href="/clients/new" style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none' }}>+ New Client</Link>
      </div>

      {clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {clients.map(client => (
            <div key={client.id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{client.client_name}</h3>
              {client.email && <p style={{ margin: '0.25rem 0' }}>📧 {client.email}</p>}
              {client.phone && <p style={{ margin: '0.25rem 0' }}>📞 {client.phone}</p>}
              <Link href={`/clients/${client.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>View Details →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}