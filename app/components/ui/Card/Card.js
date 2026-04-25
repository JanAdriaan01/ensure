'use client';

import styles from './Card.module.css';

export default function Card({ 
  children, 
  variant = 'default', 
  hover = false, 
  className = '',
  onClick 
}) {
  const cardClasses = [
    styles.card,
    styles[variant],
    hover && styles.hover,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
}