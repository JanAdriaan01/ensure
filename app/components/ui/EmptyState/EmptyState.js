'use client';

import Button from '../Button/Button';
import styles from './EmptyState.module.css';

export default function EmptyState({ 
  title = 'No data found',
  message = 'There are no items to display.',
  icon = '📭',
  actionText,
  onAction,
  variant = 'default'
}) {
  return (
    <div className={`${styles.emptyState} ${styles[variant]}`}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
}