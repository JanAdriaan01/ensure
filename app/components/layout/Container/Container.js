'use client';

export default function Container({ 
  children, 
  size = 'lg',
  padding = true,
  centered = true,
  className = ''
}) {
  const sizes = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
    full: '100%'
  };

  const maxWidth = sizes[size] || sizes.lg;

  return (
    <div className={`container ${centered ? 'centered' : ''} ${className}`}>
      {children}
      <style jsx>{`
        .container {
          max-width: ${maxWidth};
          width: 100%;
          margin: 0;
        }
        .container.centered {
          margin-left: auto;
          margin-right: auto;
        }
        ${padding && `
          padding-left: 1rem;
          padding-right: 1rem;
          @media (min-width: 640px) {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          @media (min-width: 1024px) {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        `}
      `}</style>
    </div>
  );
}