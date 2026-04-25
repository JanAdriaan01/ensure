'use client';

import { useState } from 'react';
import { useCurrency } from '@/app/context/CurrencyContext';
import styles from './Form.module.css';

export default function FormCurrencyInput({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '0.00',
  error = '',
  disabled = false
}) {
  const { currency } = useCurrency();
  const [touched, setTouched] = useState(false);
  const showError = touched && error;
  const symbol = currency === 'ZAR' ? 'R' : '$';

  return (
    <div className={styles.group}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.currencyWrapper}>
        <span className={styles.currencySymbol}>{symbol}</span>
        <input
          id={name}
          name={name}
          type="number"
          step="0.01"
          value={value}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.currencyInput} ${showError ? styles.error : ''}`}
        />
      </div>
      {showError && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}