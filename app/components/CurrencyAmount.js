'use client';

import { useCurrency } from '@/app/context/CurrencyContext';

export default function CurrencyAmount({ amount, showSymbol = true, className = '' }) {
  const { currency, zarToUsdRate } = useCurrency();
  
  const displayAmount = currency === 'ZAR' ? amount : (amount / zarToUsdRate);
  const symbol = currency === 'ZAR' ? 'R' : '$';
  
  const formattedAmount = displayAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return (
    <span className={className}>
      {showSymbol && `${symbol} `}{formattedAmount}
    </span>
  );
}