'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

const StockContent = lazy(() => import('./StockContent'));

export default function StockPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Stock Dashboard..." />}>
      <StockContent />
    </Suspense>
  );
}