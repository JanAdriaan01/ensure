'use client';

export default function CertificationsPage() {
  return (
    <div className="certifications-container">
      <div className="page-header">
        <h1>Employee Certifications</h1>
        <p>Track employee certifications and renewals</p>
      </div>
      <div className="content-card">
        <p>Certifications management interface will be available soon.</p>
      </div>
      <style jsx>{`
        .certifications-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: #6b7280;
        }
        .content-card {
          background: #ffffff;
          padding: 2rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
        }
        .dark .content-card {
          background: #1f2937;
          border-color: #374151;
        }
      `}</style>
    </div>
  );
}