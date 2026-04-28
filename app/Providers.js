'use client';

import { AuthProvider } from '@/app/context/AuthContext';
import { NotificationProvider } from '@/app/context/NotificationContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { SettingsProvider } from '@/app/context/SettingsContext';
import { PermissionProvider } from '@/app/context/PermissionContext';
import { WebSocketProvider } from '@/app/context/WebSocketContext';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { ToastProvider } from '@/app/context/ToastContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <PermissionProvider>
        <NotificationProvider>
          <WebSocketProvider>
            <CurrencyProvider>
              <SettingsProvider>
                <ThemeProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </ThemeProvider>
              </SettingsProvider>
            </CurrencyProvider>
          </WebSocketProvider>
        </NotificationProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}