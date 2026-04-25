'use client';

import styles from './Card.module.css';

export default function Card({ 
  children, 
  variant = 'default', 
  hover = false, 
  className = '',
  onClick 
}) {
  const variantClass = variant === 'stat' ? styles.statCard : styles.defaultCard;
  
  return (
    <div 
      className={`${styles.card} ${variantClass} ${hover ? styles.hoverCard : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}