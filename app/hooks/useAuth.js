'use client';

// Re-export from the actual AuthContext
import { useAuth as useAuthContext } from '@/app/context/AuthContext';

export function useAuth() {
  return useAuthContext();
}

// Also export the provider for convenience (though it's already in layout)
export { AuthProvider } from '@/app/context/AuthContext';

export default useAuth;