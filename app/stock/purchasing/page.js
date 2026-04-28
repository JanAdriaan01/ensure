'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

const PurchasingContent = lazy(() => import('./PurchasingContent'));

export default function PurchasingPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Purchasing..." />}>
      <PurchasingContent />
    </Suspense>
  );
}