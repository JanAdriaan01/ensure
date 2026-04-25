'use client';

import { useState } from 'react';
import styles from './Form.module.css';

export default function FormDatePicker({
  label,
  name,
  value,
  onChange,
  required = false,
  error = '',
  disabled = false,
  min,
  max
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
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className={`${styles.input} ${showError ? styles.error : ''}`}
      />
      {showError && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}