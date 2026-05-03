'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import CurrencySelector from '@/app/components/CurrencySelector';
import { useTheme } from '@/app/context/ThemeContext';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  let closeTimeout = null;

  const handleMouseEnter = (moduleTitle) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    setOpenDropdown(moduleTitle);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  }, []);

  const navModules = [
    {
      title: 'Financial',
      links: [
        { href: '/financial', label: 'Dashboard' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/quotes', label: 'Quotes' },
        { href: '/invoicing', label: 'Invoicing' },
        { href: '/reconciliation', label: 'Reconciliation' },
        { href: '/clients', label: 'Clients' },
      ]
    },
    {
      title: 'HR',
      links: [
        { href: '/hr', label: 'Dashboard' },
        { href: '/employees', label: 'Employees' },
        { href: '/payroll', label: 'Payroll' },
        { href: '/employees/skills', label: 'Skills' },
        { href: '/employees/certifications', label: 'Certifications' },
      ]
    },
    {
      title: 'Operations',
      links: [
        { href: '/operations', label: 'Dashboard' },
        { href: '/tools', label: 'Tools' },
        { href: '/inventory', label: 'Inventory' },
        { href: '/schedule', label: 'Schedule' },
        { href: '/ohs', label: 'OHS' },
      ]
    },
    {
      title: 'Reports',
      links: [
        { href: '/reports/monthly', label: 'Monthly Reports' },
        { href: '/reports/financial', label: 'Financial Reports' },
        { href: '/reports/hr', label: 'HR Reports' },
        { href: '/reports/operations', label: 'Operations Reports' },
      ]
    },
    {
      title: 'Settings',
      links: [
        { href: '/Settings', label: 'System Settings' },
        { href: '/Settings/users', label: 'User Management' },
        { href: '/Settings/backup', label: 'Backup' },
        { href: '/Settings/audit-logs', label: 'Audit Logs' },
      ]
    }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-brand">
          <Link href="/">ENSURE</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navModules.map((module) => (
            <div
              key={module.title}
              className="nav-item"
              onMouseEnter={() => handleMouseEnter(module.title)}
              onMouseLeave={handleMouseLeave}
            >
              <button className="nav-button">
                {module.title}
                <svg className={`dropdown-arrow ${openDropdown === module.title ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {openDropdown === module.title && (
                <div className="dropdown">
                  {module.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`dropdown-link ${pathname === link.href ? 'active' : ''}`}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side */}
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-btn">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <CurrencySelector />
          <button className="mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navModules.map((module) => (
            <div key={module.title} className="mobile-group">
              <div className="mobile-group-title">{module.title}</div>
              {module.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          <button onClick={toggleTheme} className="mobile-theme-btn">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-light);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
        }

        .nav-brand a {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .nav-item {
          position: relative;
        }

        .nav-button {
          background: transparent;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .nav-button:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .dropdown-arrow {
          transition: transform 0.2s;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          min-width: 200px;
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 0.5rem;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-link {
          padding: 0.625rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.15s;
          border-left: 2px solid transparent;
        }

        .dropdown-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .dropdown-link.active {
          color: var(--primary);
          background: var(--primary-bg);
          border-left-color: var(--primary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .theme-btn {
          background: var(--bg-tertiary);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-btn {
          display: none;
          background: var(--bg-tertiary);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1.25rem;
          font-weight: 500;
        }

        .mobile-menu {
          display: none;
          padding: 1rem 1.5rem;
          background: var(--card-bg);
          border-top: 1px solid var(--border-light);
          max-height: calc(100vh - 64px);
          overflow-y: auto;
        }

        .mobile-group {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .mobile-group-title {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }

        .mobile-link {
          display: block;
          padding: 0.5rem 0;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
        }

        .mobile-link:hover {
          color: var(--primary);
        }

        .mobile-theme-btn {
          width: 100%;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 0.5rem;
          color: var(--text-primary);
          cursor: pointer;
          margin-top: 0.5rem;
        }

        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }
          .mobile-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
}