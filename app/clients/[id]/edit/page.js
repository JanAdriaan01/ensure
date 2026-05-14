// app/clients/[id]/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [availableSites, setAvailableSites] = useState([]);
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
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [clientRes, orgsRes, sitesRes, assignedRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/organizations', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/client-sites', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/client-site-assignments?client_id=${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const clientData = await clientRes.json();
      const orgsData = await orgsRes.json();
      const sitesData = await sitesRes.json();
      const assignedData = await assignedRes.json();
      
      setFormData({
        first_name: clientData.first_name || '',
        last_name: clientData.last_name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        mobile: clientData.mobile || '',
        organization_id: clientData.organization_id || '',
        job_title: clientData.job_title || '',
        department: clientData.department || '',
        address_line1: clientData.address_line1 || '',
        address_line2: clientData.address_line2 || '',
        city: clientData.city || '',
        postal_code: clientData.postal_code || '',
        date_of_birth: clientData.date_of_birth || '',
        notes: clientData.notes || ''
      });
      
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);
      setAvailableSites(Array.isArray(sitesData) ? sitesData : []);
      
      // Set selected sites from assignments
      const assignedSiteIds = (Array.isArray(assignedData) ? assignedData : []).map(a => a.client_site_id);
      setSelectedSites(assignedSiteIds);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationChange = async (e) => {
    const orgId = e.target.value;
    setFormData(prev => ({ ...prev, organization_id: orgId }));
    
    // Fetch sites for this organization
    if (orgId) {
      try {
        const response = await fetch(`/api/client-sites?organization_id=${orgId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setAvailableSites(Array.isArray(data) ? data : []);
        setSelectedSites([]); // Clear selected sites when organization changes
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    } else {
      setAvailableSites([]);
      setSelectedSites([]);
    }
  };

  const handleSiteToggle = (siteId) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name) {
      setError('First name and last name are required');
      return;
    }
    
    if (!formData.organization_id) {
      setError('Please select an organization');
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      // Update client
      const clientResponse = await fetch(`/api/clients/${params.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(errorData.error || 'Failed to update client');
      }
      
      // Update site assignments
      const assignmentsResponse = await fetch('/api/client-site-assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          client_id: parseInt(params.id),
          site_ids: selectedSites
        })
      });
      
      if (!assignmentsResponse.ok) {
        console.error('Failed to update site assignments');
      }
      
      router.push(`/clients/${params.id}`);
    } catch (error) {
      console.error('Error updating client:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading client data...</p>
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
          <Link href={`/clients/${params.id}`} className="back-link">← Back to Client</Link>
          <h1>Edit Client</h1>
          <p>Update client information and site assignments</p>
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
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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

        {/* Employment Information */}
        <div className="form-section">
          <h3>Employment Information</h3>
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
          <div className="form-row">
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Site Assignments */}
        <div className="form-section">
          <h3>Site Assignments</h3>
          <p className="section-note">Select the sites this client is associated with</p>
          {availableSites.length === 0 ? (
            <div className="empty-sites">
              <p>No sites available for this organization.</p>
              <Link href="/client-sites/new" className="btn-small">+ Create New Site</Link>
            </div>
          ) : (
            <div className="sites-grid">
              {availableSites.map(site => (
                <label key={site.id} className="site-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSites.includes(site.id)}
                    onChange={() => handleSiteToggle(site.id)}
                  />
                  <div className="site-info">
                    <strong>{site.site_name}</strong>
                    {site.site_type && <span className="site-type">({site.site_type})</span>}
                    {site.site_address && <span className="site-address">{site.site_address}</span>}
                    {site.contact_person && <span className="site-contact">Contact: {site.contact_person}</span>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group">
            <label>Address Line 1</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
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
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          <div className="form-group">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Additional notes about this client..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/clients/${params.id}`} className="btn-secondary">Cancel</Link>
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
          margin-bottom: 1rem;
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
          margin-bottom: 1rem;
        }
        .form-group label {
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
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
        .sites-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.75rem;
        }
        .site-checkbox {
          display: flex;
          align-items: flex-start;
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
          margin-top: 0.125rem;
        }
        .site-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }
        .site-info strong {
          font-size: 0.875rem;
          color: #1e293b;
        }
        .site-type {
          font-size: 0.7rem;
          color: #22c55e;
          margin-left: 0.5rem;
        }
        .site-address, .site-contact {
          font-size: 0.7rem;
          color: #64748b;
        }
        .empty-sites {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
        .btn-small {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: #22c55e;
          color: white;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.75rem;
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