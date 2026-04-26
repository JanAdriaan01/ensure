'use client';

import { useState } from 'react';
import CountrySelect from './CountrySelect';

export default function FormPhoneInput({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false,
  error = '',
  disabled = false,
  helper = ''
}) {
  const [countryCode, setCountryCode] = useState('+27');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneChange = (e) => {
    const number = e.target.value.replace(/\D/g, '');
    setPhoneNumber(number);
    onChange(`${countryCode}${number}`);
  };

  const handleCountryChange = (code) => {
    setCountryCode(code);
    onChange(`${code}${phoneNumber}`);
  };

  const countries = [
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+352', name: 'Luxembourg', flag: '🇱🇺' }
  ];

  return (
    <div className="form-phone-input">
      {label && (
        <label htmlFor={name} className="phone-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div className="phone-input-group">
        <select 
          value={countryCode} 
          onChange={(e) => handleCountryChange(e.target.value)}
          className="country-select"
          disabled={disabled}
        >
          {countries.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          id={name}
          name={name}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          required={required}
          placeholder="123456789"
          disabled={disabled}
          className={`phone-input ${error ? 'error' : ''}`}
        />
      </div>
      {helper && !error && <div className="helper">{helper}</div>}
      {error && <div className="error-message">{error}</div>}
      <style jsx>{`
        .form-phone-input {
          margin-bottom: 1rem;
        }
        .phone-label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
        .required {
          color: #dc2626;
        }
        .phone-input-group {
          display: flex;
          gap: 0.5rem;
        }
        .country-select {
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
        }
        .phone-input {
          flex: 1;
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .phone-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .phone-input.error {
          border-color: #dc2626;
        }
        .helper {
          font-size: 0.7rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .error-message {
          font-size: 0.7rem;
          color: #dc2626;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}