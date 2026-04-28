// app/components/ui/Form/FormPhoneInput.js
'use client';

import { useState } from 'react';

export default function FormPhoneInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder = '(123) 456-7890',
  helperText = '',
  defaultCountry = 'US',
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false);
  
  // Country codes mapping
  const countryCodes = [
    { code: 'US', dial: '+1', country: 'United States' },
    { code: 'GB', dial: '+44', country: 'United Kingdom' },
    { code: 'CA', dial: '+1', country: 'Canada' },
    { code: 'AU', dial: '+61', country: 'Australia' },
    { code: 'DE', dial: '+49', country: 'Germany' },
    { code: 'FR', dial: '+33', country: 'France' },
    { code: 'ES', dial: '+34', country: 'Spain' },
    { code: 'IT', dial: '+39', country: 'Italy' },
    { code: 'NL', dial: '+31', country: 'Netherlands' },
    { code: 'BR', dial: '+55', country: 'Brazil' },
    { code: 'MX', dial: '+52', country: 'Mexico' },
    { code: 'JP', dial: '+81', country: 'Japan' },
    { code: 'CN', dial: '+86', country: 'China' },
    { code: 'IN', dial: '+91', country: 'India' },
    { code: 'ZA', dial: '+27', country: 'South Africa' }
  ];
  
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };
  
  const handleChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: formattedValue
        }
      });
    }
  };
  
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setShowCountryDropdown(false);
    
    // Optional: trigger a change event for the country selection
    if (props.onCountryChange) {
      props.onCountryChange(countryCode);
    }
  };
  
  const getSelectedDialCode = () => {
    const country = countryCodes.find(c => c.code === selectedCountry);
    return country ? country.dial : '+1';
  };
  
  const showError = error && (touched || props.validateOnChange);
  
  return (
    <div className={`form-phone-input ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <div className="phone-input-wrapper">
        <div className="country-selector">
          <button
            type="button"
            className="country-button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            disabled={disabled}
          >
            <span className="country-flag">
              {selectedCountry === 'US' && '🇺🇸'}
              {selectedCountry === 'GB' && '🇬🇧'}
              {selectedCountry === 'CA' && '🇨🇦'}
              {selectedCountry === 'AU' && '🇦🇺'}
              {selectedCountry === 'DE' && '🇩🇪'}
              {selectedCountry === 'FR' && '🇫🇷'}
              {selectedCountry === 'ES' && '🇪🇸'}
              {selectedCountry === 'IT' && '🇮🇹'}
              {selectedCountry === 'NL' && '🇳🇱'}
              {selectedCountry === 'BR' && '🇧🇷'}
              {selectedCountry === 'MX' && '🇲🇽'}
              {selectedCountry === 'JP' && '🇯🇵'}
              {selectedCountry === 'CN' && '🇨🇳'}
              {selectedCountry === 'IN' && '🇮🇳'}
              {selectedCountry === 'ZA' && '🇿🇦'}
            </span>
            <span className="dial-code">{getSelectedDialCode()}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {showCountryDropdown && !disabled && (
            <div className="country-dropdown">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`country-option ${selectedCountry === country.code ? 'active' : ''}`}
                  onClick={() => handleCountryChange(country.code)}
                >
                  <span className="country-flag">
                    {country.code === 'US' && '🇺🇸'}
                    {country.code === 'GB' && '🇬🇧'}
                    {country.code === 'CA' && '🇨🇦'}
                    {country.code === 'AU' && '🇦🇺'}
                    {country.code === 'DE' && '🇩🇪'}
                    {country.code === 'FR' && '🇫🇷'}
                    {country.code === 'ES' && '🇪🇸'}
                    {country.code === 'IT' && '🇮🇹'}
                    {country.code === 'NL' && '🇳🇱'}
                    {country.code === 'BR' && '🇧🇷'}
                    {country.code === 'MX' && '🇲🇽'}
                    {country.code === 'JP' && '🇯🇵'}
                    {country.code === 'CN' && '🇨🇳'}
                    {country.code === 'IN' && '🇮🇳'}
                    {country.code === 'ZA' && '🇿🇦'}
                  </span>
                  <span className="country-name">{country.country}</span>
                  <span className="country-dial">{country.dial}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <input
          id={name}
          name={name}
          type="tel"
          value={value || ''}
          onChange={handleChange}
          onBlur={(e) => {
            setTouched(true);
            if (onBlur) onBlur(e);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`phone-field ${showError ? 'error' : ''}`}
          {...props}
        />
      </div>
      
      {helperText && !showError && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {showError && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .form-phone-input {
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .required-star {
          color: #ef4444;
          margin-left: 0.25rem;
        }
        
        .phone-input-wrapper {
          display: flex;
          gap: 0.5rem;
        }
        
        .country-selector {
          position: relative;
        }
        
        .country-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .country-button:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #3b82f6;
        }
        
        .country-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .country-flag {
          font-size: 1.125rem;
        }
        
        .dial-code {
          font-weight: 500;
          color: #374151;
        }
        
        .dropdown-arrow {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .country-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-height: 250px;
          overflow-y: auto;
          z-index: 10;
          min-width: 200px;
        }
        
        .country-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: none;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        
        .country-option:hover {
          background: #f3f4f6;
        }
        
        .country-option.active {
          background: #dbeafe;
        }
        
        .country-name {
          flex: 1;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .country-dial {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .phone-field {
          flex: 1;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .phone-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .phone-field.error {
          border-color: #ef4444;
        }
        
        .phone-field.error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .phone-field:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        
        .helper-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .error-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}