// app/client-sites/[id]/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function EditClientSitePage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  
  const [formData, setFormData] = useState({
    id: '',
    organization_id: '',
    site_name: '',
    contact_person: '',
    email: '',
    phone: '',
    site_address: '',
    city: '',
    postal_code: '',
    is_primary: false
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrganizations();
      fetchSite();
    }
  }, [isAuthenticated, token]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/client-sites/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFormData({
        id: data.id,
        organization_id: data.organization_id,
        site_name: data.site_name || '',
        contact_person: data.contact_person || '',
        email: data.email || '',
        phone: data.phone || '',
        site_address: data.site_address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        is_primary: data.is_primary || false
      });
    } catch (error) {
      console.error('Error fetching site:', error);
      setError('Failed to load site data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.organization_id) {
      setError('Please select an organization');
      return;
    }
    
    if (!formData.site_name || formData.site_name.trim() === '') {
      setError('Site name is required');
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/client-sites', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/client-sites');
      } else {
        setError(data.error || 'Failed to update client site');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading site data...</p>
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

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <Link href="/client-sites" className="back-link">← Back to Client Sites</Link>
          <h1>Edit Client Site</h1>
          <p>Update site information</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Organization *</label>
          <select
            name="organization_id"
            value={formData.organization_id}
            onChange={handleChange}
            required
            disabled
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <option value="">-- Select an Organization --</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.organization_name}
              </option>
            ))}
          </select>
          <small className="field-note">Organization cannot be changed after creation</small>
        </div>

        <div className="form-group">
          <label>Site Name *</label>
          <input
            type="text"
            name="site_name"
            value={formData.site_name}
            onChange={handleChange}
            required
            placeholder="e.g., Johannesburg Branch"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="Site contact name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="site@company.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+27 11 123 4567"
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleChange}
              />
              Mark as primary site for this organization
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="site_address"
            value={formData.site_address}
            onChange={handleChange}
            rows="2"
            placeholder="Street address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="Postal code"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/client-sites" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .form-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
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
        .page-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }
        .page-header p {
          margin: 0.25rem 0 0;
          color: #64748b;
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
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
        }
        .field-note {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          display: block;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
          color: #1e293b;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          text-transform: none;
          margin-top: 0.375rem;
        }
        .checkbox-label input {
          width: auto;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
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
        }
        .btn-primary:hover {
          background: #16a34a;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #64748b;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
        }
        .btn-secondary:hover {
          background: #475569;
        }
        @media (max-width: 640px) {
          .form-container {
            padding: 1rem;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-actions {
            flex-direction: column;
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