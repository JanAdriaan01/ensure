'use client';

import { useState } from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  error = '',
  disabled = false,
  helper = ''
}) => {
  const [touched, setTouched] = useState(false);

  const showError = touched && error;

  return (
    <div className="form-input">
      {label && (
        <label htmlFor={name}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={showError ? 'error' : ''}
      />
      {helper && !showError && <div className="helper">{helper}</div>}
      {showError && <div className="error-message">{error}</div>}
      <style jsx>{`
        .form-input {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
        .required {
          color: #dc2626;
        }
        input {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        input.error {
          border-color: #dc2626;
        }
        .helper, .error-message {
          font-size: 0.7rem;
          margin-top: 0.25rem;
        }
        .helper {
          color: #6b7280;
        }
        .error-message {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default FormInput;