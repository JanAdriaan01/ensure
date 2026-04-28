// app/components/ui/Form/FormDatePicker.js
'use client';

import { useState } from 'react';

export default function FormDatePicker({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  helperText = '',
  minDate,
  maxDate,
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false);
  
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  const showError = error && (touched || props.validateOnChange);
  
  return (
    <div className={`form-datepicker ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type="date"
        value={formatDateForInput(value)}
        onChange={onChange}
        onBlur={(e) => {
          setTouched(true);
          if (onBlur) onBlur(e);
        }}
        disabled={disabled}
        min={minDate ? formatDateForInput(minDate) : undefined}
        max={maxDate ? formatDateForInput(maxDate) : undefined}
        className={`form-field ${showError ? 'error' : ''}`}
        {...props}
      />
      
      {helperText && !showError && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {showError && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .form-datepicker {
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