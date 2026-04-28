'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

const ReconciliationContent = lazy(() => import('./ReconciliationContent'));

export default function ReconciliationPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Reconciliation..." />}>
      <ReconciliationContent />
    </Suspense>
  );
}