'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import DashboardContent from '@/app/components/dashboard/DashboardContent';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  // Authenticated, show dashboard
  return <DashboardContent />;
}