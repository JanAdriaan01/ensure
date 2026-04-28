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
      icon: '💰',
      links: [
        { href: '/financial', label: 'Dashboard', icon: '📊' },
        { href: '/jobs', label: 'Job Management', icon: '📋' },
        { href: '/quotes', label: 'Quoting', icon: '📄' },
        { href: '/invoicing', label: 'Invoicing', icon: '🧾' },
        { href: '/reconciliation', label: 'Reconciliation', icon: '🔄' },
        { href: '/clients', label: 'Client Management', icon: '🏢' },
      ]
    },
    {
      title: 'HR',
      icon: '👥',
      links: [
        { href: '/hr', label: 'Dashboard', icon: '📊' },
        { href: '/employees', label: 'Employees', icon: '👤' },
        { href: '/employees/new', label: 'Add Employee', icon: '➕' },
        { href: '/payroll', label: 'Payroll', icon: '💰' },
        { href: '/employees/skills', label: 'Skills', icon: '⭐' },
        { href: '/employees/certifications', label: 'Certifications', icon: '📜' },
      ]
    },
    {
      title: 'Operations',
      icon: '⚙️',
      links: [
        { href: '/operations', label: 'Dashboard', icon: '📊' },
        { href: '/tools', label: 'Tools', icon: '🔧' },
        { href: '/inventory', label: 'Inventory', icon: '📦' },
        { href: '/schedule', label: 'Schedule', icon: '📅' },
        { href: '/ohs', label: 'OHS', icon: '🛡️' },
      ]
    }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">🔧 ENSURE</Link>
        </div>
        
        <div className="nav-desktop">
          {navModules.map(module => (
            <div 
              key={module.title} 
              className="nav-dropdown"
              onMouseEnter={() => setOpenDropdown(module.title)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="nav-dropdown-btn">
                <span className="nav-icon">{module.icon}</span>
                {module.title}
                <span className="dropdown-arrow">▼</span>
              </button>
              {openDropdown === module.title && (
                <div className="nav-dropdown-content">
                  {module.links.map(link => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`nav-dropdown-link ${pathname === link.href ? 'active' : ''}`}
                    >
                      <span className="nav-link-icon">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <CurrencySelector />
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="nav-mobile">
          {navModules.map(module => (
            <div key={module.title} className="nav-mobile-module">
              <div className="nav-mobile-title">
                <span className="nav-icon">{module.icon}</span>
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
                    <span className="nav-link-icon">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <button onClick={toggleTheme} className="mobile-theme-toggle">
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
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
          backdrop-filter: blur(10px);
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
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: bold;
          text-decoration: none;
        }
        
        .nav-brand a:hover {
          color: var(--primary);
        }
        
        .nav-desktop {
          display: flex;
          gap: 0.5rem;
        }
        
        .nav-dropdown {
          position: relative;
        }
        
        .nav-dropdown-btn {
          background: transparent;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        
        .nav-dropdown-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .dropdown-arrow {
          font-size: 0.6rem;
        }
        
        .nav-dropdown-content {
          position: absolute;
          background: var(--bg-primary);
          min-width: 220px;
          box-shadow: var(--shadow-lg);
          border-radius: 0.5rem;
          border: 1px solid var(--border-light);
          z-index: 1;
          top: 100%;
          left: 0;
          margin-top: 0.25rem;
          overflow: hidden;
        }
        
        .nav-dropdown-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          transition: background 0.2s;
          border-bottom: 1px solid var(--border-light);
        }
        
        .nav-dropdown-link:last-child {
          border-bottom: none;
        }
        
        .nav-dropdown-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .nav-dropdown-link.active {
          color: var(--primary);
          background: var(--primary-bg);
        }
        
        .nav-icon, .nav-link-icon {
          font-size: 1rem;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .theme-toggle {
          background: var(--bg-tertiary);
          border: none;
          border-radius: 0.5rem;
          padding: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }
        
        .theme-toggle:hover {
          background: var(--bg-quaternary);
        }
        
        .mobile-menu-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.25rem;
          cursor: pointer;
          display: none;
        }
        
        .nav-mobile {
          display: none;
          padding: 1rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-light);
        }
        
        .nav-mobile-module {
          margin-bottom: 1rem;
        }
        
        .nav-mobile-title {
          padding: 0.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-light);
        }
        
        .nav-mobile-links {
          padding-left: 1.5rem;
        }
        
        .nav-mobile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        
        .nav-mobile-link:hover {
          color: var(--primary);
        }
        
        .mobile-theme-toggle {
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.5rem;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 0.5rem;
          color: var(--text-primary);
          cursor: pointer;
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