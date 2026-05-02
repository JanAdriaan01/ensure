'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AuditLogsPage() {
  const [logs] = useState([
    { id: 1, timestamp: '2024-03-25 10:30:00', user: 'admin@ensure.com', action: 'CREATE', resource: 'Job LC-2024-001', ip: '192.168.1.100', details: 'New job created' },
    { id: 2, timestamp: '2024-03-25 09:15:00', user: 'john@ensure.com', action: 'UPDATE', resource: 'Invoice INV-2024-002', ip: '192.168.1.101', details: 'Invoice status changed to paid' },
    { id: 3, timestamp: '2024-03-24 16:45:00', user: 'jane@ensure.com', action: 'DELETE', resource: 'Quote Q-2024-003', ip: '192.168.1.102', details: 'Quote deleted' },
    { id: 4, timestamp: '2024-03-24 14:20:00', user: 'admin@ensure.com', action: 'LOGIN', resource: 'System', ip: '192.168.1.100', details: 'User logged in' },
    { id: 5, timestamp: '2024-03-24 11:00:00', user: 'mike@ensure.com', action: 'VIEW', resource: 'Payroll Report', ip: '192.168.1.103', details: 'Viewed payroll summary' },
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.action.toLowerCase() !== filter) return false;
    if (searchTerm && !log.user.includes(searchTerm) && !log.resource.includes(searchTerm)) return false;
    return true;
  });

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return '#10b981';
      case 'UPDATE': return '#f59e0b';
      case 'DELETE': return '#ef4444';
      case 'LOGIN': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="audit-container">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Track system activity and user actions</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Action Type</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search</label>
          <input 
            type="text" 
            placeholder="Search by user or resource..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="export-btn">Export Logs</button>
      </div>

      <div className="table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td className="timestamp">{log.timestamp}</td>
                <td>{log.user}</td>
                <td>
                  <span className="action-badge" style={{ background: getActionColor(log.action) }}>
                    {log.action}
                  </span>
                </td>
                <td>{log.resource}</td>
                <td>{log.ip}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .audit-container {
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
        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: flex-end;
        }
        .filter-group {
          flex: 1;
          min-width: 150px;
        }
        .filter-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          color: #6b7280;
        }
        .filter-group select, .filter-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .export-btn {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        .timestamp {
          font-family: monospace;
          font-size: 0.8rem;
        }
        .action-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
          color: white;
        }
        @media (max-width: 768px) {
          .audit-container { padding: 1rem; }
          .filters { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}