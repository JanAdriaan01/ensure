'use client';

import { useCurrency } from '@/app/context/CurrencyContext';

export default function CurrencyInput({ value, onChange, placeholder = '0.00', required = false, className = '' }) {
  const { currency } = useCurrency();
  const symbol = currency === 'ZAR' ? 'R' : '$';
  
  return (
    <div className="currency-input-wrapper">
      <span className="currency-symbol">{symbol}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`currency-input ${className}`}
      />
      <style jsx>{`
        .currency-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .currency-symbol {
          position: absolute;
          left: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          pointer-events: none;
        }
        .currency-input {
          width: 100%;
          padding: 0.625rem 0.625rem 0.625rem 2rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        .currency-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
}