import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'ENSURE System',
  description: 'Complete Project & Workforce Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <Link href="/">🔧 ENSURE</Link>
            </div>
            <div className="nav-links">
              <Link href="/">Dashboard</Link>
              <Link href="/jobs">Jobs</Link>
              <Link href="/employees">Employees</Link>
              <Link href="/clients">Clients</Link>
              <Link href="/quotes">Quotes</Link>
              <Link href="/reports/monthly">Reports</Link>
            </div>
            <div className="nav-actions">
              <Link href="/employees/time" className="time-btn">⏰ Log Time</Link>
            </div>
          </div>
        </nav>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}