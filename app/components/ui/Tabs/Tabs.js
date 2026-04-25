'use client';

import { useState } from 'react';
import styles from './Tabs.module.css';

export default function Tabs({ tabs, defaultTab, onTabChange, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  return (
    <div className={styles.tabs}>
      <div className={styles.header}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}