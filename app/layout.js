'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';

// Context Providers
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { ToastProvider } from '@/app/context/ToastContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { NotificationProvider } from '@/app/context/NotificationContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { SettingsProvider } from '@/app/context/SettingsContext';
import { PermissionProvider } from '@/app/context/PermissionContext';
import { WebSocketProvider } from '@/app/context/WebSocketContext';

// Layout Components
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Toaster } from '@/app/components/ui/Alert';

// Hooks
import { useAuth } from '@/app/hooks/useAuth';
import { useTheme } from '@/app/hooks/useTheme';
import { useWebSocket } from '@/app/hooks/useWebSocket';

export const metadata = {
  title: 'ENSURE System - Complete Business Management Platform',
  description: 'Financial, HR, and Operations Management for Modern Businesses',
  keywords: 'ERP, Business Management, Job Tracking, Invoicing, HR, Inventory, Tools Management',
  authors: [{ name: 'ENSURE Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ENSURE System',
    description: 'Complete Business Management Platform',
    type: 'website',
  },
};

// Inner layout component that uses hooks
function RootLayoutInner({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { connect, disconnect, isConnected } = useWebSocket();

  // Apply theme class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      if (isAuthenticated) {
        disconnect();
      }
    };
  }, [isAuthenticated]);

  // Check if current route requires authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Show loading for protected routes
  if (loading && !isPublicRoute) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-tertiary">Loading ENSURE System...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body className="bg-secondary min-h-screen">
        <div className="flex flex-col min-h-screen">
          {/* Navbar - only show on authenticated pages or public routes */}
          {(!isPublicRoute || pathname === '/') && <Navbar />}
          
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer - only show on main pages */}
          {!isPublicRoute && pathname !== '/login' && pathname !== '/register' && <Footer />}
        </div>
        
        {/* Toast Container */}
        <Toaster position="bottom-right" />
        
        {/* Global Notification Center */}
        <div id="notification-root" />
      </body>
    </html>
  );
}

// Main layout with all providers
export default function RootLayout({ children }) {
  return (
    <CurrencyProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <ThemeProvider>
              <SettingsProvider>
                <PermissionProvider>
                  <WebSocketProvider>
                    <RootLayoutInner>{children}</RootLayoutInner>
                  </WebSocketProvider>
                </PermissionProvider>
              </SettingsProvider>
            </ThemeProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </CurrencyProvider>
  );
}