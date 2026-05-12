// app/organizations/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function OrganizationsPage() {
  const { token, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (id, name) => {
    if (!confirm(`Delete organization "${name}"? This will also delete all associated sites and clients.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchOrganizations();
        alert('Organization deleted successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete organization');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Failed to delete organization');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading organizations...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Organizations</h1>
          <p>Manage parent companies and their billing information</p>
        </div>
        <Link href="/organizations/new" className="btn-primary">+ New Organization</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="organizations-grid">
        {organizations.length === 0 ? (
          <div className="empty-state">
            <p>No organizations found. Create your first organization.</p>
          </div>
        ) : (
          organizations.map(org => (
            <div key={org.id} className="org-card">
              <div className="org-header">
                <h3>{org.organization_name}</h3>
                <div className="org-badges">
                  <span className="site-count">{org.site_count || 0} sites</span>
                  <span className="client-count">{org.client_count || 0} clients</span>
                </div>
              </div>
              <div className="org-details">
                {org.email && <p>📧 {org.email}</p>}
                {org.phone && <p>📞 {org.phone}</p>}
                {org.vat_number && <p>VAT: {org.vat_number}</p>}
              </div>
              <div className="org-actions">
                <Link href={`/organizations/${org.id}`} className="btn-view">View Details</Link>
                <Link href={`/organizations/${org.id}/edit`} className="btn-edit">Edit</Link>
                <button onClick={() => deleteOrganization(org.id, org.organization_name)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.875rem; color: #1e293b; margin: 0; }
        .page-header p { color: #64748b; margin: 0.25rem 0 0; }
        .btn-primary { background: #22c55e; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; }
        .error-message { background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #22c55e; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .organizations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
        .org-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; transition: all 0.2s; }
        .org-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: #22c55e; }
        .org-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .org-header h3 { margin: 0; font-size: 1.125rem; color: #1e293b; }
        .org-badges { display: flex; gap: 0.5rem; }
        .site-count, .client-count { background: #e2e8f0; color: #64748b; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; }
        .org-details p { margin: 0.25rem 0; font-size: 0.875rem; color: #64748b; }
        .org-actions { display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; }
        .btn-view { background: #22c55e; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.75rem; }
        .btn-edit { background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.75rem; }
        .btn-delete { background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; border: none; cursor: pointer; font-size: 0.75rem; }
        .empty-state { text-align: center; padding: 4rem; color: #64748b; }
      `}</style>
    </div>
  );
}