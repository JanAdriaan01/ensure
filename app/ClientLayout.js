'use client';

import { useEffect, useState } from 'react';
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

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <NotificationProvider>
            <PermissionProvider>
              <SettingsProvider>
                <ToastProvider>
                  <WebSocketProvider>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                    {!mounted && (
                      <div className="fixed bottom-4 right-4 z-50">
                        {/* Placeholder for toast container */}
                      </div>
                    )}
                  </WebSocketProvider>
                </ToastProvider>
              </SettingsProvider>
            </PermissionProvider>
          </NotificationProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}