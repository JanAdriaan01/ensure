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
  const dropdownRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        { href: '/users', label: 'User Management' },
        { href: '/backup', label: 'Backup' },
        { href: '/audit-logs', label: 'Audit Logs' },
      ]
    }
  ];

  return (
    <nav className="navbar" ref={dropdownRef}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">ENSURE</Link>
        </div>
        
        <div className="nav-desktop">
          {navModules.map(module => (
            <div 
              key={module.title} 
              className="nav-dropdown"
              onMouseEnter={() => handleMouseEnter(module.title)}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`nav-dropdown-btn ${openDropdown === module.title ? 'active' : ''}`}>
                {module.title}
                <span className={`dropdown-arrow ${openDropdown === module.title ? 'open' : ''}`}>▼</span>
              </button>
              {openDropdown === module.title && (
                <div className="nav-dropdown-content">
                  <div className="nav-dropdown-scroll">
                    {module.links.map(link => (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        className={`nav-dropdown-link ${pathname === link.href ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <CurrencySelector />
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            Menu
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="nav-mobile">
          {navModules.map(module => (
            <div key={module.title} className="nav-mobile-module">
              <div className="nav-mobile-title">
                {module.title}
              </div>
              <div className="nav-mobile-links">
                {module.links.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="nav-mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <button onClick={toggleTheme} className="mobile-theme-toggle">
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .dark .navbar {
          background: #1f2937;
          border-bottom: 1px solid #374151;
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
          color: #111827;
          font-size: 1.25rem;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: -0.025em;
        }
        
        .dark .nav-brand a {
          color: #f9fafb;
        }
        
        .nav-brand a:hover {
          color: #3b82f6;
        }
        
        .nav-desktop {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }
        
        .nav-dropdown {
          position: relative;
        }
        
        .nav-dropdown-btn {
          background: transparent;
          color: #4b5563;
          padding: 0.5rem 0.875rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.15s ease;
        }
        
        .dark .nav-dropdown-btn {
          color: #d1d5db;
        }
        
        .nav-dropdown-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .dark .nav-dropdown-btn:hover {
          background: #374151;
          color: #f9fafb;
        }
        
        .nav-dropdown-btn.active {
          color: #3b82f6;
        }
        
        .dropdown-arrow {
          font-size: 0.6rem;
          transition: transform 0.15s ease;
          opacity: 0.6;
        }
        
        .dropdown-arrow.open {
          transform: rotate(180deg);
        }
        
        .nav-dropdown-content {
          position: absolute;
          background: #ffffff;
          min-width: 200px;
          max-height: 360px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          z-index: 1000;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          animation: dropdownFadeIn 0.15s ease;
        }
        
        .dark .nav-dropdown-content {
          background: #1f2937;
          border-color: #374151;
        }
        
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-dropdown-scroll {
          max-height: 340px;
          overflow-y: auto;
          padding: 0.25rem 0;
        }
        
        .nav-dropdown-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .nav-dropdown-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 2px;
        }
        
        .dark .nav-dropdown-scroll::-webkit-scrollbar-track {
          background: #374151;
        }
        
        .nav-dropdown-scroll::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 2px;
        }
        
        .dark .nav-dropdown-scroll::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        
        .nav-dropdown-link {
          display: block;
          padding: 0.5rem 1rem;
          text-decoration: none;
          color: #4b5563;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        
        .dark .nav-dropdown-link {
          color: #d1d5db;
        }
        
        .nav-dropdown-link:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .dark .nav-dropdown-link:hover {
          background: #374151;
          color: #f9fafb;
        }
        
        .nav-dropdown-link.active {
          color: #3b82f6;
          background: #eff6ff;
        }
        
        .dark .nav-dropdown-link.active {
          color: #60a5fa;
          background: #1e3a5f;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .theme-toggle {
          background: #f3f4f6;
          border: none;
          border-radius: 0.375rem;
          padding: 0.375rem 0.75rem;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          color: #4b5563;
          transition: all 0.15s ease;
        }
        
        .dark .theme-toggle {
          background: #374151;
          color: #d1d5db;
        }
        
        .theme-toggle:hover {
          background: #e5e7eb;
        }
        
        .dark .theme-toggle:hover {
          background: #4b5563;
        }
        
        .mobile-menu-btn {
          background: #f3f4f6;
          border: none;
          border-radius: 0.375rem;
          padding: 0.375rem 0.75rem;
          color: #4b5563;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          display: none;
        }
        
        .dark .mobile-menu-btn {
          background: #374151;
          color: #d1d5db;
        }
        
        .nav-mobile {
          display: none;
          padding: 1rem 1.5rem;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          max-height: calc(100vh - 64px);
          overflow-y: auto;
        }
        
        .dark .nav-mobile {
          background: #1f2937;
          border-top-color: #374151;
        }
        
        .nav-mobile-module {
          margin-bottom: 1rem;
        }
        
        .nav-mobile-title {
          padding: 0.5rem 0;
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dark .nav-mobile-title {
          color: #f9fafb;
          border-bottom-color: #374151;
        }
        
        .nav-mobile-links {
          padding: 0.5rem 0;
        }
        
        .nav-mobile-link {
          display: block;
          padding: 0.5rem 0;
          text-decoration: none;
          color: #4b5563;
          font-size: 0.875rem;
        }
        
        .dark .nav-mobile-link {
          color: #d1d5db;
        }
        
        .nav-mobile-link:hover {
          color: #3b82f6;
        }
        
        .mobile-theme-toggle {
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.375rem;
          color: #4b5563;
          font-size: 0.75rem;
          cursor: pointer;
        }
        
        .dark .mobile-theme-toggle {
          background: #374151;
          color: #d1d5db;
        }
        
        @media (max-width: 900px) {
          .nav-desktop {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
          .nav-mobile {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
}