'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompanySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [company, setCompany] = useState({
    company_name: '',
    display_name: '',
    registration_number: '',
    vat_number: '',
    tax_number: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'South Africa',
    logo_url: '',
    logo_data: '',
    currency: 'ZAR',
    date_format: 'DD/MM/YYYY',
    timezone: 'Africa/Johannesburg'
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/settings/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCompany(data.data);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany(prev => ({ ...prev, logo_data: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = getAuthToken();
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(company)
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Company settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading company settings...</p>
      </div>
    );
  }

  return (
    <div className="company-settings">
      <div className="page-header">
        <div>
          <Link href="/Settings" className="back-link">← Back to Settings</Link>
          <h1>Company Settings</h1>
          <p>Configure your company information for quotes and invoices</p>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Logo Section */}
        <div className="form-section">
          <h2>Company Logo</h2>
          <div className="logo-section">
            {company.logo_data && (
              <div className="logo-preview">
                <img src={company.logo_data} alt="Company Logo" />
                <button type="button" onClick={() => setCompany(prev => ({ ...prev, logo_data: '' }))} className="remove-logo">
                  Remove Logo
                </button>
              </div>
            )}
            <div className="logo-upload">
              <label className="upload-btn">
                {company.logo_data ? 'Change Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
              </label>
              <small>Recommended size: 200x80px. Max 2MB.</small>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={company.company_name}
                onChange={handleChange}
                required
                placeholder="Your Company (Pty) Ltd"
              />
            </div>
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                name="display_name"
                value={company.display_name || ''}
                onChange={handleChange}
                placeholder="Trading name (shows on quotes)"
              />
              <small>Shown on quotes and invoices. Leave blank to use Company Name.</small>
            </div>
          </div>
        </div>

        {/* Registration Details */}
        <div className="form-section">
          <h2>Registration Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Company Registration Number</label>
              <input
                type="text"
                name="registration_number"
                value={company.registration_number || ''}
                onChange={handleChange}
                placeholder="2024/123456/07"
              />
            </div>
            <div className="form-group">
              <label>VAT Registration Number</label>
              <input
                type="text"
                name="vat_number"
                value={company.vat_number || ''}
                onChange={handleChange}
                placeholder="ZA1234567890"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Income Tax Number</label>
            <input
              type="text"
              name="tax_number"
              value={company.tax_number || ''}
              onChange={handleChange}
              placeholder="1234567890"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h2>Contact Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={company.email || ''}
                onChange={handleChange}
                placeholder="info@yourcompany.com"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={company.phone || ''}
                onChange={handleChange}
                placeholder="+27 11 123 4567"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={company.website || ''}
              onChange={handleChange}
              placeholder="https://www.yourcompany.com"
            />
          </div>
        </div>

        {/* Address */}
        <div className="form-section">
          <h2>Business Address</h2>
          <div className="form-group">
            <label>Address Line 1</label>
            <input
              type="text"
              name="address_line1"
              value={company.address_line1 || ''}
              onChange={handleChange}
              placeholder="Street address, P.O. Box"
            />
          </div>
          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              value={company.address_line2 || ''}
              onChange={handleChange}
              placeholder="Suite, floor, building"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={company.city || ''}
                onChange={handleChange}
                placeholder="Johannesburg"
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={company.postal_code || ''}
                onChange={handleChange}
                placeholder="2000"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={company.country || 'South Africa'}
              onChange={handleChange}
              placeholder="South Africa"
            />
          </div>
        </div>

        {/* Regional Settings */}
        <div className="form-section">
          <h2>Regional Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Currency</label>
              <select name="currency" value={company.currency} onChange={handleChange}>
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date Format</label>
              <select name="date_format" value={company.date_format} onChange={handleChange}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select name="timezone" value={company.timezone} onChange={handleChange}>
              <option value="Africa/Johannesburg">South Africa (GMT+2)</option>
              <option value="Africa/Cairo">Egypt (GMT+2)</option>
              <option value="Africa/Lagos">Nigeria (GMT+1)</option>
              <option value="Europe/London">United Kingdom (GMT+0)</option>
              <option value="America/New_York">USA Eastern (GMT-5)</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <Link href="/Settings" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .company-settings {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .back-link {
          color: var(--text-tertiary);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        .back-link:hover {
          color: var(--primary);
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: var(--text-tertiary);
        }
        .message {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .message.success {
          background: var(--success-bg);
          color: var(--success-dark);
          border: 1px solid var(--success-light);
        }
        .message.error {
          background: var(--danger-bg);
          color: var(--danger-dark);
          border: 1px solid var(--danger-light);
        }
        .settings-form {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }
        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .form-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }
        .form-section h2 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-group small {
          display: block;
          font-size: 0.65rem;
          color: var(--text-tertiary);
          margin-top: 0.25rem;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .logo-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .logo-preview img {
          max-height: 60px;
          max-width: 200px;
          object-fit: contain;
        }
        .remove-logo {
          background: var(--danger);
          color: white;
          border: none;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          cursor: pointer;
        }
        .upload-btn {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          display: inline-block;
        }
        .upload-btn:hover {
          background: var(--bg-quaternary);
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--secondary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
        }
        .btn-secondary:hover {
          background: var(--secondary-dark);
        }
        @media (max-width: 768px) {
          .company-settings {
            padding: 1rem;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-actions {
            flex-direction: column-reverse;
          }
          .form-actions button,
          .form-actions a {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}