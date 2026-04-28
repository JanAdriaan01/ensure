'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

const ScheduleContent = lazy(() => import('./ScheduleContent'));

export default function SchedulePage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Schedule..." />}>
      <ScheduleContent />
    </Suspense>
  );
}