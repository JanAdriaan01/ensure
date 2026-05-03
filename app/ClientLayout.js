'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { NotificationProvider } from '@/app/context/NotificationContext';
import { PermissionProvider } from '@/app/context/PermissionContext';
import { SettingsProvider } from '@/app/context/SettingsContext';
import { ToastProvider } from '@/app/context/ToastContext';
import { WebSocketProvider } from '@/app/context/WebSocketContext';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

// Routes that should NOT show navbar and footer
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render WebSocketProvider on client side
  const renderProviders = () => {
    const providers = (
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <PermissionProvider>
                <SettingsProvider>
                  <ToastProvider>
                    {mounted ? (
                      <WebSocketProvider>
                        {!isAuthRoute && <Navbar />}
                        <main>{children}</main>
                        {!isAuthRoute && <Footer />}
                      </WebSocketProvider>
                    ) : (
                      <>
                        {!isAuthRoute && <Navbar />}
                        <main>{children}</main>
                        {!isAuthRoute && <Footer />}
                      </>
                    )}
                  </ToastProvider>
                </SettingsProvider>
              </PermissionProvider>
            </NotificationProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    return providers;
  };

  return renderProviders();
}