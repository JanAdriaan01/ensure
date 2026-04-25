'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const menuItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/jobs', icon: '📋', label: 'Jobs' },
  { href: '/employees', icon: '👥', label: 'Employees' },
  { href: '/clients', icon: '🏢', label: 'Clients' },
  { href: '/quotes', icon: '💰', label: 'Quotes' },
  { href: '/reports/monthly', icon: '📊', label: 'Reports' }
];

export default function Sidebar({ isOpen = true, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.header}>
          <span className={styles.logo}>🔧 ENSURE</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <nav className={styles.nav}>
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${pathname === item.href ? styles.active : ''}`}
              onClick={onClose}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}