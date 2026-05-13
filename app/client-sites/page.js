// app/client-sites/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function ClientSitesPage() {
  const { token, isAuthenticated } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSites();
    }
  }, [isAuthenticated, token]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client-sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading client sites...</p>
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

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Client Sites</h2>
        <p>{error}</p>
        <button onClick={fetchSites} className="retry-btn">Retry</button>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 4rem;
          }
          .retry-btn {
            background: #22c55e;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Client Sites</h1>
          <p>Manage branch locations and sites ({sites.length} total)</p>
        </div>
        <Link href="/client-sites/new" className="btn-primary">+ New Site</Link>
      </div>

      {sites.length === 0 ? (
        <div className="empty-state">
          <p>No client sites found. Create your first site.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="sites-table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Organization</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Primary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(site => (
                <tr key={site.id}>
                  <td className="site-name">{site.site_name}</td>
                  <td>{site.organization_name || '-'}</td>
                  <td>{site.contact_person || '-'}</td>
                  <td>{site.email || '-'}</td>
                  <td>{site.phone || '-'}</td>
                  <td>{site.is_primary ? 'Yes' : 'No'}</td>
                  <td className="actions">
                    <Link href={`/client-sites/${site.id}`} className="btn-view">View</Link>
                    <Link href={`/client-sites/${site.id}/edit`} className="btn-edit">Edit</Link>
                    <button 
                      onClick={async () => {
                        if (confirm(`Delete site "${site.site_name}"?`)) {
                          const res = await fetch(`/api/client-sites?id=${site.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (res.ok) {
                            fetchSites();
                          } else {
                            const data = await res.json();
                            alert(data.error || 'Failed to delete');
                          }
                        }
                      }}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          color: #1e293b;
          margin: 0;
        }
        .page-header p {
          color: #64748b;
          margin: 0.25rem 0 0;
        }
        .btn-primary {
          background: #22c55e;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-block;
        }
        .table-wrapper {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow-x: auto;
        }
        .sites-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }
        .sites-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .sites-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }
        .site-name {
          font-weight: 600;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .btn-view {
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.75rem;
          display: inline-block;
        }
        .btn-edit {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.75rem;
          display: inline-block;
        }
        .btn-delete {
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-size: 0.75rem;
        }
        .empty-state {
          text-align: center;
          padding: 4rem;
          color: #64748b;
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}