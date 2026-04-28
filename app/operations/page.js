'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

const OperationsContent = lazy(() => import('./OperationsContent'));

export default function OperationsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Operations Dashboard..." />}>
      <OperationsContent />
    </Suspense>
  );
}