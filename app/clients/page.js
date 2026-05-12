// app/clients/new/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewClientPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    client_name: '',
    contact_person: '',
    client_address: '',
    email: '',
    phone: '',
    signup_date: new Date().toISOString().split('T')[0]
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="form-container">
        <div className="page-header">
          <h1>Authentication Required</h1>
          <p>Please log in to create clients.</p>
          <Link href="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/clients');
      } else {
        setError(data.error || 'Failed to create client');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <Link href="/clients" className="back-link">← Back to Clients</Link>
          <h1>Add New Client</h1>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="client_name">Client Name *</label>
            <input
              id="client_name"
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              required
              autoComplete="organization"
              placeholder="e.g., ABC Corporation"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact_person">Contact Person</label>
            <input
              id="contact_person"
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="contact@company.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              placeholder="+27 12 345 6789"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="client_address">Address</label>
            <textarea
              id="client_address"
              name="client_address"
              value={formData.client_address}
              onChange={handleChange}
              rows="3"
              autoComplete="street-address"
              placeholder="Street address, city, postal code"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup_date">Signup Date</label>
            <input
              id="signup_date"
              type="date"
              name="signup_date"
              value={formData.signup_date}
              onChange={handleChange}
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
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .back-link {
          color: var(--text-tertiary);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        .back-link:hover {
          color: var(--primary);
        }
        .page-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .form-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 2rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .full-width {
          grid-column: span 2;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: var(--text-muted);
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .btn-primary {
          background: #22c55e;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #16a34a;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--secondary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
          transition: background 0.2s;
        }
        .btn-secondary:hover {
          background: var(--secondary-dark);
        }
        @media (max-width: 640px) {
          .form-container {
            padding: 1rem;
          }
          .form-card {
            padding: 1.5rem;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .full-width {
            grid-column: span 1;
          }
          .form-actions {
            flex-direction: column-reverse;
            gap: 0.75rem;
          }
          .form-actions button,
          .form-actions a {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}