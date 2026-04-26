'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import CurrencySelector from '@/app/components/CurrencySelector';

export default function Navbar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/financial', label: 'Financial', icon: '💰' },
    { href: '/hr', label: 'HR', icon: '👥' },
    { href: '/operations', label: 'Operations', icon: '⚙️' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">🔧 ENSURE</Link>
        </div>
        
        <div className="nav-links">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        
        <div className="nav-actions">
          <CurrencySelector />
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
        }
        .nav-brand a {
          color: white;
          font-size: 1.25rem;
          font-weight: bold;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e5e7eb;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }
        .nav-link:hover {
          background: #374151;
          color: white;
        }
        .nav-link.active {
          background: #2563eb;
          color: white;
        }
        .nav-icon {
          font-size: 1rem;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            gap: 0.75rem;
            padding: 0.75rem;
          }
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
}