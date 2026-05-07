// app/settings/financial/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

export default function FinancialSettingsPage() {
  const { token, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    financial_year_start_month: 3,
    financial_year_start_day: 1,
    currency: 'ZAR',
    vat_rate: 15,
    company_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSettings();
    }
  }, [isAuthenticated, token]);

  const fetchSettings = async () => {
    try {
      // Changed from /api/company/settings to /api/settings/company
      const response = await fetch('/api/settings/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setSettings({
          ...settings,
          ...result.data,
          financial_year_start_month: result.data.financial_year_start_month || 3,
          financial_year_start_day: result.data.financial_year_start_day || 1,
          currency: result.data.currency || 'ZAR',
          vat_rate: result.data.vat_rate || 15
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Changed from /api/company/settings to /api/settings/company
      const response = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const result = await response.json();
      if (result.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
        // Refresh settings after save
        fetchSettings();
      } else {
        setMessage('Error saving settings: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
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
            border-top-color: #3b82f6;
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

  return (
    <div className="settings-container">
      <div className="page-header">
        <h1>Financial Settings</h1>
        <p>Configure your company's financial year and currency settings</p>
      </div>

      <div className="settings-card">
        <h2>Financial Year</h2>
        <p className="description">Set the start of your company's financial year (e.g., South Africa: 1 March)</p>
        
        <div className="form-group">
          <label>Financial Year Start Month</label>
          <select
            value={settings.financial_year_start_month}
            onChange={(e) => setSettings({...settings, financial_year_start_month: parseInt(e.target.value)})}
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Financial Year Start Day</label>
          <select
            value={settings.financial_year_start_day}
            onChange={(e) => setSettings({...settings, financial_year_start_day: parseInt(e.target.value)})}
          >
            {[...Array(31).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({...settings, currency: e.target.value})}
          >
            <option value="ZAR">South African Rand (ZAR)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
          </select>
        </div>

        <div className="form-group">
          <label>VAT Rate (%)</label>
          <input
            type="number"
            step="0.5"
            value={settings.vat_rate}
            onChange={(e) => setSettings({...settings, vat_rate: parseFloat(e.target.value)})}
          />
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="save-btn">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="info-card">
        <h3>Financial Year Information</h3>
        <p>Current financial year: <strong>
          {(() => {
            const now = new Date();
            const fyStartMonth = settings.financial_year_start_month || 3;
            const fyStartDay = settings.financial_year_start_day || 1;
            const currentYear = now.getFullYear();
            const fyStart = new Date(currentYear, fyStartMonth - 1, fyStartDay);
            if (now >= fyStart) {
              return `${currentYear}/${currentYear + 1}`;
            } else {
              return `${currentYear - 1}/${currentYear}`;
            }
          })()}
        </strong></p>
        <p>The financial dashboard will automatically group data according to your financial year settings.</p>
        <p className="note">Note: South African financial year runs from 1 March to 28/29 February.</p>
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: #64748b;
        }
        .settings-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .settings-card h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .description {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }
        .form-group select,
        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }
        .save-btn {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          margin-top: 1rem;
          transition: background 0.2s;
        }
        .save-btn:hover {
          background: #2563eb;
        }
        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .message {
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
        }
        .message.success {
          background: #d1fae5;
          color: #065f46;
        }
        .message.error {
          background: #fee2e2;
          color: #991b1b;
        }
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }
        .info-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .info-card p {
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        .info-card .note {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}