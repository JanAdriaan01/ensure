// app/client-sites/new/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewClientSitePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  
  const [formData, setFormData] = useState({
    organization_id: '',
    site_name: '',
    site_type: '',
    site_code: '',
    contact_person: '',
    email: '',
    phone: '',
    site_address: '',
    city: '',
    postal_code: '',
    site_manager: '',
    operating_hours: '',
    is_primary: false,
    safety_level: 'moderate',
    access_level: 'moderate',
    power_requirement: '',
    clearance_required: '',
    environment_types: [],
    special_equipment: [],
    restricted_zones: [],
    notes: ''
  });

  const siteTypes = [
    'Warehouse', 'Office', 'Retail Store', 'Distribution Center',
    'Manufacturing Plant', 'Construction Site', 'Depot', 'Branch',
    'Head Office', 'Regional Office', 'Service Center', 'Other'
  ];

  // Environment options (can be multiple)
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

  // Safety levels
  const safetyLevels = [
    { value: 'easy', label: '🟢 Easy', description: 'Standard safety protocols, minimal PPE' },
    { value: 'moderate', label: '🟡 Moderate', description: 'Enhanced safety protocols, required PPE' },
    { value: 'strict', label: '🔴 Strict', description: 'Strict safety protocols, full PPE, special training required' }
  ];

  // Access levels
  const accessLevels = [
    { value: 'easy', label: '🟢 Easy Access', description: 'Public access, no restrictions' },
    { value: 'moderate', label: '🟡 Moderate Access', description: 'Controlled access, escort may be required' },
    { value: 'strict', label: '🔴 Strict Access', description: 'Restricted access, clearance required' }
  ];

  // Special equipment options
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

  // Restricted zone options
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
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to load organizations');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleMultiSelect = (arrayName, value) => {
    setFormData(prev => {
      const currentArray = prev[arrayName] || [];
      if (currentArray.includes(value)) {
        return { ...prev, [arrayName]: currentArray.filter(v => v !== value) };
      } else {
        return { ...prev, [arrayName]: [...currentArray, value] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.organization_id) {
      setError('Please select an organization');
      return;
    }
    
    if (!formData.site_name) {
      setError('Site name is required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/client-sites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/client-sites');
      } else {
        setError(data.error || 'Failed to create client site');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="form-container">
        <h1>Authentication Required</h1>
        <p>Please log in to create client sites.</p>
        <Link href="/login" className="btn-primary">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <Link href="/client-sites" className="back-link">← Back to Client Sites</Link>
          <h1>Create New Client Site</h1>
          <p>Add a branch location or site under an organization</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        {/* Organization Selection - MANDATORY */}
        <div className="form-section">
          <h3>Organization *</h3>
          <div className="form-group">
            <label>Select Organization</label>
            <select
              name="organization_id"
              value={formData.organization_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select an Organization --</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.organization_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Basic Site Information */}
        <div className="form-section">
          <h3>Basic Site Information</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Site Name *</label>
              <input
                type="text"
                name="site_name"
                value={formData.site_name}
                onChange={handleChange}
                required
                placeholder="e.g., Johannesburg Branch, Cape Town Warehouse"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Site Type</label>
              <select name="site_type" value={formData.site_type} onChange={handleChange}>
                <option value="">Select Type</option>
                {siteTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Site Code</label>
              <input
                type="text"
                name="site_code"
                value={formData.site_code}
                onChange={handleChange}
                placeholder="e.g., JHB-001"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleChange}
              />
              Mark as primary site for this organization
            </label>
          </div>
        </div>

        {/* Environment Types - Multi-select */}
        <div className="form-section">
          <h3>🌍 Environment Types</h3>
          <p className="section-note">Select all environment types that apply to this site</p>
          <div className="options-grid">
            {environmentOptions.map(env => (
              <label key={env.value} className="option-card">
                <input
                  type="checkbox"
                  checked={formData.environment_types.includes(env.value)}
                  onChange={() => handleMultiSelect('environment_types', env.value)}
                />
                <div className="option-content">
                  <strong>{env.label}</strong>
                  <span className="option-description">{env.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Safety Level */}
        <div className="form-section">
          <h3>🛡️ Safety Level</h3>
          <div className="options-grid">
            {safetyLevels.map(level => (
              <label key={level.value} className={`option-card safety-${level.value}`}>
                <input
                  type="radio"
                  name="safety_level"
                  value={level.value}
                  checked={formData.safety_level === level.value}
                  onChange={handleChange}
                />
                <div className="option-content">
                  <strong>{level.label}</strong>
                  <span className="option-description">{level.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Access Level */}
        <div className="form-section">
          <h3>🚪 Access Level</h3>
          <div className="options-grid">
            {accessLevels.map(level => (
              <label key={level.value} className={`option-card access-${level.value}`}>
                <input
                  type="radio"
                  name="access_level"
                  value={level.value}
                  checked={formData.access_level === level.value}
                  onChange={handleChange}
                />
                <div className="option-content">
                  <strong>{level.label}</strong>
                  <span className="option-description">{level.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Special Equipment Required */}
        <div className="form-section">
          <h3>🛠️ Special Equipment Required</h3>
          <p className="section-note">Select all equipment that may be needed for this site</p>
          <div className="options-grid">
            {equipmentOptions.map(equip => (
              <label key={equip.value} className="option-card">
                <input
                  type="checkbox"
                  checked={formData.special_equipment.includes(equip.value)}
                  onChange={() => handleMultiSelect('special_equipment', equip.value)}
                />
                <div className="option-content">
                  <strong>{equip.label}</strong>
                  <span className="option-description">{equip.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Restricted Zones */}
        <div className="form-section">
          <h3>🚧 Restricted Zones</h3>
          <p className="section-note">Select all restricted areas within this site</p>
          <div className="options-grid">
            {restrictedZoneOptions.map(zone => (
              <label key={zone.value} className="option-card">
                <input
                  type="checkbox"
                  checked={formData.restricted_zones.includes(zone.value)}
                  onChange={() => handleMultiSelect('restricted_zones', zone.value)}
                />
                <div className="option-content">
                  <strong>{zone.label}</strong>
                  <span className="option-description">{zone.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Power & Clearance Requirements */}
        <div className="form-section">
          <h3>⚡ Additional Requirements</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Power Requirement</label>
              <input
                type="text"
                name="power_requirement"
                value={formData.power_requirement}
                onChange={handleChange}
                placeholder="e.g., 220V, 3-Phase, Generator backup"
              />
            </div>
            <div className="form-group">
              <label>Clearance Required</label>
              <input
                type="text"
                name="clearance_required"
                value={formData.clearance_required}
                onChange={handleChange}
                placeholder="e.g., Security clearance, Background check"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Site contact name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="site@company.com"
              />
            </div>
          </div>
          <div className="form-row">
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
            <div className="form-group">
              <label>Site Manager</label>
              <input
                type="text"
                name="site_manager"
                value={formData.site_manager}
                onChange={handleChange}
                placeholder="Name of site manager"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group full-width">
            <label>Site Address</label>
            <textarea
              name="site_address"
              value={formData.site_address}
              onChange={handleChange}
              rows="2"
              placeholder="Street address"
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

        {/* Operating Hours & Notes */}
        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group full-width">
            <label>Operating Hours</label>
            <input
              type="text"
              name="operating_hours"
              value={formData.operating_hours}
              onChange={handleChange}
              placeholder="e.g., Mon-Fri 9am-5pm, Sat 10am-2pm"
            />
          </div>
          <div className="form-group full-width">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes about this site..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Client Site'}
          </button>
          <Link href="/client-sites" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .form-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2rem; }
        .back-link { color: #64748b; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; font-size: 0.875rem; }
        .back-link:hover { color: #22c55e; }
        .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b; }
        .page-header p { margin: 0.25rem 0 0; color: #64748b; }
        .error-message { background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .form-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden; }
        .form-section { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .form-section:last-child { border-bottom: none; }
        .form-section h3 { margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
        .section-note { font-size: 0.75rem; color: #64748b; margin-bottom: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { margin-bottom: 0.375rem; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; color: #64748b; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.625rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; background: white; color: #1e293b; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
        .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; text-transform: none; }
        .checkbox-label input { width: auto; }
        .options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
        .option-card { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .option-card:hover { background: #f8fafc; border-color: #22c55e; }
        .option-card input { margin-top: 0.125rem; }
        .option-content { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
        .option-content strong { font-size: 0.875rem; color: #1e293b; }
        .option-description { font-size: 0.7rem; color: #64748b; }
        .safety-easy { border-left: 3px solid #10b981; }
        .safety-moderate { border-left: 3px solid #f59e0b; }
        .safety-strict { border-left: 3px solid #ef4444; }
        .access-easy { border-left: 3px solid #10b981; }
        .access-moderate { border-left: 3px solid #f59e0b; }
        .access-strict { border-left: 3px solid #ef4444; }
        .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn-primary { background: #22c55e; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
        .btn-primary:hover { background: #16a34a; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: #64748b; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
        .btn-secondary:hover { background: #475569; }
        @media (max-width: 768px) {
          .form-container { padding: 1rem; }
          .form-row { grid-template-columns: 1fr; }
          .form-group.full-width { grid-column: span 1; }
          .options-grid { grid-template-columns: 1fr; }
          .form-actions { flex-direction: column; }
          .form-actions button, .form-actions a { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  );
}