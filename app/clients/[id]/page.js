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
  const [assignedSites, setAssignedSites] = useState([]);
  const [availableSites, setAvailableSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedSites, setSelectedSites] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [sitesLoading, setSitesLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchClientData();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch client details
      const clientRes = await fetch(`/api/clients/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (clientRes.status === 404) {
        setError('Client not found');
        setLoading(false);
        return;
      }
      
      if (!clientRes.ok) {
        throw new Error(`HTTP ${clientRes.status}`);
      }
      
      const clientData = await clientRes.json();
      
      if (clientData.error) {
        setError(clientData.error);
        setLoading(false);
        return;
      }
      
      setClient(clientData);
      setFormData(clientData);
      
      // Fetch assigned sites for this client
      const assignedRes = await fetch(`/api/client-site-assignments?client_id=${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const assignedData = await assignedRes.json();
      const assignedSitesList = Array.isArray(assignedData) ? assignedData : [];
      setAssignedSites(assignedSitesList);
      
      // Fetch quotes for this client
      const quotesRes = await fetch(`/api/quotes?client_id=${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const quotesData = await quotesRes.json();
      
      let quotesArray = [];
      if (Array.isArray(quotesData)) {
        quotesArray = quotesData;
      } else if (quotesData.data && Array.isArray(quotesData.data)) {
        quotesArray = quotesData.data;
      } else if (quotesData.success && quotesData.data) {
        quotesArray = quotesData.data;
      }
      setQuotes(quotesArray);
      
      // Fetch jobs for this client
      const jobsRes = await fetch(`/api/jobs?client_id=${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      
      let jobsArray = [];
      if (Array.isArray(jobsData)) {
        jobsArray = jobsData;
      } else if (jobsData.data && Array.isArray(jobsData.data)) {
        jobsArray = jobsData.data;
      } else if (jobsData.success && jobsData.data) {
        jobsArray = jobsData.data;
      }
      setJobs(jobsArray);
      
    } catch (error) {
      console.error('Error fetching client:', error);
      setError('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSitesForOrganization = async (organizationId) => {
    if (!organizationId) return;
    
    setSitesLoading(true);
    try {
      const response = await fetch(`/api/client-sites?organization_id=${organizationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setAvailableSites([]);
    } finally {
      setSitesLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditing(true);
    setSelectedSites(assignedSites.map(site => site.client_site_id));
    if (client?.organization_id) {
      fetchSitesForOrganization(client.organization_id);
    }
  };

  const updateClient = async () => {
    try {
      // Update client info
      const res = await fetch(`/api/clients/${params.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update client');
      }
      
      // Update site assignments
      const assignRes = await fetch('/api/client-site-assignments', {
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
      
      if (!assignRes.ok) {
        console.error('Failed to update site assignments');
      }
      
      setEditing(false);
      await fetchClientData();
      alert('Client updated successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      alert(error.message || 'Failed to update client');
    }
  };

  const deleteClient = async () => {
    if (jobs.length > 0 || quotes.length > 0) {
      alert(`Cannot delete this client. They have ${jobs.length} job(s) and ${quotes.length} quote(s).`);
      return;
    }
    
    if (!confirm(`Delete client "${client?.first_name} ${client?.last_name}"? This action cannot be undone.`)) {
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
        alert('Client deleted successfully!');
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

  const handleSiteToggle = (siteId) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-ZA');
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

  if (error || !client) {
    return (
      <div className="error-container">
        <h2>Client Not Found</h2>
        <p>{error || 'The client you are looking for does not exist.'}</p>
        <Link href="/clients" className="btn-secondary">Back to Clients</Link>
        <style jsx>{`
          .error-container {
            max-width: 600px;
            margin: 4rem auto;
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
          }
          .error-container h2 {
            margin-bottom: 1rem;
            color: #1e293b;
          }
          .error-container p {
            color: #64748b;
            margin-bottom: 1.5rem;
          }
          .btn-secondary {
            background: #64748b;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            display: inline-block;
          }
        `}</style>
      </div>
    );
  }

  const hasRelatedRecords = jobs.length > 0 || quotes.length > 0;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link href="/clients" className="back-link">← Back to Clients</Link>
          <div className="header-title">
            <h1>{client.first_name} {client.last_name}</h1>
            {client.job_title && <p className="contact">{client.job_title}</p>}
            {client.organization_name && <p className="organization">{client.organization_name}</p>}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleEditClick} className="btn-edit">
            Edit
          </button>
          <button 
            onClick={deleteClient} 
            disabled={deleting || hasRelatedRecords}
            className={`btn-delete ${hasRelatedRecords ? 'btn-delete-disabled' : ''}`}
            title={hasRelatedRecords ? `Cannot delete: Has ${jobs.length} job(s) and ${quotes.length} quote(s)` : 'Delete client'}
          >
            {deleting ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </div>

      {hasRelatedRecords && (
        <div className="warning-card">
          <h4>⚠️ Cannot Delete This Client</h4>
          <p>This client has existing records that prevent deletion:</p>
          <ul>
            {jobs.length > 0 && <li>• {jobs.length} active job(s)</li>}
            {quotes.length > 0 && <li>• {quotes.length} active quote(s)</li>}
          </ul>
          <p className="warning-note">Please delete or reassign these records before deleting the client.</p>
        </div>
      )}

      <div className="card">
        <h3>Client Information</h3>
        {editing ? (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input 
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''} 
                  onChange={e => setFormData({...formData, first_name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input 
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''} 
                  onChange={e => setFormData({...formData, last_name: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email || ''} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone || ''} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Mobile</label>
                <input 
                  type="tel"
                  name="mobile"
                  value={formData.mobile || ''} 
                  onChange={e => setFormData({...formData, mobile: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input 
                  type="text"
                  name="job_title"
                  value={formData.job_title || ''} 
                  onChange={e => setFormData({...formData, job_title: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input 
                  type="text"
                  name="department"
                  value={formData.department || ''} 
                  onChange={e => setFormData({...formData, department: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input 
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''} 
                  onChange={e => setFormData({...formData, date_of_birth: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Address Line 1</label>
              <input 
                type="text"
                name="address_line1"
                value={formData.address_line1 || ''} 
                onChange={e => setFormData({...formData, address_line1: e.target.value})} 
              />
            </div>
            <div className="form-group full-width">
              <label>Address Line 2</label>
              <input 
                type="text"
                name="address_line2"
                value={formData.address_line2 || ''} 
                onChange={e => setFormData({...formData, address_line2: e.target.value})} 
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city || ''} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input 
                  type="text"
                  name="postal_code"
                  value={formData.postal_code || ''} 
                  onChange={e => setFormData({...formData, postal_code: e.target.value})} 
                />
              </div>
            </div>
            
            {/* Site Assignments Section */}
            <div className="form-group full-width">
              <label>Assigned Sites</label>
              {sitesLoading ? (
                <div className="sites-loading">Loading sites...</div>
              ) : availableSites.length === 0 ? (
                <div className="no-sites">
                  <p>No sites available for this organization.</p>
                  <Link href="/client-sites/new" className="btn-small">+ Create New Site</Link>
                </div>
              ) : (
                <div className="sites-list">
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
                        {site.site_address && <div className="site-address">{site.site_address}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea 
                name="notes"
                value={formData.notes || ''} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button onClick={updateClient} className="btn-primary">Save Changes</button>
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Full Name:</span>
                <span className="value">{client.first_name} {client.last_name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{client.email || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{client.phone || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Mobile:</span>
                <span className="value">{client.mobile || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Organization:</span>
                <span className="value">{client.organization_name || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Job Title:</span>
                <span className="value">{client.job_title || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Department:</span>
                <span className="value">{client.department || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Date of Birth:</span>
                <span className="value">{formatDate(client.date_of_birth)}</span>
              </div>
              <div className="info-item full-width">
                <span className="label">Address:</span>
                <span className="value">
                  {client.address_line1 && <div>{client.address_line1}</div>}
                  {client.address_line2 && <div>{client.address_line2}</div>}
                  {client.city && <div>{client.city}</div>}
                  {client.postal_code && <div>Postal Code: {client.postal_code}</div>}
                  {!client.address_line1 && !client.city && '-'}
                </span>
              </div>
            </div>
            
            {/* Assigned Sites Display */}
            {assignedSites.length > 0 && (
              <div className="assigned-sites">
                <h4>Assigned Sites</h4>
                <div className="sites-list-display">
                  {assignedSites.map(site => (
                    <div key={site.id} className="assigned-site">
                      <span className="site-name">{site.site_name}</span>
                      {site.site_address && <span className="site-address-display">{site.site_address}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {client.notes && (
              <div className="info-item full-width">
                <span className="label">Notes:</span>
                <span className="value">{client.notes}</span>
              </div>
            )}
          </>
        )}
      </div>

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
                      <span className={`status-badge status-${quote.status}`}>
                        {quote.status?.toUpperCase() || 'DRAFT'}
                      </span>
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
                      <span className={`status-badge status-${job.po_status}`}>
                        {job.po_status?.toUpperCase() || 'PENDING'}
                      </span>
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
          max-width: 1200px;
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
        .contact, .organization {
          color: #64748b;
          margin: 0.25rem 0 0;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .warning-card {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.75rem;
          padding: 1rem 1.5rem;
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
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .assigned-sites {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .assigned-sites h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          color: #1e293b;
        }
        .sites-list-display {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .assigned-site {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 0.5rem;
        }
        .assigned-site .site-name {
          font-weight: 500;
          color: #1e293b;
        }
        .assigned-site .site-address-display {
          font-size: 0.7rem;
          color: #64748b;
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
          gap: 1rem;
        }
        .info-item {
          display: flex;
          padding: 0.5rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .info-item .label {
          width: 120px;
          font-weight: 500;
          color: #64748b;
        }
        .info-item .value {
          flex: 1;
          color: #1e293b;
        }
        .full-width {
          grid-column: span 2;
        }
        .edit-form .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .edit-form .form-group {
          margin-bottom: 1rem;
        }
        .edit-form .full-width {
          grid-column: span 2;
        }
        .edit-form label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
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
        .sites-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem;
        }
        .site-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
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
        .site-address {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
        .sites-loading, .no-sites {
          text-align: center;
          padding: 1rem;
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
          margin-top: 1rem;
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
        }
        .btn-primary:hover {
          background: #16a34a;
        }
        .btn-secondary {
          background: #64748b;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: #475569;
        }
        .btn-edit {
          background: #10b981;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-edit:hover {
          background: #059669;
        }
        .btn-delete {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-delete:hover:not(:disabled) {
          background: #dc2626;
        }
        .btn-delete-disabled {
          background: #fca5a5;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .table-container {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          padding: 0.75rem;
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .data-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
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
          color: #22c55e;
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
          .edit-form .form-row {
            grid-template-columns: 1fr;
          }
          .edit-form .full-width {
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