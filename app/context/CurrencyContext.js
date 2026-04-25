'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const DEFAULT_ZAR_TO_USD = 19.50;

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('ZAR');
  const [zarToUsdRate, setZarToUsdRate] = useState(DEFAULT_ZAR_TO_USD);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('ensure_currency');
    const savedRate = localStorage.getItem('ensure_zar_to_usd');
    
    if (savedCurrency === 'ZAR' || savedCurrency === 'USD') {
      setCurrency(savedCurrency);
    }
    if (savedRate && !isNaN(parseFloat(savedRate))) {
      setZarToUsdRate(parseFloat(savedRate));
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('ensure_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('ensure_zar_to_usd', zarToUsdRate);
  }, [zarToUsdRate]);

  // Helper function to convert amounts
  const convertAmount = (amountInZAR) => {
    if (currency === 'ZAR') return amountInZAR;
    return amountInZAR / zarToUsdRate;
  };

  // Helper function to format currency
  const formatAmount = (amountInZAR, showSymbol = true) => {
    const converted = convertAmount(amountInZAR);
    const symbol = currency === 'ZAR' ? 'R' : '$';
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return showSymbol ? `${symbol} ${formatted}` : formatted;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      zarToUsdRate,
      setZarToUsdRate,
      convertAmount,
      formatAmount
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}