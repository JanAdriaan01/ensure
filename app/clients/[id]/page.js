// app/clients/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function ClientDetailPage({ params }) {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchClientData();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchClientData = async () => {
    try {
      const [clientRes, quotesRes, jobsRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/quotes?client_id=${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/jobs?client_id=${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const clientData = await clientRes.json();
      const quotesData = await quotesRes.json();
      const jobsData = await jobsRes.json();
      
      setClient(clientData);
      setQuotes(Array.isArray(quotesData) ? quotesData : (quotesData.data || []));
      setJobs(Array.isArray(jobsData) ? jobsData : (jobsData.data || []));
      setFormData(clientData);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setEditing(false);
        fetchClientData();
        alert('Client updated successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client');
    }
  };

  const deleteClient = async () => {
    // First check if client has jobs
    if (jobs.length > 0) {
      alert(`Cannot delete "${client?.client_name}". This client has ${jobs.length} active job(s):\n\n${jobs.map(j => j.job_number).join('\n')}\n\nPlease delete or reassign these jobs first.`);
      return;
    }
    
    // Check if client has quotes
    if (quotes.length > 0) {
      alert(`Cannot delete "${client?.client_name}". This client has ${quotes.length} active quote(s):\n\n${quotes.map(q => q.quote_number).join('\n')}\n\nPlease delete or reassign these quotes first.`);
      return;
    }
    
    // Confirm deletion
    if (!confirm(`Delete client "${client?.client_name}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const res = await fetch(`/api/clients/${params.id}`, { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(`Client "${client?.client_name}" deleted successfully!`);
        router.push('/clients');
      } else {
        alert(data.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading client details...</p>
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

  if (!client) {
    return (
      <div className="container">
        <div className="empty-state">Client not found</div>
        <Link href="/clients" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>← Back to Clients</Link>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link href="/clients" className="back-link">← Back to Clients</Link>
          <div className="header-title">
            <h1>{client.client_name}</h1>
            {client.contact_person && <p className="contact">{client.contact_person}</p>}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setEditing(!editing)} className="btn-edit">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button 
            onClick={deleteClient} 
            disabled={deleting || jobs.length > 0 || quotes.length > 0}
            className={`btn-delete ${(jobs.length > 0 || quotes.length > 0) ? 'btn-delete-disabled' : ''}`}
            title={jobs.length > 0 ? `Cannot delete: Has ${jobs.length} job(s)` : quotes.length > 0 ? `Cannot delete: Has ${quotes.length} quote(s)` : 'Delete client'}
          >
            {deleting ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </div>

      {/* Client Information Card */}
      <div className="card">
        <h3>Client Information</h3>
        {editing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Client Name</label>
              <input 
                type="text"
                value={formData.client_name || ''} 
                onChange={e => setFormData({...formData, client_name: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input 
                type="text"
                value={formData.contact_person || ''} 
                onChange={e => setFormData({...formData, contact_person: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email"
                value={formData.email || ''} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="text"
                value={formData.phone || ''} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea 
                value={formData.client_address || ''} 
                onChange={e => setFormData({...formData, client_address: e.target.value})} 
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Signup Date</label>
              <input 
                type="date"
                value={formData.signup_date || ''} 
                onChange={e => setFormData({...formData, signup_date: e.target.value})} 
              />
            </div>
            <button onClick={updateClient} className="btn-primary">Save Changes</button>
          </div>
        ) : (
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Email:</span>
              <span>{client.email || '-'}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone:</span>
              <span>{client.phone || '-'}</span>
            </div>
            <div className="info-item full-width">
              <span className="label">Address:</span>
              <span>{client.client_address || '-'}</span>
            </div>
            <div className="info-item">
              <span className="label">Signed Up:</span>
              <span>{formatDate(client.signup_date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Jobs:</span>
              <span>{jobs.length}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Quotes:</span>
              <span>{quotes.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Warning if client has records */}
      {(jobs.length > 0 || quotes.length > 0) && (
        <div className="warning-card">
          <h4>⚠️ Cannot Delete This Client</h4>
          <p>This client has existing records that prevent deletion:</p>
          <ul>
            {jobs.length > 0 && <li>• {jobs.length} active job(s): {jobs.map(j => j.job_number).join(', ')}</li>}
            {quotes.length > 0 && <li>• {quotes.length} active quote(s): {quotes.map(q => q.quote_number).join(', ')}</li>}
          </ul>
          <p className="warning-note">Please delete or reassign these records before deleting the client.</p>
        </div>
      )}

      {/* Quotes Section */}
      <div className="section">
        <div className="section-header">
          <h3>💰 Quotes ({quotes.length})</h3>
          <Link href={`/quotes/new?client_id=${client.id}`} className="btn-small">+ New Quote</Link>
        </div>
        {quotes.length === 0 ? (
          <div className="empty-state">No quotes yet. Click "New Quote" to create one.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => (
                  <tr key={quote.id}>
                    <td className="quote-number">{quote.quote_number}</td>
                    <td className="quote-date">{formatDate(quote.quote_date)}</td>
                    <td className="quote-amount">{formatCurrency(quote.total_amount)}</td>
                    <td className="quote-status">
                      <span className={`status-badge status-${quote.status}`}>{quote.status}</span>
                    </td>
                    <td className="quote-actions">
                      <Link href={`/quotes/${quote.id}`} className="action-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Jobs Section */}
      <div className="section">
        <div className="section-header">
          <h3>📋 Jobs ({jobs.length})</h3>
          <Link href={`/jobs/new?client_id=${client.id}`} className="btn-small">+ New Job</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="empty-state">No jobs yet. Click "New Job" to create one.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job #</th>
                  <th>PO Number</th>
                  <th>PO Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td className="job-number">{job.job_number}</td>
                    <td className="job-po">{job.po_number || '-'}</td>
                    <td className="job-amount">{formatCurrency(job.po_amount)}</td>
                    <td className="job-status">
                      <span className={`status-badge status-${job.po_status}`}>{job.po_status}</span>
                    </td>
                    <td className="job-actions">
                      <Link href={`/jobs/${job.id}`} className="action-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .back-link {
          color: #64748b;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        .back-link:hover {
          color: #22c55e;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .header-title h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #1e293b;
        }
        .contact {
          color: #64748b;
          margin: 0.25rem 0 0 0;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }
        .warning-card {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .warning-card h4 {
          margin: 0 0 0.5rem 0;
          color: #92400e;
        }
        .warning-card p {
          margin: 0 0 0.5rem 0;
          color: #78350f;
        }
        .warning-card ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #78350f;
        }
        .warning-note {
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        .section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .section-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .info-item {
          display: flex;
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-item .label {
          width: 100px;
          font-weight: 500;
          color: #64748b;
        }
        .info-item span:last-child {
          color: #1e293b;
        }
        .full-width {
          grid-column: span 2;
        }
        .edit-form .form-group {
          margin-bottom: 1rem;
        }
        .edit-form label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
        }
        .edit-form input,
        .edit-form textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background: white;
          color: #1e293b;
        }
        .btn-primary {
          background: #22c55e;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-edit {
          background: #10b981;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-delete {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-delete-disabled {
          background: #fca5a5;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .btn-delete:hover:not(:disabled) {
          background: #dc2626;
        }
        .btn-small {
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.75rem;
        }
        .table-container {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th,
        .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .data-table th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
        }
        .data-table td {
          color: #1e293b;
        }
        .action-link {
          color: #22c55e;
          text-decoration: none;
          font-size: 0.75rem;
        }
        .action-link:hover {
          text-decoration: underline;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-draft { background: #f3f4f6; color: #4b5563; }
        .quote-number, .job-number {
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
          .header-actions {
            flex-direction: column;
            width: 100%;
          }
          .btn-edit, .btn-delete {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}