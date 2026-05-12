// app/organizations/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchData();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchData = async () => {
    try {
      const [orgRes, sitesRes, clientsRes] = await Promise.all([
        fetch(`/api/organizations/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/client-sites?organization_id=${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/clients?organization_id=${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const orgData = await orgRes.json();
      const sitesData = await sitesRes.json();
      const clientsData = await clientsRes.json();
      
      setOrganization(orgData);
      setSites(sitesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading organization details...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container">
        <h1>Organization Not Found</h1>
        <Link href="/organizations" className="btn-primary">Back to Organizations</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link href="/organizations" className="back-link">← Back to Organizations</Link>
          <h1>{organization.organization_name}</h1>
          {organization.organization_type && <p className="type-badge">{organization.organization_type}</p>}
        </div>
        <div className="header-actions">
          <Link href={`/organizations/${organization.id}/edit`} className="btn-edit">Edit Organization</Link>
          <Link href={`/client-sites/new?organization_id=${organization.id}`} className="btn-primary">+ Add Site</Link>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h3>Basic Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Registration Number:</span>
            <span>{organization.registration_number || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">VAT Number:</span>
            <span>{organization.vat_number || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Tax Number:</span>
            <span>{organization.tax_number || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span>{organization.email || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Phone:</span>
            <span>{organization.phone || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Website:</span>
            <span>{organization.website || '-'}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card">
        <h3>Address</h3>
        <div className="address">
          <p>{organization.address_line1 || '-'}</p>
          {organization.address_line2 && <p>{organization.address_line2}</p>}
          <p>{[organization.city, organization.postal_code].filter(Boolean).join(', ')}</p>
          <p>{organization.country || '-'}</p>
        </div>
      </div>

      {/* Bank Details */}
      <div className="card">
        <h3>Bank Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Bank Name:</span>
            <span>{organization.bank_name || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Account Number:</span>
            <span>{organization.bank_account_number || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Account Type:</span>
            <span>{organization.bank_account_type || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Branch Code:</span>
            <span>{organization.bank_branch_code || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">SWIFT Code:</span>
            <span>{organization.bank_swift_code || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">IBAN:</span>
            <span>{organization.bank_iban || '-'}</span>
          </div>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="card">
        <h3>Billing Settings</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Billing Email:</span>
            <span>{organization.billing_email || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Billing Phone:</span>
            <span>{organization.billing_phone || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">Payment Terms:</span>
            <span>{organization.payment_terms || 30} days</span>
          </div>
          <div className="info-item">
            <span className="label">Credit Limit:</span>
            <span>{formatCurrency(organization.credit_limit)}</span>
          </div>
        </div>
        {organization.billing_address && (
          <div className="billing-address">
            <strong>Billing Address:</strong>
            <p>{organization.billing_address}</p>
          </div>
        )}
      </div>

      {/* Client Sites */}
      <div className="section">
        <div className="section-header">
          <h3>📍 Client Sites ({sites.length})</h3>
          <Link href={`/client-sites/new?organization_id=${organization.id}`} className="btn-small">+ Add Site</Link>
        </div>
        {sites.length === 0 ? (
          <div className="empty-state">No sites yet. Click "Add Site" to create one.</div>
        ) : (
          <div className="sites-grid">
            {sites.map(site => (
              <div key={site.id} className="site-card">
                <div className="site-header">
                  <h4>{site.site_name}</h4>
                  {site.is_primary && <span className="primary-badge">Primary</span>}
                </div>
                {site.site_type && <p className="site-type">{site.site_type}</p>}
                {site.contact_person && <p>Contact: {site.contact_person}</p>}
                {site.email && <p>Email: {site.email}</p>}
                {site.phone && <p>Phone: {site.phone}</p>}
                {site.site_address && <p className="site-address">{site.site_address}</p>}
                <div className="site-actions">
                  <Link href={`/client-sites/${site.id}`} className="view-link">View Details</Link>
                  <Link href={`/client-sites/${site.id}/edit`} className="edit-link">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clients */}
      <div className="section">
        <div className="section-header">
          <h3>👥 Clients ({clients.length})</h3>
          <Link href={`/clients/new?organization_id=${organization.id}`} className="btn-small">+ Add Client</Link>
        </div>
        {clients.length === 0 ? (
          <div className="empty-state">No clients yet. Click "Add Client" to create one.</div>
        ) : (
          <div className="clients-grid">
            {clients.map(client => (
              <div key={client.id} className="client-card">
                <h4>{client.first_name} {client.last_name}</h4>
                {client.job_title && <p>{client.job_title}</p>}
                {client.email && <p>📧 {client.email}</p>}
                {client.phone && <p>📞 {client.phone}</p>}
                <Link href={`/clients/${client.id}`} className="view-link">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {organization.notes && (
        <div className="card">
          <h3>Notes</h3>
          <p>{organization.notes}</p>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .back-link { color: #64748b; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; font-size: 0.875rem; }
        .back-link:hover { color: #22c55e; }
        .page-header h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .type-badge { display: inline-block; background: #e2e8f0; color: #64748b; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-top: 0.5rem; }
        .header-actions { display: flex; gap: 0.75rem; }
        .btn-edit { background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; }
        .btn-primary { background: #22c55e; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; }
        .btn-small { background: #22c55e; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.75rem; }
        .card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; }
        .card h3 { margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        .info-item { display: flex; padding: 0.5rem; border-bottom: 1px solid #f1f5f9; }
        .info-item .label { width: 140px; font-weight: 500; color: #64748b; }
        .info-item span:last-child { color: #1e293b; }
        .address p { margin: 0.25rem 0; color: #1e293b; }
        .billing-address { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
        .billing-address strong { font-size: 0.75rem; color: #64748b; }
        .billing-address p { margin: 0.25rem 0 0; color: #1e293b; }
        .section { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .section-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
        .sites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .site-card { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; }
        .site-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .site-header h4 { margin: 0; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
        .primary-badge { background: #22c55e; color: white; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.6rem; }
        .site-type { font-size: 0.7rem; color: #22c55e; margin-bottom: 0.5rem; }
        .site-address { font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; }
        .site-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #e2e8f0; }
        .clients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .client-card { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; }
        .client-card h4 { margin: 0 0 0.25rem; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
        .client-card p { margin: 0.25rem 0; font-size: 0.75rem; color: #64748b; }
        .view-link, .edit-link { font-size: 0.7rem; text-decoration: none; }
        .view-link { color: #22c55e; }
        .edit-link { color: #3b82f6; }
        .empty-state { text-align: center; padding: 2rem; color: #64748b; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #22c55e; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .container { padding: 1rem; }
          .info-grid { grid-template-columns: 1fr; }
          .sites-grid, .clients-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}