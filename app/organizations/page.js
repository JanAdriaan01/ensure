// app/organizations/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function OrganizationsPage() {
  const { token, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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
          <p>Manage parent companies and their branch locations</p>
        </div>
        <Link href="/organizations/new" className="btn-primary">+ New Organization</Link>
      </div>

      <div className="organizations-grid">
        {organizations.map(org => (
          <div key={org.id} className="org-card">
            <div className="org-header">
              <h3>{org.organization_name}</h3>
              <span className="site-count">{org.site_count || 0} sites</span>
            </div>
            <div className="org-details">
              {org.email && <p>📧 {org.email}</p>}
              {org.phone && <p>📞 {org.phone}</p>}
            </div>
            <div className="org-actions">
              <Link href={`/organizations/${org.id}`} className="btn-view">View Sites</Link>
              <Link href={`/client-sites/new?organization_id=${org.id}`} className="btn-add">+ Add Site</Link>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.875rem; color: #1e293b; margin: 0; }
        .page-header p { color: #64748b; margin: 0; }
        .btn-primary { background: #22c55e; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; }
        .organizations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .org-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; transition: all 0.2s; }
        .org-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: #22c55e; }
        .org-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .org-header h3 { margin: 0; font-size: 1.125rem; color: #1e293b; }
        .site-count { background: #e2e8f0; color: #64748b; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; }
        .org-details p { margin: 0.25rem 0; font-size: 0.875rem; color: #64748b; }
        .org-actions { display: flex; gap: 0.75rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; }
        .btn-view { color: #22c55e; text-decoration: none; font-size: 0.875rem; }
        .btn-add { background: #22c55e; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.75rem; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #22c55e; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}