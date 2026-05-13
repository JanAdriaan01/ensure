// app/client-sites/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

// Option mappings for display
const environmentOptions = [
  { value: 'outdoor', label: '🏕️ Outdoor', description: 'Open air, exposed to weather' },
  { value: 'indoor', label: '🏢 Indoor', description: 'Inside building' },
  { value: 'office', label: '💼 Office', description: 'Administrative office space' },
  { value: 'warehouse_4m', label: '📦 Warehouse (4m)', description: 'Standard warehouse with 4m height' },
  { value: 'warehouse_5m', label: '📦 Warehouse (5m)', description: 'High bay warehouse with 5m height' },
  { value: 'production', label: '🏭 Production', description: 'Active production floor' },
  { value: 'clean_room', label: '🧼 Clean Room', description: 'Controlled environment' },
  { value: 'cold_storage', label: '❄️ Cold Storage', description: 'Refrigerated area' },
  { value: 'hazardous', label: '⚠️ Hazardous', description: 'Contains hazardous materials' },
  { value: 'confined_space', label: '🔒 Confined Space', description: 'Limited entry/exit' },
  { value: 'high_risk', label: '🔥 High Risk', description: 'High safety risk area' }
];

const equipmentOptions = [
  { value: 'hard_hat', label: '⛑️ Hard Hat', description: 'Head protection required' },
  { value: 'safety_vest', label: '🦺 Safety Vest', description: 'High visibility vest' },
  { value: 'safety_glasses', label: '👓 Safety Glasses', description: 'Eye protection' },
  { value: 'steel_toe_boots', label: '👞 Steel Toe Boots', description: 'Foot protection' },
  { value: 'gloves', label: '🧤 Gloves', description: 'Hand protection' },
  { value: 'ear_protection', label: '👂 Ear Protection', description: 'Hearing protection' },
  { value: 'respirator', label: '😷 Respirator', description: 'Breathing protection' },
  { value: 'harness', label: '🪢 Safety Harness', description: 'Fall protection' },
  { value: 'gas_detector', label: '💨 Gas Detector', description: 'Gas monitoring device' },
  { value: 'fire_extinguisher', label: '🧯 Fire Extinguisher', description: 'Fire safety equipment' }
];

const restrictedZoneOptions = [
  { value: 'machinery_area', label: '⚙️ Machinery Area', description: 'Moving equipment present' },
  { value: 'electrical_room', label: '⚡ Electrical Room', description: 'High voltage area' },
  { value: 'chemical_storage', label: '🧪 Chemical Storage', description: 'Hazardous chemical storage' },
  { value: 'roof_area', label: '🏠 Roof Area', description: 'Elevated area with fall risk' },
  { value: 'pit_area', label: '🕳️ Pit Area', description: 'Below ground area' },
  { value: 'confined_space', label: '📦 Confined Space', description: 'Limited entry/exit' },
  { value: 'restricted_office', label: '🚪 Restricted Office', description: 'Authorized personnel only' },
  { value: 'data_center', label: '💻 Data Center', description: 'Sensitive IT equipment' },
  { value: 'laboratory', label: '🔬 Laboratory', description: 'Research area' }
];

