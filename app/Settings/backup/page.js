'use client';

export default function BackupPage() {
  return (
    <div>
      <h1 className="page-title">Backup Management</h1>
      <p className="page-description">Configure automatic backups and restore data</p>

      <div className="card">
        <h2>Manual Backup</h2>
        <button className="btn-backup">Create Backup Now</button>
      </div>

      <div className="card">
        <h2>Recent Backups</h2>
        <div className="backup-item">
          <span>ensure_backup_2024_03_25.sql</span>
          <span>45.2 MB</span>
          <button className="btn-download">Download</button>
        </div>
      </div>

      <style jsx>{`
        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .page-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        .card {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .card h2 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .btn-backup {
          background: #10b981;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .backup-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .btn-download {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}