'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BackupPage() {
  const [backups] = useState([
    { id: 1, filename: 'ensure_backup_2024_03_25.sql', size: '45.2 MB', date: '2024-03-25 10:30:00', type: 'Full' },
    { id: 2, filename: 'ensure_backup_2024_03_24.sql', size: '44.8 MB', date: '2024-03-24 23:00:00', type: 'Full' },
    { id: 3, filename: 'incremental_2024_03_23.sql', size: '12.1 MB', date: '2024-03-23 23:00:00', type: 'Incremental' },
  ]);

  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupTime, setBackupTime] = useState('02:00');
  const [backupRetention, setBackupRetention] = useState('30');

  return (
    <div className="backup-container">
      <div className="page-header">
        <h1>Backup Management</h1>
        <p>Configure automatic backups and restore data</p>
      </div>

      <div className="backup-settings">
        <div className="setting-card">
          <h2>Auto Backup Settings</h2>
          <div className="setting-row">
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
            <>
              <div className="setting-row">
                <label>Backup Frequency</label>
                <select value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="setting-row">
                <label>Backup Time</label>
                <input type="time" value={backupTime} onChange={(e) => setBackupTime(e.target.value)} />
              </div>
              <div className="setting-row">
                <label>Retention Period (days)</label>
                <input type="number" value={backupRetention} onChange={(e) => setBackupRetention(e.target.value)} />
              </div>
            </>
          )}
          <button className="save-btn">Save Backup Settings</button>
        </div>

        <div className="action-card">
          <h2>Manual Backup</h2>
          <p>Create a manual backup of your entire system data</p>
          <button className="backup-btn">Create Backup Now</button>
        </div>
      </div>

      <div className="backups-list">
        <h2>Recent Backups</h2>
        <table className="backups-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size</th>
              <th>Date</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.map(backup => (
              <tr key={backup.id}>
                <td>{backup.filename}</td>
                <td>{backup.size}</td>
                <td>{backup.date}</td>
                <td>
                  <span className={`type-badge ${backup.type.toLowerCase()}`}>
                    {backup.type}
                  </span>
                </td>
                <td className="actions">
                  <button className="action-btn download">Download</button>
                  <button className="action-btn restore">Restore</button>
                  <button className="action-btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .backup-container {
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
        .backup-settings {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .setting-card, .action-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .setting-card h2, .action-card h2 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .setting-row {
          margin-bottom: 1rem;
        }
        .setting-row label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .setting-row select, .setting-row input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .save-btn, .backup-btn {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          margin-top: 0.5rem;
        }
        .backup-btn {
          background: #10b981;
        }
        .backups-list {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
        }
        .backups-list h2 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .backups-table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem;
          font-size: 0.875rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .type-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
        }
        .type-badge.full {
          background: #d1fae5;
          color: #065f46;
        }
        .type-badge.incremental {
          background: #fef3c7;
          color: #92400e;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
        }
        .action-btn.download {
          background: #3b82f6;
          color: white;
        }
        .action-btn.restore {
          background: #f59e0b;
          color: white;
        }
        .action-btn.delete {
          background: #ef4444;
          color: white;
        }
        @media (max-width: 768px) {
          .backup-container { padding: 1rem; }
          .backup-settings { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}