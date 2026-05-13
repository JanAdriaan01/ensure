// app/client-sites/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function ClientSiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchSite();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/client-sites/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 404) {
        setError('Client site not found');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setSite(data);
    } catch (error) {
      console.error('Error fetching site:', error);
      setError('Failed to load site details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading site details...</p>
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

  if (error || !site) {
    return (
      <div className="error-container">
        <h2>Site Not Found</h2>
        <p>{error || 'The client site you are looking for does not exist.'}</p>
        <Link href="/client-sites" className="btn-primary">Back to Client Sites</Link>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 4rem;
          }
          .btn-primary {
            background: #22c55e;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            text-decoration: none;
            display: inline-block;
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
          <Link href="/client-sites" className="back-link">← Back to Client Sites</Link>
          <h1>{site.site_name}</h1>
          {site.is_primary && <span className="primary-badge">Primary Site</span>}
        </div>
        <div className="header-actions">
          <Link href={`/client-sites/${site.id}/edit`} className="btn-edit">Edit Site</Link>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Organization</h3>
          <div className="detail-item">
            <span className="label">Organization:</span>
            <span className="value">{site.organization_name || '-'}</span>
          </div>
        </div>

        <div className="detail-card">
          <h3>Contact Information</h3>
          <div className="detail-item">
            <span className="label">Contact Person:</span>
            <span className="value">{site.contact_person || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Email:</span>
            <span className="value">{site.email || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phone:</span>
            <span className="value">{site.phone || '-'}</span>
          </div>
        </div>

        <div className="detail-card">
          <h3>Address Information</h3>
          <div className="detail-item">
            <span className="label">Address:</span>
            <span className="value">
              {site.site_address && <div>{site.site_address}</div>}
              {site.city && <div>{site.city}</div>}
              {site.postal_code && <div>Postal Code: {site.postal_code}</div>}
              {!site.site_address && !site.city && '-'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
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
          color: #1e293b;
        }
        .primary-badge {
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          display: inline-block;
          margin-left: 0.5rem;
        }
        .btn-edit {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .detail-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
        }
        .detail-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-item {
          display: flex;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }
        .detail-item .label {
          width: 120px;
          font-weight: 500;
          color: #64748b;
        }
        .detail-item .value {
          flex: 1;
          color: #1e293b;
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .details-grid {
            grid-template-columns: 1fr;
          }
          .detail-item {
            flex-direction: column;
          }
          .detail-item .label {
            width: auto;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}