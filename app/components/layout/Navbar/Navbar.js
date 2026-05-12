'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navModules = [
    {
      title: 'Financial',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 7H7M17 12H7M17 17H7" stroke="currentColor" strokeLinecap="round"/>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"/>
        </svg>
      ),
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
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor"/>
        </svg>
      ),
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
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/operations', label: 'Dashboard' },
        { href: '/tools', label: 'Tools' },
        { href: '/inventory', label: 'Inventory' },
        { href: '/schedule', label: 'Schedule' },
        { href: '/ohs', label: 'OHS' },
      ]
    },
    {
      title: 'CRM',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/organizations', label: 'Organizations' },
        { href: '/clients', label: 'Client Sites' },
        { href: '/contacts', label: 'Contacts' },
        { href: '/leads', label: 'Leads' },
      ]
    },
    {
      title: 'Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3" stroke="currentColor"/>
          <path d="M12 2v12m0 0 3-3m-3 3-3-3" stroke="currentColor"/>
          <path d="M3 2h18" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/reports/monthly', label: 'Monthly Reports' },
        { href: '/reports/financial', label: 'Financial Reports' },
        { href: '/reports/hr', label: 'HR Reports' },
        { href: '/reports/operations', label: 'Operations Reports' },
        { href: '/reports/crm', label: 'CRM Reports' },
      ]
    },
    {
      title: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" stroke="currentColor"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor"/>
        </svg>
      ),
      links: [
        { href: '/Settings', label: 'General Settings' },
        { href: '/Settings/company', label: 'Company Information' },
        { href: '/Settings/financial', label: 'Financial Settings' },
        { href: '/Settings/organizations', label: 'Organization Settings' },
        { href: '/Settings/users', label: 'User Management' },
      ]
    }
  ];

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

  const getUserRole = () => {
    if (user?.role === 'admin') return 'Administrator';
    if (user?.role === 'user') return 'User';
    return user?.role || 'User';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">
            <span className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor"/>
              </svg>
            </span>
            <span>ENSURE</span>
          </Link>
        </div>

        <div className="nav-links">
          {navModules.map((module) => (
            <div
              key={module.title}
              className="nav-item"
              onMouseEnter={() => handleMouseEnter(module.title)}
              onMouseLeave={handleMouseLeave}
            >
              <button className="nav-button">
                <span className="nav-icon">{module.icon}</span>
                {module.title}
                <svg className={`dropdown-arrow ${openDropdown === module.title ? 'open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5" stroke="currentColor"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor"/>
              </svg>
            )}
          </button>
          
          {isAuthenticated && (
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                }}
              >
                <div className="user-avatar">
                  {getUserInitials()}
                </div>
                <span className="user-name">{getUserName()}</span>
                <svg className={`user-arrow ${userMenuOpen ? 'open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      <div className="user-name-full">{user?.name || getUserName()}</div>
                      <div className="user-email">{user?.email}</div>
                      <div className="user-role-badge">{getUserRole()}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link href="/dashboard" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>
                    <span className="dropdown-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-7H9v7H5a2 2 0 0 1-2-2z" stroke="currentColor"/>
                      </svg>
                    </span>
                    Dashboard
                  </Link>
                  <Link href="/Settings/users" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>
                    <span className="dropdown-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor"/>
                      </svg>
                    </span>
                    Profile Settings
                  </Link>
                  <Link href="/Settings" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>
                    <span className="dropdown-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="3" stroke="currentColor"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor"/>
                      </svg>
                    </span>
                    Account Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="user-dropdown-link logout">
                    <span className="dropdown-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor"/>
                        <polyline points="16 17 21 12 16 7" stroke="currentColor"/>
                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor"/>
                      </svg>
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button className="mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {isAuthenticated && (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {getUserInitials()}
              </div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{getUserName()}</div>
                <div className="mobile-user-email">{user?.email}</div>
                <div className="mobile-user-role">{getUserRole()}</div>
              </div>
              <button onClick={handleLogout} className="mobile-logout-btn">
                Logout
              </button>
            </div>
          )}
          
          {navModules.map((module) => (
            <div key={module.title} className="mobile-group">
              <div className="mobile-group-title">
                <span className="mobile-group-icon">{module.icon}</span>
                {module.title}
              </div>
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
          height: 64px;
        }

        .nav-brand a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          letter-spacing: -0.5px;
        }

        .logo-icon {
          color: #22c55e;
          display: flex;
          align-items: center;
        }

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
          padding: 0.5rem 1rem;
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

        .nav-icon {
          color: #22c55e;
          display: flex;
          align-items: center;
        }

        .dropdown-arrow {
          transition: transform 0.2s;
          opacity: 0.6;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          min-width: 220px;
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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
          padding: 0.5rem 0.75rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
          transition: all 0.15s;
        }

        .dropdown-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .dropdown-link.active {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .theme-toggle {
          background: transparent;
          border: none;
          padding: 0.5rem;
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .theme-toggle:hover {
          background: var(--bg-tertiary);
          color: #22c55e;
        }

        .user-menu {
          position: relative;
        }

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          padding: 0.375rem 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-menu-btn:hover {
          background: var(--bg-tertiary);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: #22c55e;
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
          min-width: 260px;
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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
          background: #22c55e;
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

        .user-role-badge {
          font-size: 0.65rem;
          color: #22c55e;
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
          padding: 0.5rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.15s;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
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
          display: flex;
          align-items: center;
          color: #22c55e;
        }

        .mobile-btn {
          display: none;
          background: var(--bg-tertiary);
          border: none;
          padding: 0.5rem;
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          color: var(--text-secondary);
          align-items: center;
          justify-content: center;
        }

        .mobile-menu {
          display: none;
          padding: 1rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-light);
          max-height: calc(100vh - 64px);
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
          background: #22c55e;
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

        .mobile-user-role {
          font-size: 0.65rem;
          color: #22c55e;
          margin-top: 0.25rem;
        }

        .mobile-logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .mobile-group {
          margin-bottom: 1.25rem;
        }

        .mobile-group-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }

        .mobile-group-icon {
          color: #22c55e;
        }

        .mobile-link {
          display: block;
          padding: 0.5rem 0;
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
          color: #22c55e;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }
          .user-name {
            display: none;
          }
          .mobile-btn {
            display: flex;
          }
          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
}