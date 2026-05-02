'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('ENSURE System');
  const [vatRate, setVatRate] = useState('15');
  const [currency, setCurrency] = useState('ZAR');

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <h1 className="page-title">System Settings</h1>
      <p className="page-description">Configure system preferences and business settings</p>

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

      <button onClick={handleSave} className="save-btn">Save Settings</button>

      <style jsx>{`
        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .page-description {
          color: #6b7280;
          margin-bottom: 2rem;
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
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}