'use client';

import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: '24px',
    md: '40px',
    lg: '56px'
  };

  return (
    <div className={styles.container}>
      <div 
        className={styles.spinner} 
        style={{ width: sizes[size], height: sizes[size] }}
      ></div>
      {text && <div className={styles.text}>{text}</div>}
    </div>
  );
}