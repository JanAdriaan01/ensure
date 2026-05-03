'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="settings-layout">
      <div className="settings-sidebar">
        <Link href="/Settings" className={`sidebar-link ${pathname === '/Settings' ? 'active' : ''}`}>
          General Settings
        </Link>
        <Link href="/Settings/company" className={`sidebar-link ${pathname === '/Settings/company' ? 'active' : ''}`}>
          Company Information
        </Link>
        <Link href="/Settings/terms" className={`sidebar-link ${pathname === '/Settings/terms' ? 'active' : ''}`}>
          Terms & Conditions
        </Link>
        <Link href="/Settings/users" className={`sidebar-link ${pathname === '/Settings/users' ? 'active' : ''}`}>
          User Management
        </Link>
        <Link href="/Settings/backup" className={`sidebar-link ${pathname === '/Settings/backup' ? 'active' : ''}`}>
          Backup
        </Link>
        <Link href="/Settings/audit-logs" className={`sidebar-link ${pathname === '/Settings/audit-logs' ? 'active' : ''}`}>
          Audit Logs
        </Link>
      </div>
      <div className="settings-content">
        {children}
      </div>

      <style jsx>{`
        .settings-layout {
          display: flex;
          gap: 2rem;
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .settings-sidebar {
          width: 260px;
          background: var(--card-bg);
          border-radius: 0.75rem;
          border: 1px solid var(--card-border);
          padding: 0.5rem;
        }
        .dark .settings-sidebar {
          background: #1f2937;
          border-color: #374151;
        }
        .sidebar-link {
          display: block;
          padding: 0.75rem 1rem;
          color: #4b5563;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        .dark .sidebar-link {
          color: #9ca3af;
        }
        .sidebar-link:hover {
          background: #f3f4f6;
          color: #111827;
        }
        .dark .sidebar-link:hover {
          background: #374151;
          color: #f9fafb;
        }
        .sidebar-link.active {
          background: #3b82f6;
          color: white;
        }
        .settings-content {
          flex: 1;
          background: var(--card-bg);
          border-radius: 0.75rem;
          border: 1px solid var(--card-border);
          padding: 1.5rem;
        }
        .dark .settings-content {
          background: #1f2937;
          border-color: #374151;
        }
        @media (max-width: 768px) {
          .settings-layout {
            flex-direction: column;
            padding: 1rem;
            gap: 1rem;
          }
          .settings-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}