export default function ClientSiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const deleteSite = async () => {
    if (!confirm(`Delete site "${site?.site_name}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/client-sites?id=${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/client-sites');
      } else {
        alert(data.error || 'Failed to delete site');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Failed to delete site');
    } finally {
      setDeleting(false);
    }
  };

  const getEnvironmentLabel = (value) => {
    const env = environmentOptions.find(e => e.value === value);
    return env ? env.label : value;
  };

  const getEquipmentLabel = (value) => {
    const equip = equipmentOptions.find(e => e.value === value);
    return equip ? equip.label : value;
  };

  const getZoneLabel = (value) => {
    const zone = restrictedZoneOptions.find(z => z.value === value);
    return zone ? zone.label : value;
  };

  const getSafetyBadgeClass = (level) => {
    switch(level) {
      case 'easy': return 'safety-easy';
      case 'moderate': return 'safety-moderate';
      case 'strict': return 'safety-strict';
      default: return '';
    }
  };

  const getAccessBadgeClass = (level) => {
    switch(level) {
      case 'easy': return 'access-easy';
      case 'moderate': return 'access-moderate';
      case 'strict': return 'access-strict';
      default: return '';
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
          {site.site_code && <p className="subtitle">Code: {site.site_code}</p>}
        </div>
        <div className="header-actions">
          <Link href={`/client-sites/${site.id}/edit`} className="btn-edit">Edit Site</Link>
          <button onClick={deleteSite} disabled={deleting} className="btn-delete">
            {deleting ? 'Deleting...' : 'Delete Site'}
          </button>
        </div>
      </div>

      <div className="details-grid">
        {/* Organization Information */}
        <div className="detail-card">
          <h3>Organization</h3>
          <div className="detail-item">
            <span className="label">Organization:</span>
            <span className="value">{site.organization_name || '-'}</span>
          </div>
          {site.is_primary && (
            <div className="primary-badge-container">
              <span className="primary-badge">⭐ Primary Site</span>
            </div>
          )}
        </div>

        {/* Environment Types */}
        <div className="detail-card">
          <h3>🌍 Environment Types</h3>
          <div className="detail-item">
            {site.environment_types && site.environment_types.length > 0 ? (
              <div className="tags-container">
                {site.environment_types.map(env => (
                  <span key={env} className="tag tag-environment">
                    {getEnvironmentLabel(env)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="value">No environments selected</span>
            )}
          </div>
        </div>

        {/* Safety & Access Levels */}
        <div className="detail-card">
          <h3>🛡️ Safety & Access</h3>
          <div className="detail-item">
            <span className="label">Safety Level:</span>
            <span className={`safety-badge ${getSafetyBadgeClass(site.safety_level)}`}>
              {site.safety_level?.toUpperCase() || 'MODERATE'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Access Level:</span>
            <span className={`access-badge ${getAccessBadgeClass(site.access_level)}`}>
              {site.access_level?.toUpperCase() || 'MODERATE'}
            </span>
          </div>
          {site.power_requirement && (
            <div className="detail-item">
              <span className="label">Power Requirement:</span>
              <span className="value">{site.power_requirement}</span>
            </div>
          )}
          {site.clearance_required && (
            <div className="detail-item">
              <span className="label">Clearance Required:</span>
              <span className="value">{site.clearance_required}</span>
            </div>
          )}
        </div>

        {/* Special Equipment */}
        <div className="detail-card">
          <h3>🛠️ Special Equipment Required</h3>
          <div className="detail-item">
            {site.special_equipment && site.special_equipment.length > 0 ? (
              <div className="tags-container">
                {site.special_equipment.map(equip => (
                  <span key={equip} className="tag tag-equipment">
                    {getEquipmentLabel(equip)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="value">No special equipment required</span>
            )}
          </div>
        </div>

        {/* Restricted Zones */}
        <div className="detail-card">
          <h3>🚧 Restricted Zones</h3>
          <div className="detail-item">
            {site.restricted_zones && site.restricted_zones.length > 0 ? (
              <div className="tags-container">
                {site.restricted_zones.map(zone => (
                  <span key={zone} className="tag tag-zone">
                    {getZoneLabel(zone)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="value">No restricted zones</span>
            )}
          </div>
        </div>

        {/* Contact Information */}
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
          <div className="detail-item">
            <span className="label">Site Manager:</span>
            <span className="value">{site.site_manager || '-'}</span>
          </div>
        </div>

        {/* Address Information */}
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

        {/* Site Details */}
        <div className="detail-card">
          <h3>Site Details</h3>
          <div className="detail-item">
            <span className="label">Site Type:</span>
            <span className="value">{site.site_type || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Site Code:</span>
            <span className="value">{site.site_code || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Operating Hours:</span>
            <span className="value">{site.operating_hours || '-'}</span>
          </div>
        </div>

        {/* Notes */}
        {site.notes && (
          <div className="detail-card full-width">
            <h3>Notes</h3>
            <div className="detail-item">
              <span className="value">{site.notes}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
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
        .subtitle {
          color: #64748b;
          margin: 0.25rem 0 0;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .btn-edit {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
        }
        .btn-delete {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
        }
        .btn-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        .detail-card.full-width {
          grid-column: 1 / -1;
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
          width: 130px;
          font-weight: 500;
          color: #64748b;
        }
        .detail-item .value {
          flex: 1;
          color: #1e293b;
        }
        .primary-badge-container {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }
        .primary-badge {
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          display: inline-block;
        }
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .tag {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .tag-environment {
          background: #dbeafe;
          color: #1e40af;
        }
        .tag-equipment {
          background: #fef3c7;
          color: #92400e;
        }
        .tag-zone {
          background: #fee2e2;
          color: #991b1b;
        }
        .safety-badge, .access-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .safety-easy, .access-easy {
          background: #d1fae5;
          color: #065f46;
        }
        .safety-moderate, .access-moderate {
          background: #fef3c7;
          color: #92400e;
        }
        .safety-strict, .access-strict {
          background: #fee2e2;
          color: #991b1b;
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
          .header-actions {
            flex-direction: column;
            width: 100%;
          }
          .btn-edit, .btn-delete {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}