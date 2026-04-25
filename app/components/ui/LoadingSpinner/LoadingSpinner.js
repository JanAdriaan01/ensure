'use client';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: '24px',
    md: '40px',
    lg: '56px'
  };

  return (
    <div className="loading-container">
      <div className="loading-spinner" style={{ width: sizes[size], height: sizes[size] }}></div>
      {text && <div className="loading-text">{text}</div>}
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .loading-spinner {
          border: 3px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loading-text {
          margin-top: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}