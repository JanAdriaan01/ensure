import './globals.css';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { ToastProvider } from '@/app/context/ToastContext';
import Navbar from '@/app/components/layout/Navbar/Navbar';
import Footer from '@/app/components/layout/Footer/Footer';

export const metadata = {
  title: 'ENSURE System',
  description: 'Complete Project & Workforce Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <ToastProvider>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}