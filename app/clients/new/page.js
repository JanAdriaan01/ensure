'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    contact_person: '',
    client_address: '',
    signup_date: new Date().toISOString().split('T')[0],
    email: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      router.push('/clients');
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to create client');
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
          <Link href="/clients" className="back-link">← Back to Clients</Link>
          <h1>➕ Add New Client</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="client-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Client Name *</label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              required
              placeholder="e.g., ABC Corporation"
            />
          </div>

          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="Full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@company.com"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+27 12 345 6789"
            />
          </div>

          <div className="form-group">
            <label>Signup Date</label>
            <input
              type="date"
              name="signup_date"
              value={formData.signup_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Client Address</label>
            <textarea
              name="client_address"
              value={formData.client_address}
              onChange={handleChange}
              rows="3"
              placeholder="Street address, city, postal code"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <Link href="/clients" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2rem; }
        .back-link { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; }
        .back-link:hover { color: #2563eb; }
        .page-header h1 { margin: 0; }
        .client-form { background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .full-width { grid-column: span 2; }
        .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 500; font-size: 0.875rem; color: #374151; }
        .form-group input, .form-group textarea { width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; ring: 2px solid #2563eb; }
        .form-actions { display: flex; gap: 1rem; justify-content: flex-end; }
        .btn-primary { background: #2563eb; color: white; padding: 0.625rem 1.25rem; border-radius: 0.375rem; border: none; cursor: pointer; font-weight: 500; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.625rem 1.25rem; border-radius: 0.375rem; text-decoration: none; }
        .btn-secondary:hover { background: #4b5563; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } .container { padding: 1rem; } }
      `}</style>
    </div>
  );
}