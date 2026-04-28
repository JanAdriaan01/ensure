// app/components/ui/Form/FormSelect.js
'use client';

import { useState } from 'react';

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  helperText = '',
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false);
  
  const showError = error && (touched || props.validateOnChange);
  
  return (
    <div className={`form-select ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={(e) => {
          setTouched(true);
          if (onBlur) onBlur(e);
        }}
        disabled={disabled}
        className={`form-field ${showError ? 'error' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helperText && !showError && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {showError && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .form-select {
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
        
        .form-field {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
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