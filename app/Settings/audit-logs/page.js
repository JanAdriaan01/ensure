'use client';

import { useState } from 'react';

export default function AuditLogsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const logs = [
    { id: 1, timestamp: '2024-03-25 10:30:00', user: 'admin@ensure.com', action: 'CREATE', resource: 'Job LC-2024-001', ip: '192.168.1.100', details: 'New job created' },
    { id: 2, timestamp: '2024-03-25 09:15:00', user: 'john@ensure.com', action: 'UPDATE', resource: 'Invoice INV-2024-002', ip: '192.168.1.101', details: 'Invoice status changed to paid' },
    { id: 3, timestamp: '2024-03-24 16:45:00', user: 'jane@ensure.com', action: 'DELETE', resource: 'Quote Q-2024-003', ip: '192.168.1.102', details: 'Quote deleted' },
    { id: 4, timestamp: '2024-03-24 14:20:00', user: 'admin@ensure.com', action: 'LOGIN', resource: 'System', ip: '192.168.1.100', details: 'User logged in' },
    { id: 5, timestamp: '2024-03-24 11:00:00', user: 'mike@ensure.com', action: 'VIEW', resource: 'Payroll Report', ip: '192.168.1.103', details: 'Viewed payroll summary' },
    { id: 6, timestamp: '2024-03-23 08:30:00', user: 'john@ensure.com', action: 'CREATE', resource: 'User jane@ensure.com', ip: '192.168.1.101', details: 'New user created' },
  ];

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.action !== filter.toUpperCase()) return false;
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

  const handleExport = () => {
    alert('Exporting audit logs...');
  };

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-description">Track all system activities and user actions</p>
        </div>
        <button className="btn-export" onClick={handleExport}>Export Logs</button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Action Type</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="view">View</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by user or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>&nbsp;</label>
          <button className="btn-clear" onClick={() => { setFilter('all'); setSearchTerm(''); }}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">Total Logs: {filteredLogs.length}</div>
        <div className="stat">Showing {filteredLogs.length} of {logs.length} entries</div>
      </div>

      <div className="table-wrapper">
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
                <td className="ip">{log.ip}</td>
                <td>{log.details}</td>
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
        .dark .page-title { color: #f9fafb; }
        .page-description {
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .dark .page-description { color: #9ca3af; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .btn-export {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
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
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        .filter-select, .filter-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
        }
        .dark .filter-select, .dark .filter-input {
          background: #374151;
          border-color: #4b5563;
          color: white;
        }
        .btn-clear {
          padding: 0.5rem 1rem;
          background: #e5e7eb;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .dark .btn-clear {
          background: #374151;
          color: white;
        }
        .stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .stat {
          background: #f3f4f6;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
        }
        .dark .stat {
          background: #374151;
        }
        .table-wrapper {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .dark .table-wrapper {
          background: #1f2937;
          border-color: #374151;
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
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark th {
          color: #9ca3af;
          border-bottom-color: #374151;
        }
        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark td {
          border-bottom-color: #374151;
          color: #f9fafb;
        }
        .timestamp {
          font-family: monospace;
          white-space: nowrap;
        }
        .ip {
          font-family: monospace;
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
          .filters { flex-direction: column; }
          .filter-group { width: 100%; }
        }
      `}</style>
    </div>
  );
}