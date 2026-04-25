'use client';

import { useEffect } from 'react';
import Button from '../Button/Button';
import styles from './Modal.module.css';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showClose = true,
  showFooter = false,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: '400px',
    md: '500px',
    lg: '700px',
    xl: '900px',
    full: '95%'
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.content} 
        style={{ width: sizes[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>{title}</h2>
          {showClose && (
            <button className={styles.close} onClick={onClose}>×</button>
          )}
        </div>
        
        <div className={styles.body}>
          {children}
        </div>
        
        {showFooter && (
          <div className={styles.footer}>
            <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
            <Button onClick={onConfirm}>{confirmText}</Button>
          </div>
        )}
      </div>
    </div>
  );
}