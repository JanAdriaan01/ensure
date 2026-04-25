'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CurrencySelector from '@/app/components/CurrencySelector';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/employees', label: 'Employees' },
    { href: '/clients', label: 'Clients' },
    { href: '/quotes', label: 'Quotes' },
    { href: '/reports/monthly', label: 'Reports' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">🔧 ENSURE</Link>
        </div>
        <div className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <CurrencySelector />
          <Link href="/employees/time" className="time-btn">⏰ Log Time</Link>
        </div>
      </div>
      <style jsx>{`
        .navbar {
          background: #1f2937;
          color: white;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .nav-brand a {
          color: white;
          font-size: 1.25rem;
          font-weight: bold;
          text-decoration: none;
        }
        .nav-brand a:hover {
          color: #e5e7eb;
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .nav-link {
          color: #e5e7eb;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: white;
        }
        .nav-link.active {
          color: white;
          border-bottom: 2px solid #2563eb;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .time-btn {
          background: #10b981;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s ease;
        }
        .time-btn:hover {
          background: #059669;
        }
        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            padding: 0.75rem;
          }
          .nav-links {
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
}