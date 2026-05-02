'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UserManagementPage() {
  const [users] = useState([
    { id: 1, name: 'Admin User', email: 'admin@ensure.com', role: 'admin', status: 'active', last_login: '2024-03-25' },
    { id: 2, name: 'John Manager', email: 'john@ensure.com', role: 'manager', status: 'active', last_login: '2024-03-24' },
    { id: 3, name: 'Jane Employee', email: 'jane@ensure.com', role: 'user', status: 'active', last_login: '2024-03-23' },
    { id: 4, name: 'Mike Viewer', email: 'mike@ensure.com', role: 'viewer', status: 'inactive', last_login: '2024-03-20' },
  ]);

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="users-container">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage system users and permissions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.last_login}</td>
                <td className="actions">
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn reset">Reset</button>
                  <button className="action-btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" placeholder="Enter full name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-input" placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-input">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={() => setShowModal(false)}>Save User</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .users-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
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
        .users-table {
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
        .user-name {
          font-weight: 500;
        }
        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .role-badge.admin {
          background: #fee2e2;
          color: #991b1b;
        }
        .role-badge.manager {
          background: #fef3c7;
          color: #92400e;
        }
        .role-badge.user {
          background: #d1fae5;
          color: #065f46;
        }
        .role-badge.viewer {
          background: #e5e7eb;
          color: #374151;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }
        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
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
        .action-btn.edit {
          background: #3b82f6;
          color: white;
        }
        .action-btn.reset {
          background: #f59e0b;
          color: white;
        }
        .action-btn.delete {
          background: #ef4444;
          color: white;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 0.75rem;
          width: 90%;
          max-width: 500px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .modal-body {
          padding: 1rem;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .form-group {
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
        .btn-cancel {
          padding: 0.5rem 1rem;
          background: #e5e7eb;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .btn-save {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}