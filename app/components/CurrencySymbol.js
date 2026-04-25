'use client';

import { useCurrency } from '@/app/context/CurrencyContext';

export default function CurrencySymbol() {
  const { currency } = useCurrency();
  return <span>{currency === 'ZAR' ? 'R' : '$'}</span>;
}