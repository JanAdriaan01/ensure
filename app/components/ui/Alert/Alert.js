'use client';

import { useState } from 'react';
import styles from './Alert.module.css';

export default function Alert({ 
  type = 'info', 
  title, 
  message, 
  dismissible = false,
  onDismiss 
}) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  const types = {
    success: { icon: '✅', className: styles.success },
    error: { icon: '❌', className: styles.error },
    warning: { icon: '⚠️', className: styles.warning },
    info: { icon: 'ℹ️', className: styles.info }
  };

  const { icon, className } = types[type] || types.info;

  return (
    <div className={`${styles.alert} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        {message && <div className={styles.message}>{message}</div>}
      </div>
      {dismissible && (
        <button className={styles.dismiss} onClick={handleDismiss}>×</button>
      )}
    </div>
  );
}