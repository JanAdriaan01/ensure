'use client';

export default function GridLayout({ 
  children, 
  columns = 3,
  gap = '1.5rem',
  minItemWidth = '250px',
  responsive = true,
  className = ''
}) {
  const gridStyle = responsive
    ? {
        display: 'grid',
        gap: gap,
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
      }
    : {
        display: 'grid',
        gap: gap,
        gridTemplateColumns: `repeat(${columns}, 1fr)`
      };

  return (
    <div className={`grid-layout ${className}`} style={gridStyle}>
      {children}
      <style jsx>{`
        .grid-layout {
          width: 100%;
        }
        @media (max-width: 768px) {
          .grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}