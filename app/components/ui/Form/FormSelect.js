'use client';

import { useState } from 'react';
import styles from './Form.module.css';

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = 'Select an option',
  error = '',
  disabled = false
}) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  return (
    <div className={styles.group}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        required={required}
        disabled={disabled}
        className={`${styles.select} ${showError ? styles.error : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showError && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}