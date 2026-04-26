'use client';

export default function Avatar({ name, src, size = 'md', color = 'blue', className = '' }) {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getColorClass = () => {
    const colors = {
      blue: '#2563eb',
      green: '#10b981',
      red: '#dc2626',
      yellow: '#f59e0b',
      purple: '#8b5cf6',
      pink: '#ec4899',
      gray: '#6b7280'
    };
    return colors[color] || colors.blue;
  };

  const sizes = {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px'
  };

  const fontSize = {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '18px',
    xl: '24px'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar ${className}`}
        style={{ width: sizes[size], height: sizes[size] }}
      />
    );
  }

  return (
    <div
      className={`avatar avatar-placeholder ${className}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        backgroundColor: getColorClass(),
        fontSize: fontSize[size]
      }}
    >
      {getInitials(name)}
      <style jsx>{`
        .avatar {
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}