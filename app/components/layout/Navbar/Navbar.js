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

  // Close dropdown when clicking outside
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
      icon: '💰',
      links: [
        { href: '/financial', label: 'Dashboard', icon: '📊' },
        { href: '/jobs', label: 'Jobs', icon: '🔨' },
        { href: '/quotes', label: 'Quotes', icon: '📋' },
        { href: '/invoicing', label: 'Invoicing', icon: '📄' },
        { href: '/reconciliation', label: 'Reconciliation', icon: '🔄' },
        { href: '/clients', label: 'Clients', icon: '👥' },
      ]
    },
    {
      title: 'HR',
      icon: '👥',
      links: [
        { href: '/hr', label: 'Dashboard', icon: '📊' },
        { href: '/employees', label: 'Employees', icon: '👤' },
        { href: '/payroll', label: 'Payroll', icon: '💰' },
        { href: '/employees/skills', label: 'Skills', icon: '⭐' },
        { href: '/employees/certifications', label: 'Certifications', icon: '📜' },
      ]
    },
    {
      title: 'Operations',
      icon: '🔧',
      links: [
        { href: '/operations', label: 'Dashboard', icon: '📊' },
        { href: '/tools', label: 'Tools', icon: '🔧' },
        { href: '/inventory', label: 'Inventory', icon: '📦' },
        { href: '/schedule', label: 'Schedule', icon: '📅' },
        { href: '/ohs', label: 'OHS', icon: '🛡️' },
      ]
    },
    {
      title: 'Reports',
      icon: '📊',
      links: [
        { href: '/reports/monthly', label: 'Monthly Reports', icon: '📅' },
        { href: '/reports/financial', label: 'Financial Reports', icon: '💰' },
        { href: '/reports/hr', label: 'HR Reports', icon: '👥' },
        { href: '/reports/operations', label: 'Operations Reports', icon: '🔧' },
      ]
    },
    {
      title: 'Settings',
      icon: '⚙️',
      links: [
        { href: '/Settings', label: 'General Settings', icon: '⚙️' },
        { href: '/Settings/company', label: 'Company Information', icon: '🏢' },
        { href: '/Settings/financial', label: 'Financial Settings', icon: '💰' },
        { href: '/Settings/terms', label: 'Terms & Conditions', icon: '📜' },
        { href: '/Settings/users', label: 'User Management', icon: '👥' },
        { href: '/Settings/backup', label: 'Backup', icon: '💾' },
        { href: '/Settings/audit-logs', label: 'Audit Logs', icon: '📋' },
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

  const getUserRole = () => {
    if (user?.role === 'admin') return 'Administrator';
    if (user?.role === 'user') return 'User';
    return user?.role || 'User';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-brand">
          <Link href="/">
            <span className="logo-icon">🏗️</span>
            <span>ENSURE</span>
          </Link>
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
                <span className="nav-icon">{module.icon}</span>
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
                      <span className="dropdown-link-icon">{link.icon}</span>
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
          {/* Theme Toggle - Sleek version */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle" 
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          
          {/* User Profile Dropdown */}
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
                      <div className="user-name-full">{user?.name || getUserName()}</div>
                      <div className="user-email">{user?.email}</div>
                      <div className="user-role-badge">{getUserRole()}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link href="/dashboard" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>
                    <span className="dropdown-icon">🏠</span>
                    Dashboard
                  </Link>
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
            {mobileMenuOpen ? '✕' : '☰'}
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
                  <span className="mobile-link-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          <button onClick={toggleTheme} className="mobile-theme-btn">
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

        /* Brand */
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
          font-size: 1.5rem;
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
          font-size: 1rem;
        }

        .dropdown-arrow {
          transition: transform 0.2s;
          opacity: 0.6;
          width: 10px;
          height: 10px;
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
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
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

        .dropdown-link-icon {
          font-size: 0.9rem;
        }

        /* Right Side Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Sleek Theme Toggle */
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
          color: var(--text-primary);
        }

        /* User Menu */
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
          width: 10px;
          height: 10px;
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

        .user-role-badge {
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
          padding: 0.5rem 1rem;
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

        /* Mobile Menu */
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

        .mobile-user-role {
          font-size: 0.65rem;
          color: var(--primary);
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
          font-size: 0.8rem;
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
          color: var(--primary);
        }

        .mobile-link-icon {
          font-size: 1rem;
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

        /* Responsive */
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