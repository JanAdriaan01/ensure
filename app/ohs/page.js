'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

const OHSContent = lazy(() => import('./OHSContent'));

export default function OHSPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading OHS Dashboard..." />}>
      <OHSContent />
    </Suspense>
  );
}