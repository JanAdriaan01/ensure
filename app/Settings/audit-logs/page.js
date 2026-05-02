'use client';

import { useState } from 'react';

export default function AuditLogsPage() {
  const [logs] = useState([
    { id: 1, timestamp: '2024-03-25 10:30:00', user: 'admin@ensure.com', action: 'CREATE', resource: 'Job LC-2024-001' },
    { id: 2, timestamp: '2024-03-25 09:15:00', user: 'john@ensure.com', action: 'UPDATE', resource: 'Invoice INV-2024-002' },
  ]);

  return (
    <div>
      <h1 className="page-title">Audit Logs</h1>
      <p className="page-description">Track system activity and user actions</p>

      <div className="filters">
        <select>
          <option>All Actions</option>
          <option>Create</option>
          <option>Update</option>
          <option>Delete</option>
        </select>
        <input type="text" placeholder="Search..." />
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th></tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.user}</td>
                <td><span className={`action ${log.action.toLowerCase()}`}>{log.action}</span></td>
                <td>{log.resource}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .filters select, .filters input {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .table-wrapper {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .action {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          color: white;
        }
        .action.create { background: #10b981; }
        .action.update { background: #f59e0b; }
        .action.delete { background: #ef4444; }
      `}</style>
    </div>
  );
}