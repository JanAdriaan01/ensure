'use client';

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  label, 
  showPercentage = true,
  size = 'md',
  variant = 'primary',
  animated = false,
  className = '' 
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: { height: '6px', fontSize: '0.65rem' },
    md: { height: '10px', fontSize: '0.7rem' },
    lg: { height: '14px', fontSize: '0.75rem' }
  };

  const variants = {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#dc2626',
    info: '#8b5cf6'
  };

  const getVariantColor = () => {
    if (percentage >= 90) return variants.danger;
    if (percentage >= 70) return variants.warning;
    return variants[variant] || variants.primary;
  };

  return (
    <div className={`progress-bar-container ${className}`}>
      {label && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          {showPercentage && <span className="progress-percentage">{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div 
        className="progress-track"
        style={{ height: sizes[size].height }}
      >
        <div 
          className={`progress-fill ${animated ? 'animated' : ''}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getVariantColor()
          }}
        />
      </div>
      <style jsx>{`
        .progress-bar-container {
          width: 100%;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
          font-size: ${sizes[size].fontSize};
          color: #6b7280;
        }
        .progress-label {
          font-weight: 500;
        }
        .progress-track {
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
        .progress-fill.animated {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}