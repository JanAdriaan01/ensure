'use client';

// Re-export from the actual ThemeContext
import { useTheme as useThemeContext } from '@/app/context/ThemeContext';

export function useTheme() {
  return useThemeContext();
}

export default useTheme;