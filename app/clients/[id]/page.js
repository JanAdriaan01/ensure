'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientDetailPage({ params }) {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchClientData();
  }, [params.id]);

  const fetchClientData = async () => {
    try {
      const [clientRes, quotesRes, jobsRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`),
        fetch(`/api/quotes?client_id=${params.id}`),
        fetch(`/api/jobs?client_id=${params.id}`)
      ]);
      
      const clientData = await clientRes.json();
      const quotesData = await quotesRes.json();
      const jobsData = await jobsRes.json();
      
      setClient(clientData);
      setQuotes(Array.isArray(quotesData) ? quotesData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setFormData(clientData);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async () => {
    const res = await fetch(`/api/clients/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setEditing(false);
      fetchClientData();
    } else {
      alert('Failed to update client');
    }
  };

  const deleteClient = async () => {
    if (confirm(`Delete client "${client?.client_name}"? This will also delete all associated quotes and jobs.`)) {
      await fetch(`/api/clients/${params.id}`, { method: 'DELETE' });
      router.push('/clients');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading client details...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container">
        <div className="error">Client not found</div>
        <Link href="/clients" className="btn-secondary">← Back to Clients</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link href="/clients" className="back-link">← Back to Clients</Link>
          <div className="header-title">
            <h1>{client.client_name}</h1>
            {client.contact_person && <p className="contact">Contact: {client.contact_person}</p>}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setEditing(!editing)} className="btn-edit">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={deleteClient} className="btn-delete">Delete Client</button>
        </div>
      </div>

      {/* Client Information Card */}
      <div className="info-card">
        <h3>Client Information</h3>
        {editing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Client Name</label>
              <input value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input value={formData.contact_person || ''} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea value={formData.client_address || ''} onChange={e => setFormData({...formData, client_address: e.target.value})} rows="3" />
            </div>
            <button onClick={updateClient} className="btn-primary">Save Changes</button>
          </div>
        ) : (
          <div className="info-grid">
            <div className="info-item"><span className="label">Email:</span><span>{client.email || '-'}</span></div>
            <div className="info-item"><span className="label">Phone:</span><span>{client.phone || '-'}</span></div>
            <div className="info-item full-width"><span className="label">Address:</span><span>{client.client_address || '-'}</span></div>
            <div className="info-item"><span className="label">Signed Up:</span><span>{new Date(client.signup_date).toLocaleDateString()}</span></div>
          </div>
        )}
      </div>

      {/* Quotes Section */}
      <div className="section">
        <div className="section-header">
          <h3>💰 Quotes ({quotes.length})</h3>
          <Link href={`/quotes/new?client_id=${client.id}`} className="btn-small">+ New Quote</Link>
        </div>
        {quotes.length === 0 ? (
          <div className="no-data">No quotes yet. Click "New Quote" to create one.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Quote #</th><th>Date</th><th>Amount</th><th>Status</th><th>Job #</th></tr></thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote.id} onClick={() => router.push(`/quotes/${quote.id}`)} className="clickable-row">
                  <td>{quote.quote_number}</td>
                  <td>{new Date(quote.quote_date).toLocaleDateString()}</td>
                  <td>${quote.quote_amount?.toLocaleString()}</td>
                  <td><span className={`status-badge status-${quote.status}`}>{quote.status}</span></td>
                  <td>{quote.job_number || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Jobs Section */}
      <div className="section">
        <div className="section-header">
          <h3>📋 Jobs ({jobs.length})</h3>
          <Link href={`/jobs/new?client_id=${client.id}`} className="btn-small">+ New Job</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="no-data">No jobs yet. Click "New Job" to create one.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Job #</th><th>PO Status</th><th>Completion</th><th>Total Hours</th></tr></thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} onClick={() => router.push(`/jobs/${job.id}`)} className="clickable-row">
                  <td>{job.lc_number}</td>
                  <td><span className={`status-badge status-${job.po_status}`}>{job.po_status}</span></td>
                  <td><span className={`status-badge status-${job.completion_status?.replace('_', '-')}`}>{job.completion_status}</span></td>
                  <td>{Math.round(job.total_hours || 0)} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .back-link { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; }
        .back-link:hover { color: #2563eb; }
        .header-title h1 { margin: 0; }
        .contact { color: #6b7280; margin: 0.25rem 0 0 0; }
        .header-actions { display: flex; gap: 0.75rem; }
        .info-card, .section { background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .info-card h3, .section-header h3 { margin: 0 0 1rem 0; font-size: 1rem; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        .info-item { display: flex; padding: 0.5rem; border-bottom: 1px solid #f3f4f6; }
        .info-item .label { width: 80px; font-weight: 500; color: #6b7280; }
        .full-width { grid-column: span 2; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .data-table th { background: #f9fafb; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
        .clickable-row { cursor: pointer; }
        .clickable-row:hover { background: #f9fafb; }
        .status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .edit-form .form-group { margin-bottom: 1rem; }
        .edit-form input, .edit-form textarea { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.375rem; }
        .btn-primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; }
        .btn-edit { background: #10b981; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; }
        .btn-delete { background: #ef4444; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; }
        .btn-small { background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.75rem; }
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .no-data { text-align: center; padding: 2rem; color: #6b7280; }
        @media (max-width: 768px) { .container { padding: 1rem; } .info-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
      `}</style>
    </div>
  );
}