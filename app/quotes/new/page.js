'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Component that uses useSearchParams - must be wrapped in Suspense
function NewQuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetClientId = searchParams.get('client_id');
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    quote_number: '',
    client_id: presetClientId || '',
    job_number: '',
    quote_date: new Date().toISOString().split('T')[0],
    quote_amount: '',
    currency: 'USD',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
    fetchJobs();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data.filter(j => j.completion_status !== 'completed') : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const quoteData = {
      quote_number: formData.quote_number,
      client_id: formData.client_id || null,
      job_number: formData.job_number || null,
      quote_date: formData.quote_date,
      quote_amount: parseFloat(formData.quote_amount),
      currency: formData.currency,
      status: formData.status,
      notes: formData.notes
    };
    
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    
    if (res.ok) {
      const newQuote = await res.json();
      router.push(`/quotes/${newQuote.id}`);
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to create quote');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q-${year}-${random}`;
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link href="/quotes" className="back-link">← Back to Quotes</Link>
          <h1>➕ Create New Quote</h1>
          <p>Generate a quote for a client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="quote-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Quote Number *</label>
            <div className="input-with-hint">
              <input
                type="text"
                name="quote_number"
                value={formData.quote_number}
                onChange={handleChange}
                required
                placeholder="e.g., Q-2024-001"
              />
              <button type="button" onClick={() => setFormData({...formData, quote_number: generateQuoteNumber()})} className="btn-generate">
                Generate
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Client *</label>
            <select name="client_id" value={formData.client_id} onChange={handleChange} required>
              <option value="">-- Select Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Related Job (Optional)</label>
            <select name="job_number" value={formData.job_number} onChange={handleChange}>
              <option value="">-- No Job Linked --</option>
              {jobs.map(job => (
                <option key={job.id} value={job.lc_number}>
                  {job.lc_number} - {job.completion_status?.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quote Date *</label>
            <input
              type="date"
              name="quote_date"
              value={formData.quote_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Quote Amount *</label>
            <div className="amount-input">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                step="0.01"
                name="quote_amount"
                value={formData.quote_amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="ZAR">ZAR (R)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Scope of work, payment terms, validity period..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Quote'}
          </button>
          <Link href="/quotes" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2rem; }
        .back-link { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; }
        .back-link:hover { color: #2563eb; }
        .page-header h1 { margin: 0; }
        .page-header p { color: #6b7280; margin: 0.25rem 0 0 0; }
        
        .quote-form { background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .full-width { grid-column: span 2; }
        .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 500; font-size: 0.875rem; color: #374151; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
        
        .input-with-hint { display: flex; gap: 0.5rem; }
        .input-with-hint input { flex: 1; }
        .btn-generate { background: #f3f4f6; border: 1px solid #d1d5db; padding: 0.625rem 1rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; white-space: nowrap; }
        
        .amount-input { display: flex; align-items: center; gap: 0.25rem; }
        .currency-symbol { background: #f3f4f6; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem 0 0 0.375rem; font-weight: 500; }
        .amount-input input { border-radius: 0 0.375rem 0.375rem 0; }
        
        .form-actions { display: flex; gap: 1rem; justify-content: flex-end; }
        .btn-primary { background: #2563eb; color: white; padding: 0.625rem 1.25rem; border-radius: 0.375rem; border: none; cursor: pointer; font-weight: 500; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.625rem 1.25rem; border-radius: 0.375rem; text-decoration: none; }
        
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } .container { padding: 1rem; } }
      `}</style>
    </div>
  );
}

// Main page component with Suspense boundary
export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <NewQuoteForm />
    </Suspense>
  );
}