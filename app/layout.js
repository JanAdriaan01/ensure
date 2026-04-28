import './globals.css';
import dynamic from 'next/dynamic';

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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

const ClientProviders = dynamic(() => import('./ClientProviders'), {
  ssr: false,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}