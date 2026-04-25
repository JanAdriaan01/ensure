'use client';

import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon = null,
  fullWidth = false
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
  };

  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  return (
    <button
      type={type}
      className={`btn ${variants[variant]} ${sizes[size]} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="btn-spinner"></span>}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      {children}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
        .btn-md { padding: 0.5rem 1rem; font-size: 0.875rem; }
        .btn-lg { padding: 0.75rem 1.5rem; font-size: 1rem; }
        .btn-full { width: 100%; }
        
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
        
        .btn-secondary { background: #6b7280; color: white; }
        .btn-secondary:hover:not(:disabled) { background: #4b5563; }
        
        .btn-danger { background: #dc2626; color: white; }
        .btn-danger:hover:not(:disabled) { background: #b91c1c; }
        
        .btn-success { background: #10b981; color: white; }
        .btn-success:hover:not(:disabled) { background: #059669; }
        
        .btn-outline { background: transparent; border: 1px solid #2563eb; color: #2563eb; }
        .btn-outline:hover:not(:disabled) { background: #eff6ff; }
        
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
};

export default Button;