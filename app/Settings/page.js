'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [SettingsContent, setSettingsContent] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Dynamically import on client side only
    import('./SettingsContent').then((module) => {
      setSettingsContent(() => module.default);
    });
  }, []);

  if (!mounted || !SettingsContent) {
    return <LoadingSpinner text="Loading settings..." />;
  }

  const Content = SettingsContent;
  return <Content />;
}