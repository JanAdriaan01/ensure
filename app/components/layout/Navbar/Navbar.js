'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import CurrencySelector from '@/app/components/CurrencySelector';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/app/hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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
        { href: '/Settings', label: 'General Settings' },
        { href: '/Settings/company', label: 'Company Information' },
        { href: '/Settings/financial', label: 'Financial Settings' },
        { href: '/Settings/terms', label: 'Terms & Conditions' },
        { href: '/Settings/users', label: 'User Management' },
        { href: '/Settings/backup', label: 'Backup' },
        { href: '/Settings/audit-logs', label: 'Audit Logs' },
      ]
    }
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

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

        {/* Right Side - User Profile & Actions */}
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-btn" title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <CurrencySelector />
          
          {/* User Profile Dropdown */}
          {isAuthenticated && (
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
              >
                <div className="user-avatar">
                  {getUserInitials()}
                </div>
                <span className="user-name">{getUserName()}</span>
                <svg className={`user-arrow ${userMenuOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {getUserInitials()}
                    </div>
                    <div className="user-details">
                      <div className="user-name-full">{user?.name || 'User'}</div>
                      <div className="user-email">{user?.email}</div>
                      <div className="user-role">{user?.role || 'User'}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link href="/Settings/users" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>
                    <span className="dropdown-icon">👤</span>
                    Profile Settings
                  </Link>
                  <Link href="/Settings" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>
                    <span className="dropdown-icon">⚙️</span>
                    Account Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="user-dropdown-link logout">
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button className="mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            Menu
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {/* Mobile User Info */}
          {isAuthenticated && (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {getUserInitials()}
              </div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{getUserName()}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
              <button onClick={handleLogout} className="mobile-logout-btn">
                Logout
              </button>
            </div>
          )}
          
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

        /* Dropdown Menu */
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
          padding: 0.5rem;
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-btn:hover {
          background: var(--bg-quaternary);
        }

        /* User Menu */
        .user-menu {
          position: relative;
        }

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-tertiary);
          border: none;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-menu-btn:hover {
          background: var(--bg-quaternary);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .user-arrow {
          transition: transform 0.2s;
          opacity: 0.6;
        }

        .user-arrow.open {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 280px;
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
          z-index: 1000;
          animation: fadeIn 0.15s ease;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .user-avatar-large {
          width: 48px;
          height: 48px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .user-details {
          flex: 1;
        }

        .user-name-full {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .user-email {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .user-role {
          font-size: 0.65rem;
          color: var(--primary);
          margin-top: 0.25rem;
          text-transform: capitalize;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-light);
          margin: 0.5rem 0;
        }

        .user-dropdown-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.15s;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
        }

        .user-dropdown-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .user-dropdown-link.logout {
          color: #ef4444;
        }

        .user-dropdown-link.logout:hover {
          background: #fee2e2;
        }

        .dropdown-icon {
          font-size: 1rem;
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

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .mobile-user-avatar {
          width: 48px;
          height: 48px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .mobile-user-details {
          flex: 1;
        }

        .mobile-user-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .mobile-user-email {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .mobile-logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.75rem;
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
          .user-name {
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