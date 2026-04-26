'use client';

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  rounded = false,
  className = '' 
}) {
  const variants = {
    default: { bg: '#f3f4f6', color: '#374151' },
    primary: { bg: '#dbeafe', color: '#1e40af' },
    success: { bg: '#d1fae5', color: '#065f46' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    danger: { bg: '#fee2e2', color: '#991b1b' },
    info: { bg: '#e0e7ff', color: '#3730a3' }
  };

  const sizes = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.625rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.7rem' },
    lg: { padding: '0.375rem 1rem', fontSize: '0.75rem' }
  };

  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.sm;

  return (
    <span
      className={`badge ${rounded ? 'rounded' : ''} ${className}`}
      style={{
        background: variantStyle.bg,
        color: variantStyle.color,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize
      }}
    >
      {children}
      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 500;
          border-radius: 0.25rem;
          line-height: 1;
        }
        .badge.rounded {
          border-radius: 9999px;
        }
      `}</style>
    </span>
  );
}