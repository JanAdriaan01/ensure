'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import CurrencySelector from '@/app/components/CurrencySelector';

export default function Navbar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navModules = [
    {
      title: 'Financial',
      icon: '💰',
      links: [
        { href: '/jobs', label: 'Job Management', icon: '📋' },
        { href: '/quotes', label: 'Quoting', icon: '📄' },
        { href: '/invoicing', label: 'Invoicing', icon: '🧾' },
        { href: '/reconciliation', label: 'Reconciliation', icon: '🔄' },
        { href: '/clients', label: 'Client Management', icon: '🏢' },
        { href: '/reports/monthly', label: 'Monthly Reports', icon: '📊' }
      ]
    },
    {
      title: 'HR',
      icon: '👥',
      links: [
        { href: '/employees/new', label: 'Create Employee', icon: '➕' },
        { href: '/payroll', label: 'Payroll', icon: '💰' },
        { href: '/employees', label: 'Employee Management', icon: '👤' },
        { href: '/employees/skills', label: 'Add Skill', icon: '⭐' },
        { href: '/employees/certifications', label: 'Add Certificate', icon: '📜' }
      ]
    },
    {
      title: 'Operations',
      icon: '⚙️',
      links: [
        { href: '/tools', label: 'Tools Management', icon: '🔧' },
        { href: '/schedule', label: 'Scheduling', icon: '📅' },
        { href: '/inventory', label: 'Inventory', icon: '📦' },
        { href: '/ohs', label: 'OHS Compliance', icon: '🛡️' }
      ]
    }
  ];

  const toggleDropdown = (title) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">🔧 ENSURE</Link>
        </div>
        
        {/* Desktop Navigation */}
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
                    <Link key={link.href} href={link.href} className="nav-dropdown-link">
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
          <CurrencySelector />
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="nav-mobile">
          {navModules.map(module => (
            <div key={module.title} className="nav-mobile-module">
              <div 
                className="nav-mobile-title"
                onClick={() => toggleDropdown(module.title)}
              >
                <span className="nav-icon">{module.icon}</span>
                {module.title}
                <span className="dropdown-arrow">{openDropdown === module.title ? '▲' : '▼'}</span>
              </div>
              {openDropdown === module.title && (
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
              )}
            </div>
          ))}
        </div>
      )}

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
        .nav-desktop {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .nav-dropdown {
          position: relative;
          display: inline-block;
        }
        .nav-dropdown-btn {
          background: transparent;
          color: #e5e7eb;
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
          background: #374151;
          color: white;
        }
        .dropdown-arrow {
          font-size: 0.6rem;
          margin-left: 0.25rem;
        }
        .nav-dropdown-content {
          position: absolute;
          background: white;
          min-width: 220px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-radius: 0.5rem;
          z-index: 1;
          top: 100%;
          left: 0;
          margin-top: 0.25rem;
        }
        .nav-dropdown-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #374151;
          font-size: 0.875rem;
          transition: background 0.2s;
          border-bottom: 1px solid #f3f4f6;
        }
        .nav-dropdown-link:last-child {
          border-bottom: none;
        }
        .nav-dropdown-link:hover {
          background: #f3f4f6;
        }
        .nav-link-icon {
          font-size: 1rem;
        }
        .nav-icon {
          font-size: 1rem;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .mobile-menu-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          display: none;
        }
        .nav-mobile {
          display: none;
          padding: 1rem;
          background: #374151;
          border-top: 1px solid #4b5563;
        }
        .nav-mobile-module {
          margin-bottom: 0.5rem;
        }
        .nav-mobile-title {
          padding: 0.75rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          border-radius: 0.5rem;
        }
        .nav-mobile-title:hover {
          background: #4b5563;
        }
        .nav-mobile-links {
          padding-left: 2rem;
          margin-top: 0.25rem;
        }
        .nav-mobile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          text-decoration: none;
          color: #e5e7eb;
          font-size: 0.875rem;
          border-radius: 0.5rem;
        }
        .nav-mobile-link:hover {
          background: #4b5563;
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