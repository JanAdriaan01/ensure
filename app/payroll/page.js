'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

const PayrollContent = lazy(() => import('./PayrollContent'));

export default function PayrollPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Payroll Dashboard..." />}>
      <PayrollContent />
    </Suspense>
  );
}