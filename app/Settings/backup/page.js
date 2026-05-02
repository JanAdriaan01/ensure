'use client';

import { useState } from 'react';

export default function BackupPage() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupTime, setBackupTime] = useState('02:00');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const backups = [
    { id: 1, filename: 'ensure_backup_2024_03_25.sql', size: '45.2 MB', date: '2024-03-25 02:00:00', type: 'full' },
    { id: 2, filename: 'ensure_backup_2024_03_24.sql', size: '44.8 MB', date: '2024-03-24 02:00:00', type: 'full' },
    { id: 3, filename: 'ensure_backup_2024_03_23.sql', size: '44.2 MB', date: '2024-03-23 02:00:00', type: 'full' },
  ];

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage('Creating backup...');
    setTimeout(() => {
      setCreating(false);
      setMessage('Backup created successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 2000);
  };

  const handleDownload = (filename) => {
    alert(`Downloading ${filename}`);
  };

  const handleRestore = (filename) => {
    if (confirm(`Are you sure you want to restore from ${filename}? This will overwrite current data.`)) {
      alert(`Restoring from ${filename}`);
    }
  };

  const handleDelete = (filename) => {
    if (confirm(`Delete ${filename}?`)) {
      alert(`Deleted ${filename}`);
    }
  };

  return (
    <div>
      <h1 className="page-title">Backup Management</h1>
      <p className="page-description">Configure automatic backups and restore your data</p>

      {message && (
        <div className="message">{message}</div>
      )}

      <div className="settings-card">
        <h2>Auto Backup Settings</h2>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
            />
            Enable Automatic Backups
          </label>
        </div>

        {autoBackup && (
          <div className="form-row">
            <div className="form-group">
              <label>Backup Frequency</label>
              <select value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)} className="form-input">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Backup Time</label>
              <input type="time" value={backupTime} onChange={(e) => setBackupTime(e.target.value)} className="form-input" />
            </div>
          </div>
        )}
        <button className="btn-save">Save Settings</button>
      </div>

      <div className="settings-card">
        <h2>Manual Backup</h2>
        <p>Create an immediate backup of your entire system</p>
        <button className="btn-backup" onClick={handleCreateBackup} disabled={creating}>
          {creating ? 'Creating...' : 'Create Backup Now'}
        </button>
      </div>

      <div className="settings-card">
        <h2>Recent Backups</h2>
        <div className="backups-list">
          {backups.map(backup => (
            <div key={backup.id} className="backup-item">
              <div className="backup-info">
                <span className="backup-name">{backup.filename}</span>
                <span className="backup-meta">{backup.size} • {backup.date}</span>
              </div>
              <div className="backup-actions">
                <button className="btn-download" onClick={() => handleDownload(backup.filename)}>Download</button>
                <button className="btn-restore" onClick={() => handleRestore(backup.filename)}>Restore</button>
                <button className="btn-delete" onClick={() => handleDelete(backup.filename)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .dark .page-title { color: #f9fafb; }
        .page-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        .dark .page-description { color: #9ca3af; }
        .message {
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .settings-card {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .dark .settings-card {
          background: #1f2937;
          border-color: #374151;
        }
        .settings-card h2 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .dark .settings-card h2 { color: #f9fafb; }
        .checkbox-group { margin-bottom: 1rem; }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .form-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .dark .form-input {
          background: #374151;
          border-color: #4b5563;
          color: white;
        }
        .btn-save, .btn-backup {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .btn-backup { background: #10b981; }
        .backups-list { margin-top: 1rem; }
        .backup-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .dark .backup-item { border-bottom-color: #374151; }
        .backup-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .backup-name { font-weight: 500; }
        .backup-meta { font-size: 0.75rem; color: #6b7280; }
        .backup-actions { display: flex; gap: 0.5rem; }
        .btn-download, .btn-restore, .btn-delete {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-download { background: #3b82f6; color: white; }
        .btn-restore { background: #f59e0b; color: white; }
        .btn-delete { background: #ef4444; color: white; }
        @media (max-width: 768px) {
          .form-row { grid-template-columns: 1fr; }
          .backup-item { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}