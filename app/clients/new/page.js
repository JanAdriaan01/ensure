// app/clients/new/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewClientPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    organization_id: '',
    job_title: '',
    department: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    date_of_birth: '',
    notes: ''
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
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchSites = async (organizationId) => {
    if (!organizationId) {
      setSites([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/client-sites?organization_id=${organizationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSites(data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const handleOrganizationChange = (e) => {
    const orgId = e.target.value;
    setFormData({ ...formData, organization_id: orgId });
    setSelectedSites([]);
    if (orgId) {
      fetchSites(orgId);
    } else {
      setSites([]);
    }
  };

  const handleSiteToggle = (siteId) => {
    if (selectedSites.includes(siteId)) {
      setSelectedSites(selectedSites.filter(id => id !== siteId));
    } else {
      setSelectedSites([...selectedSites, siteId]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.organization_id) {
      setError('First name, last name, and organization are required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // First, create the client
      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const clientData = await clientRes.json();
      
      if (!clientRes.ok) {
        throw new Error(clientData.error || 'Failed to create client');
      }
      
      const clientId = clientData.id;
      
      // Then, assign sites to the client
      if (selectedSites.length > 0) {
        const assignRes = await fetch('/api/client-site-assignments', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            client_id: clientId,
            site_ids: selectedSites
          })
        });
        
        if (!assignRes.ok) {
          console.error('Failed to assign sites');
        }
      }
      
      router.push('/clients');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <Link href="/clients" className="back-link">← Back to Clients</Link>
          <h1>Add New Client</h1>
          <p>Create a contact person associated with an organization</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
              />
            </div>
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+27 81 234 5678"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Organization & Employment */}
        <div className="form-section">
          <h3>Organization & Employment</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Organization *</label>
              <select
                name="organization_id"
                value={formData.organization_id}
                onChange={handleOrganizationChange}
                required
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g., Project Manager"
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Operations"
              />
            </div>
          </div>
        </div>

        {/* Client Sites Assignment */}
        {sites.length > 0 && (
          <div className="form-section">
            <h3>Associated Sites</h3>
            <p className="section-note">Select the sites this client is associated with</p>
            <div className="sites-grid">
              {sites.map(site => (
                <label key={site.id} className="site-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSites.includes(site.id)}
                    onChange={() => handleSiteToggle(site.id)}
                  />
                  <div>
                    <strong>{site.site_name}</strong>
                    {site.site_type && <span className="site-type">({site.site_type})</span>}
                    {site.site_address && <span className="site-address">{site.site_address}</span>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group full-width">
            <label>Address Line 1</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>
          <div className="form-group full-width">
            <label>Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              placeholder="Apartment, suite, unit, etc."
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
        </div>

        {/* Notes */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          <div className="form-group full-width">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Additional information about this client..."
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
          overflow: hidden;
        }
        .form-section {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .form-section:last-child {
          border-bottom: none;
        }
        .form-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }
        .section-note {
          font-size: 0.75rem;
          color: #64748b;
          margin: -0.5rem 0 1rem 0;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
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
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
        .sites-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.75rem;
        }
        .site-checkbox {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: background 0.2s;
        }
        .site-checkbox:hover {
          background: #f8fafc;
        }
        .site-checkbox input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .site-checkbox div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .site-checkbox strong {
          font-size: 0.875rem;
          color: #1e293b;
        }
        .site-type {
          font-size: 0.7rem;
          color: #22c55e;
          margin-left: 0.5rem;
        }
        .site-address {
          font-size: 0.7rem;
          color: #64748b;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          background: #f8fafc;
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
          background: #64748b;
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
          background: #475569;
        }
        @media (max-width: 640px) {
          .form-container {
            padding: 1rem;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
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