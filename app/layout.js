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

// Dynamically import the entire client layout with SSR disabled
const ClientLayout = dynamic(() => import('./ClientLayout'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  ),
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}