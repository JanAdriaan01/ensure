'use client';

import styles from './LoadingSkeleton.module.css';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}></div>
            <div className={styles.cardBody}>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.lineShort}></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className={styles.table}>
            <div className={styles.tableRow}>
              <div className={styles.cell}></div>
              <div className={styles.cell}></div>
              <div className={styles.cell}></div>
              <div className={styles.cell}></div>
            </div>
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className={styles.tableRow}>
                <div className={styles.cell}></div>
                <div className={styles.cell}></div>
                <div className={styles.cell}></div>
                <div className={styles.cell}></div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {renderSkeleton()}
    </div>
  );
}