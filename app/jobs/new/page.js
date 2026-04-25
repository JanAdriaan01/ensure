'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetClientId = searchParams.get('client_id');
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    lc_number: '',
    po_status: 'pending',
    completion_status: 'not_started',
    client_id: presetClientId || '',
    total_budget: ''
  });

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const jobData = {
      lc_number: formData.lc_number,
      po_status: formData.po_status,
      completion_status: 'not_started',
      monthly_work_done: 0,
      client_id: formData.client_id || null,
      total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null
    };
    
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    
    if (res.ok) {
      const newJob = await res.json();
      router.push(`/jobs/${newJob.id}`);
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to create job');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link href="/jobs" className="back-link">← Back to Jobs</Link>
          <h1>➕ Create New Job</h1>
          <p>Enter project details to get started</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-grid">
          <div className="form-group">
            <label>LC Number (Job Number) *</label>
            <input
              type="text"
              name="lc_number"
              value={formData.lc_number}
              onChange={handleChange}
              required
              placeholder="e.g., LC-2024-001"
            />
          </div>

          <div className="form-group">
            <label>Client</label>
            <select name="client_id" value={formData.client_id} onChange={handleChange}>
              <option value="">-- Select Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>PO Status</label>
            <select name="po_status" value={formData.po_status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label>Total Budget ($)</label>
            <input
              type="number"
              step="0.01"
              name="total_budget"
              value={formData.total_budget}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Job'}
          </button>
          <Link href="/jobs" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2rem; }
        .back-link { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; }
        .back-link:hover { color: #2563eb; }
        .page-header h1 { margin: 0; }
        .page-header p { color: #6b7280; margin: 0.25rem 0 0 0; }
        
        .job-form { background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 500; font-size: 0.875rem; color: #374151; }
        .form-group input, .form-group select { width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #2563eb; }
        
        .form-actions { display: flex; gap: 1rem; justify-content: flex-end; }
        .btn-primary { background: #2563eb; color: white; padding: 0.625rem 1.25rem; border-radius: 0.375rem; border: none; cursor: pointer; font-weight: 500; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.625rem 1.25rem; border-radius: 0.375rem; text-decoration: none; }
        .btn-secondary:hover { background: #4b5563; }
        
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .container { padding: 1rem; } }
      `}</style>
    </div>
  );
}