'use client';

import { ThemeProvider } from '@/app/context/ThemeContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { NotificationProvider } from '@/app/context/NotificationContext';
import { PermissionProvider } from '@/app/context/PermissionContext';
import { SettingsProvider } from '@/app/context/SettingsContext';
import { ToastProvider } from '@/app/context/ToastContext';
import { WebSocketProvider } from '@/app/context/WebSocketContext';

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <NotificationProvider>
            <PermissionProvider>
              <SettingsProvider>
                <ToastProvider>
                  <WebSocketProvider>
                    {children}
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