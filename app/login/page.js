'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import LoginForm from './LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setChecked(true);
      if (isAuthenticated) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}