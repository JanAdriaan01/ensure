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
      console.log('Fetched sites:', data);
      
      // Ensure we have an array
      const sitesArray = Array.isArray(data) ? data : [];
      setSites(sitesArray);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setError('Failed to load client sites');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #e2e8f0', 
          borderTopColor: '#22c55e', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Loading client sites...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchSites} style={{ 
          background: '#22c55e', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          border: 'none', 
          borderRadius: '0.5rem', 
          cursor: 'pointer' 
        }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: '#1e293b', margin: 0 }}>Client Sites</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Manage branch locations and sites ({sites.length} total)</p>
        </div>
        <Link href="/client-sites/new" style={{ 
          background: '#22c55e', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.5rem', 
          textDecoration: 'none' 
        }}>
          + New Site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem', 
          background: 'white', 
          borderRadius: '0.75rem', 
          border: '1px solid #e2e8f0' 
        }}>
          <p>No client sites found. Create your first site.</p>
        </div>
      ) : (
        <div style={{ 
          background: 'white', 
          border: '1px solid #e2e8f0', 
          borderRadius: '0.75rem', 
          overflowX: 'auto' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Site Name</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Organization</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Contact</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(site => (
                <tr key={site.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                    {site.site_name}
                    {site.is_primary && (
                      <span style={{ 
                        background: '#22c55e', 
                        color: 'white', 
                        padding: '0.125rem 0.375rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.6rem', 
                        marginLeft: '0.5rem',
                        display: 'inline-block'
                      }}>Primary</span>
                    )}
                   </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{site.organization_name || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{site.site_type || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{site.contact_person || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Link href={`/client-sites/${site.id}`} style={{ 
                      background: '#22c55e', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '0.375rem', 
                      textDecoration: 'none', 
                      fontSize: '0.75rem',
                      marginRight: '0.5rem'
                    }}>
                      View
                    </Link>
                    <Link href={`/client-sites/${site.id}/edit`} style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '0.375rem', 
                      textDecoration: 'none', 
                      fontSize: '0.75rem' 
                    }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}