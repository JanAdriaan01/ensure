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
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <CurrencySelector />
          <button className="mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            Menu
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
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }

        /* Brand */
        .nav-brand a {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          letter-spacing: -0.5px;
        }

        /* Desktop Navigation */
        .nav-links {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .nav-item {
          position: relative;
        }

        .nav-button {
          background: transparent;
          border: none;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .nav-button:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .dropdown-arrow {
          transition: transform 0.2s;
          opacity: 0.6;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        /* Dropdown Menu - Vertical Stack */
        .dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          min-width: 220px;
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-link {
          display: block;
          padding: 0.625rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
          transition: all 0.15s;
          text-align: left;
        }

        .dropdown-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .dropdown-link.active {
          color: var(--primary);
          background: var(--primary-bg);
        }

        /* Right Side Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .theme-btn {
          background: var(--bg-tertiary);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .theme-btn:hover {
          background: var(--bg-quaternary);
          color: var(--text-primary);
        }

        .mobile-btn {
          display: none;
          background: var(--bg-tertiary);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /* Mobile Menu */
        .mobile-menu {
          display: none;
          padding: 1.5rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-light);
          max-height: calc(100vh - 70px);
          overflow-y: auto;
        }

        .mobile-group {
          margin-bottom: 1.5rem;
        }

        .mobile-group-title {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-tertiary);
          margin-bottom: 0.75rem;
        }

        .mobile-link {
          display: block;
          padding: 0.625rem 0;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border-bottom: 1px solid var(--border-light);
        }

        .mobile-link:last-child {
          border-bottom: none;
        }

        .mobile-link:hover {
          color: var(--primary);
        }

        .mobile-theme-btn {
          width: 100%;
          padding: 0.625rem;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 1rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }
          .mobile-btn {
            display: block;
          }
          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
}