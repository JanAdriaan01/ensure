'use client';

import { useState } from 'react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@ensure.com', role: 'admin', status: 'active', lastLogin: '2024-03-25' },
    { id: 2, name: 'John Manager', email: 'john@ensure.com', role: 'manager', status: 'active', lastLogin: '2024-03-24' },
    { id: 3, name: 'Jane Employee', email: 'jane@ensure.com', role: 'user', status: 'active', lastLogin: '2024-03-23' },
    { id: 4, name: 'Mike Viewer', email: 'mike@ensure.com', role: 'viewer', status: 'inactive', lastLogin: '2024-03-20' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user = {
      id: users.length + 1,
      ...newUser,
      status: 'active',
      lastLogin: '-'
    };
    setUsers([...users, user]);
    setShowModal(false);
    setNewUser({ name: '', email: '', role: 'user' });
  };

  const handleDeleteUser = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Manage system users and permissions</p>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
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
                <td><span className={`role ${user.role}`}>{user.role}</span></td>
                <td><span className={`status ${user.status}`}>{user.status}</span></td>
                <td>{user.lastLogin}</td>
                <td className="actions">
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleAddUser}>Save User</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .dark .page-title {
          color: #f9fafb;
        }
        .page-description {
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .dark .page-description {
          color: #9ca3af;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .btn-add {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
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
        .dark th {
          color: #9ca3af;
          border-bottom-color: #374151;
        }
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark td {
          border-bottom-color: #374151;
          color: #f9fafb;
        }
        .user-name {
          font-weight: 500;
        }
        .role {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
        }
        .role.admin { background: #fee2e2; color: #991b1b; }
        .role.manager { background: #fef3c7; color: #92400e; }
        .role.user { background: #d1fae5; color: #065f46; }
        .role.viewer { background: #e5e7eb; color: #374151; }
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
        }
        .status.active { background: #d1fae5; color: #065f46; }
        .status.inactive { background: #fee2e2; color: #991b1b; }
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn-edit, .btn-delete {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
        }
        .btn-edit { background: #3b82f6; color: white; }
        .btn-delete { background: #ef4444; color: white; }
        .modal {
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
          max-width: 450px;
        }
        .dark .modal-content {
          background: #1f2937;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .modal-header h2 { font-size: 1.25rem; font-weight: 600; }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .modal-body { padding: 1rem; }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .form-group { margin-bottom: 1rem; }
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
        .btn-cancel, .btn-save {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .btn-cancel { background: #e5e7eb; }
        .btn-save { background: #3b82f6; color: white; }
      `}</style>
    </div>
  );
}