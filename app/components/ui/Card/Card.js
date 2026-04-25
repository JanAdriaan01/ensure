'use client';

export default function Card({ children, variant = 'default', hover = false, className = '' }) {
  const variants = {
    default: 'card-default',
    stat: 'card-stat'
  };

  return (
    <div className={`card ${variants[variant]} ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
      <style jsx>{`
        .card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          transition: all 0.2s ease;
        }
        .card-default {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card-stat {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}