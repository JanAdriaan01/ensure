'use client';

import { useState } from 'react';

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'ENSURE System',
    companyEmail: 'info@ensure.com',
    companyPhone: '+27 11 123 4567',
    vatRate: '15',
    currency: 'ZAR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Africa/Johannesburg',
    darkMode: false,
    emailNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic here
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="page-title">General Settings</h1>
      <p className="page-description">Configure your system preferences and company information</p>

      {saved && (
        <div className="success-message">
          ✓ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="setting-section">
          <h2>Company Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Company Phone</label>
              <input
                type="text"
                name="companyPhone"
                value={settings.companyPhone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="setting-section">
          <h2>Financial Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>VAT Rate (%)</label>
              <input
                type="number"
                name="vatRate"
                value={settings.vatRate}
                onChange={handleChange}
                className="form-input"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label>Default Currency</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className="form-input">
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="setting-section">
          <h2>Regional Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Date Format</label>
              <select name="dateFormat" value={settings.dateFormat} onChange={handleChange} className="form-input">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <select name="timezone" value={settings.timezone} onChange={handleChange} className="form-input">
                <option value="Africa/Johannesburg">South Africa (GMT+2)</option>
                <option value="Europe/London">United Kingdom (GMT+0)</option>
                <option value="America/New_York">USA Eastern (GMT-5)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="setting-section">
          <h2>Notifications</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              Enable Email Notifications
            </label>
          </div>
        </div>

        <button type="submit" className="save-btn">Save Settings</button>
      </form>

      <style jsx>{`
        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .dark .page-title {
          color: #f9fafb;
        }
        .page-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        .dark .page-description {
          color: #9ca3af;
        }
        .success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .setting-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark .setting-section {
          border-bottom-color: #374151;
        }
        .setting-section h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }
        .dark .setting-section h2 {
          color: #f9fafb;
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
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        .dark .form-group label {
          color: #9ca3af;
        }
        .form-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }
        .dark .form-input {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        .checkbox-group {
          margin-top: 0.5rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .save-btn {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .save-btn:hover {
          background: #2563eb;
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}