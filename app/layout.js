import './globals.css';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { ToastProvider } from '@/app/context/ToastContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { NotificationProvider } from '@/app/context/NotificationContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { SettingsProvider } from '@/app/context/SettingsContext';
import { PermissionProvider } from '@/app/context/PermissionContext';
import { WebSocketProvider } from '@/app/context/WebSocketContext';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

// Metadata export (does NOT contain viewport or themeColor)
export const metadata = {
  title: 'ENSURE System - Complete Business Management Platform',
  description: 'Financial, HR, and Operations Management for Modern Businesses',
  keywords: 'ERP, Business Management, Job Tracking, Invoicing, HR, Inventory, Tools Management',
  authors: [{ name: 'ENSURE Team' }],
  openGraph: {
    title: 'ENSURE System',
    description: 'Complete Business Management Platform',
    type: 'website',
  },
};

// Separate viewport export (required for themeColor and viewport settings)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <ThemeProvider>
                  <SettingsProvider>
                    <PermissionProvider>
                      <WebSocketProvider>
                        <Navbar />
                        <main>{children}</main>
                        <Footer />
                      </WebSocketProvider>
                    </PermissionProvider>
                  </SettingsProvider>
                </ThemeProvider>
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}