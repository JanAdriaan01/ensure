// app/components/ui/Form/FormTextarea.js
'use client';

import { useState } from 'react';

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder = '',
  helperText = '',
  rows = 3,
  maxLength,
  showCount = false,
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false);
  
  const showError = error && (touched || props.validateOnChange);
  const currentLength = value?.length || 0;
  
  return (
    <div className={`form-textarea ${className}`}>
      {label && (
        <div className="label-wrapper">
          <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="required-star">*</span>}
          </label>
          {showCount && maxLength && (
            <span className="char-count">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={(e) => {
          setTouched(true);
          if (onBlur) onBlur(e);
        }}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
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
        .form-textarea {
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .label-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .required-star {
          color: #ef4444;
          margin-left: 0.25rem;
        }
        
        .char-count {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .form-field {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-family: inherit;
          resize: vertical;
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