'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import LoginForm from './LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Already authenticated, redirect to dashboard
  if (isAuthenticated) {
    router.replace('/');
    return null;
  }

  // Not authenticated, show login form
  return <LoginForm />;
}