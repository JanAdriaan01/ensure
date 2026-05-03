'use client';

export default function Page() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Page Under Construction</h1>
        <p>This page is currently being developed.</p>
      </div>
      <div className="empty-state">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
        <p>Please check back soon for updates.</p>
      </div>
    </div>
  );
}