'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function QuoteDetailPage({ params }) {
  const router = useRouter();
  const [quote, setQuote] = useState(null);
  const [client, setClient] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchQuoteData();
  }, [params.id]);

  const fetchQuoteData = async () => {
    try {
      const res = await fetch(`/api/quotes/${params.id}`);
      const data = await res.json();
      setQuote(data);
      setFormData(data);
      
      // Fetch client details
      if (data.client_id) {
        const clientRes = await fetch(`/api/clients/${data.client_id}`);
        setClient(await clientRes.json());
      }
      
      // Fetch job details if linked
      if (data.job_number) {
        const jobsRes = await fetch('/api/jobs');
        const jobs = await jobsRes.json();
        const linkedJob = jobs.find(j => j.lc_number === data.job_number);
        setJob(linkedJob);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async () => {
    const res = await fetch(`/api/quotes/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setEditing(false);
      fetchQuoteData();
    } else {
      alert('Failed to update quote');
    }
  };

  const updateStatus = async (newStatus) => {
    const res = await fetch(`/api/quotes/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...quote, status: newStatus })
    });
    
    if (res.ok) {
      fetchQuoteData();
    } else {
      alert('Failed to update status');
    }
  };

  const deleteQuote = async () => {
    if (confirm(`Delete quote "${quote?.quote_number}"?`)) {
      await fetch(`/api/quotes/${params.id}`, { method: 'DELETE' });
      router.push('/quotes');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fef3c7',
      approved: '#d1fae5',
      rejected: '#fee2e2',
      invoiced: '#dbeafe'
    };
    return colors[status] || '#f3f4f6';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#92400e',
      approved: '#065f46',
      rejected: '#991b1b',
      invoiced: '#1e40af'
    };
    return colors[status] || '#374151';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading quote details...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container">
        <div className="error">Quote not found</div>
        <Link href="/quotes" className="btn-secondary">← Back to Quotes</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link href="/quotes" className="back-link">← Back to Quotes</Link>
          <h1>💰 Quote: {quote.quote_number}</h1>
        </div>
        <div className="header-actions">
          <button onClick={() => setEditing(!editing)} className="btn-edit">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={deleteQuote} className="btn-delete">Delete</button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar" style={{ background: getStatusColor(quote.status) }}>
        <span className="status-label">Current Status:</span>
        <span className="status-value" style={{ color: getStatusTextColor(quote.status) }}>
          {quote.status?.toUpperCase()}
        </span>
        <div className="status-actions">
          {quote.status !== 'approved' && (
            <button onClick={() => updateStatus('approved')} className="status-btn approve">✓ Approve</button>
          )}
          {quote.status !== 'rejected' && (
            <button onClick={() => updateStatus('rejected')} className="status-btn reject">✗ Reject</button>
          )}
          {quote.status !== 'invoiced' && quote.status === 'approved' && (
            <button onClick={() => updateStatus('invoiced')} className="status-btn invoice">📄 Mark Invoiced</button>
          )}
        </div>
      </div>

      {/* Quote Details Card */}
      <div className="detail-card">
        <h3>Quote Information</h3>
        {editing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Quote Number</label>
              <input value={formData.quote_number} onChange={e => setFormData({...formData, quote_number: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Quote Date</label>
              <input type="date" value={formData.quote_date?.split('T')[0]} onChange={e => setFormData({...formData, quote_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Quote Amount</label>
              <input type="number" step="0.01" value={formData.quote_amount} onChange={e => setFormData({...formData, quote_amount: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} rows="3" />
            </div>
            <button onClick={updateQuote} className="btn-primary">Save Changes</button>
          </div>
        ) : (
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Quote Number:</span>
              <span className="value">{quote.quote_number}</span>
            </div>
            <div className="detail-item">
              <span className="label">Quote Date:</span>
              <span className="value">{new Date(quote.quote_date).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Amount:</span>
              <span className="value amount">{quote.currency} {quote.quote_amount?.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`status-badge status-${quote.status}`}>{quote.status}</span>
            </div>
            {quote.notes && (
              <div className="detail-item full-width">
                <span className="label">Notes:</span>
                <span className="value">{quote.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client Information */}
      <div className="detail-card">
        <h3>🏢 Client Information</h3>
        {client ? (
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Client Name:</span>
              <Link href={`/clients/${client.id}`} className="client-link">{client.client_name}</Link>
            </div>
            <div className="detail-item">
              <span className="label">Contact Person:</span>
              <span className="value">{client.contact_person || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email:</span>
              <span className="value">{client.email || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Phone:</span>
              <span className="value">{client.phone || '-'}</span>
            </div>
            {client.client_address && (
              <div className="detail-item full-width">
                <span className="label">Address:</span>
                <span className="value">{client.client_address}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="no-data">No client linked to this quote.</p>
        )}
      </div>

      {/* Linked Job Information */}
      {job && (
        <div className="detail-card">
          <h3>📋 Linked Job</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Job Number:</span>
              <Link href={`/jobs/${job.id}`} className="job-link">{job.lc_number}</Link>
            </div>
            <div className="detail-item">
              <span className="label">PO Status:</span>
              <span className={`status-badge status-${job.po_status}`}>{job.po_status}</span>
            </div>
            <div className="detail-item">
              <span className="label">Completion:</span>
              <span className={`status-badge status-${job.completion_status?.replace('_', '-')}`}>{job.completion_status}</span>
            </div>
            <div className="detail-item">
              <span className="label">Total Hours:</span>
              <span className="value">{Math.round(job.total_hours || 0)} hrs</span>
            </div>
          </div>
        </div>
      )}

      {/* Quote Actions */}
      <div className="action-buttons">
        {quote.status === 'approved' && !quote.job_number && (
          <Link href={`/jobs/new?quote_id=${quote.id}`} className="btn-primary">
            Convert to Job →
          </Link>
        )}
        <button onClick={() => window.print()} className="btn-secondary">
          🖨️ Print Quote
        </button>
      </div>

      <style jsx>{`
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .back-link { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; }
        .back-link:hover { color: #2563eb; }
        .page-header h1 { margin: 0; }
        .header-actions { display: flex; gap: 0.75rem; }
        
        .status-bar { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; border-radius: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .status-label { font-weight: 600; font-size: 0.875rem; }
        .status-value { font-weight: bold; font-size: 1rem; }
        .status-actions { display: flex; gap: 0.5rem; margin-left: auto; }
        .status-btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; font-weight: 500; }
        .status-btn.approve { background: #10b981; color: white; }
        .status-btn.reject { background: #ef4444; color: white; }
        .status-btn.invoice { background: #2563eb; color: white; }
        
        .detail-card { background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .detail-card h3 { margin: 0 0 1rem 0; font-size: 1rem; }
        
        .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .detail-item { display: flex; padding: 0.5rem; border-bottom: 1px solid #f3f4f6; }
        .detail-item .label { width: 120px; font-weight: 500; color: #6b7280; font-size: 0.875rem; }
        .detail-item .value { flex: 1; font-size: 0.875rem; }
        .detail-item .value.amount { font-weight: bold; color: #111827; font-size: 1rem; }
        .full-width { grid-column: span 2; }
        
        .client-link, .job-link { color: #2563eb; text-decoration: none; }
        .client-link:hover, .job-link:hover { text-decoration: underline; }
        
        .edit-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .edit-form .form-group { margin-bottom: 0; }
        .edit-form .full-width { grid-column: span 2; }
        .edit-form label { display: block; margin-bottom: 0.25rem; font-size: 0.75rem; font-weight: 500; color: #6b7280; }
        .edit-form input, .edit-form select, .edit-form textarea { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.375rem; font-size: 0.875rem; }
        
        .action-buttons { display: flex; gap: 1rem; margin-top: 1rem; }
        
        .btn-primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; border: none; cursor: pointer; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; border: none; cursor: pointer; }
        .btn-edit { background: #10b981; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
        .btn-delete { background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
        
        .status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-invoiced { background: #dbeafe; color: #1e40af; }
        
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .no-data { text-align: center; padding: 2rem; color: #6b7280; }
        .error { text-align: center; padding: 2rem; color: #ef4444; }
        
        @media (max-width: 768px) { .container { padding: 1rem; } .details-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } .edit-form { grid-template-columns: 1fr; } .edit-form .full-width { grid-column: span 1; } .status-actions { margin-left: 0; width: 100%; } }
      `}</style>
    </div>
  );
}