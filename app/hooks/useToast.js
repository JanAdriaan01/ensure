'use client';

// Re-export from the actual ToastContext
import { useToast as useToastContext } from '@/app/context/ToastContext';

export function useToast() {
  return useToastContext();
}

export default useToast;