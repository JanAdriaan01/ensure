'use client';

import { useState } from 'react';
import styles from './Form.module.css';

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  rows = 3,
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
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`${styles.textarea} ${showError ? styles.error : ''}`}
      />
      {showError && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}