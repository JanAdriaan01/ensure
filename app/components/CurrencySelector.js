'use client';

import { useCurrency } from '@/app/context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, setCurrency, zarToUsdRate, setZarToUsdRate } = useCurrency();
  
  return (
    <div className="currency-selector">
      <button
        className={`currency-option ${currency === 'ZAR' ? 'active' : ''}`}
        onClick={() => setCurrency('ZAR')}
      >
        🇿🇦 ZAR (R)
      </button>
      <button
        className={`currency-option ${currency === 'USD' ? 'active' : ''}`}
        onClick={() => setCurrency('USD')}
      >
        🇺🇸 USD ($)
      </button>
      {currency === 'USD' && (
        <div className="exchange-rate">
          <label>Exchange Rate (ZAR to USD):</label>
          <input
            type="number"
            step="0.01"
            value={zarToUsdRate}
            onChange={(e) => setZarToUsdRate(parseFloat(e.target.value))}
            placeholder="19.50"
          />
        </div>
      )}
      <style jsx>{`
        .currency-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 0.5rem;
        }
        .currency-option {
          padding: 0.375rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .currency-option.active {
          background: white;
          color: #2563eb;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .exchange-rate {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 0.5rem;
          padding-left: 0.5rem;
          border-left: 1px solid #d1d5db;
        }
        .exchange-rate label {
          font-size: 0.7rem;
          color: #6b7280;
        }
        .exchange-rate input {
          width: 80px;
          padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}