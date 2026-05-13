// app/client-sites/new/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewClientSitePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  
  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.organization_id) {
      setError('Please select an organization');
      return;
    }
    
    if (!formData.site_name) {
      setError('Site name is required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/client-sites', {
        method: 'POST',
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
        setError(data.error || 'Failed to create client site');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h1>Authentication Required</h1>
        <p>Please log in to create client sites.</p>
        <Link href="/login" style={{ background: '#22c55e', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', display: 'inline-block' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/client-sites" style={{ color: '#64748b', textDecoration: 'none', display: 'inline-block', marginBottom: '0.5rem' }}>← Back to Client Sites</Link>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Create New Client Site</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Add a branch location under an organization</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Organization *</label>
          <select
            name="organization_id"
            value={formData.organization_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
          >
            <option value="">-- Select an Organization --</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.organization_name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Site Name *</label>
          <input
            type="text"
            name="site_name"
            value={formData.site_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            placeholder="e.g., Johannesburg Branch"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            placeholder="Site contact name"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            placeholder="site@company.com"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            placeholder="+27 11 123 4567"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Address</label>
          <textarea
            name="site_address"
            value={formData.site_address}
            onChange={handleChange}
            rows="2"
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            placeholder="Street address"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            placeholder="City"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Postal Code</label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            placeholder="Postal code"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
            />
            Mark as primary site for this organization
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <button type="submit" disabled={loading} style={{ background: '#22c55e', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
            {loading ? 'Creating...' : 'Create Client Site'}
          </button>
          <Link href="/client-sites" style={{ background: '#64748b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}