'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('ENSURE System');
  const [vatRate, setVatRate] = useState('15');
  const [currency, setCurrency] = useState('ZAR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <div className="page-header">
        <h1>System Settings</h1>
        <p>Configure system preferences and business settings</p>
      </div>

      <div className="settings-grid">
        <div className="settings-sidebar">
          <Link href="/settings" className="sidebar-link active">
            General Settings
          </Link>
          <Link href="/settings/users" className="sidebar-link">
            User Management
          </Link>
          <Link href="/settings/backup" className="sidebar-link">
            Backup
          </Link>
          <Link href="/settings/audit-logs" className="sidebar-link">
            Audit Logs
          </Link>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h2>Company Information</h2>
            <div className="form-group">
              <label>Company Name</label>
              <input 
                type="text" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="setting-section">
            <h2>Financial Settings</h2>
            <div className="form-row">
              <div className="form-group">
                <label>VAT Rate (%)</label>
                <input 
                  type="number" 
                  value={vatRate} 
                  onChange={(e) => setVatRate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Default Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-input">
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
            <div className="form-group">
              <label>Date Format</label>
              <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="form-input">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <button onClick={handleSave} className="save-btn">Save Settings</button>
        </div>
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: #6b7280;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
        }
        .settings-sidebar {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }
        .sidebar-link {
          display: block;
          padding: 0.75rem 1rem;
          color: #4b5563;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .sidebar-link:hover {
          background: #f3f4f6;
        }
        .sidebar-link.active {
          background: #3b82f6;
          color: white;
        }
        .settings-content {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
        }
        .setting-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .setting-section h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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
        .form-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
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
          .settings-container { padding: 1rem; }
          .settings-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}