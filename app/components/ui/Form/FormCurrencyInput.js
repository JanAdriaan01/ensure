// app/components/ui/Form/FormCurrencyInput.js
'use client';

import { useState, useEffect } from 'react';

export default function FormCurrencyInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder = '0.00',
  helperText = '',
  currency = '$',
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatDisplayValue(value));
    }
  }, [value]);
  
  const formatDisplayValue = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9.-]/g, '');
    const numericValue = parseFloat(rawValue);
    const finalValue = isNaN(numericValue) ? null : numericValue;
    
    setDisplayValue(rawValue);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: finalValue
        }
      });
    }
  };
  
  const showError = error && (touched || props.validateOnChange);
  
  return (
    <div className={`form-currency-input ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <div className="currency-input-wrapper">
        <span className="currency-symbol">{currency}</span>
        <input
          id={name}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={(e) => {
            setTouched(true);
            if (onBlur) onBlur(e);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`form-field ${showError ? 'error' : ''}`}
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
        .form-currency-input {
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
        
        .currency-input-wrapper {
          position: relative;
        }
        
        .currency-symbol {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .form-field {
          width: 100%;
          padding: 0.625rem 0.75rem 0.625rem 1.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        
        .form-field:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .form-field.error {
          border-color: #ef4444;
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