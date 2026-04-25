'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success': return { background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' };
      case 'error': return { background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' };
      case 'warning': return { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
      default: return { background: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' };
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast"
            style={getToastStyles(toast.type)}
          >
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="toast-close">×</button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1100;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .toast {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 250px;
          animation: slideIn 0.3s ease;
        }
        .toast-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          margin-left: auto;
          padding: 0;
          line-height: 1;
          opacity: 0.7;
        }
        .toast-close:hover {
          opacity: 1;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}