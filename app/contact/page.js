'use client';

export default function Page() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Page Under Construction</h1>
        <p>This page is currently being developed. Please check back soon.</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
        <p style={{ color: 'var(--text-tertiary)' }}>We're working hard to bring you this feature.</p>
      </div>
    </div>
  );
}