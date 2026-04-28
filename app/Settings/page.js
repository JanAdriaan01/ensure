'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// Dynamically import the settings content with SSR disabled
const SettingsContentComponent = dynamic(() => import('./SettingsContent'), {
  ssr: false,
  loading: () => <LoadingSpinner text="Loading settings..." />,
});

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner text="Loading settings..." />;
  }

  return <SettingsContentComponent />;
}