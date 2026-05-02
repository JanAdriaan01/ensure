'use client';

import { useState } from 'react';

export default function UsersPage() {
  const [users] = useState([
    { id: 1, name: 'Admin User', email: 'admin@ensure.com', role: 'admin', status: 'active' },
    { id: 2, name: 'John Manager', email: 'john@ensure.com', role: 'manager', status: 'active' },
  ]);

  return (
    <div>
      <h1 className="page-title">User Management</h1>
      <p className="page-description">Manage system users and permissions</p>

      <button className="btn-add">+ Add User</button>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className={`role ${user.role}`}>{user.role}</span></td>
                <td><span className={`status ${user.status}`}>{user.status}</span></td>
                <td><button className="btn-edit">Edit</button></td>
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
        .btn-add {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          margin-bottom: 1rem;
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
        .role {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
        }
        .role.admin { background: #fee2e2; color: #991b1b; }
        .role.manager { background: #fef3c7; color: #92400e; }
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          background: #d1fae5;
          color: #065f46;
        }
        .btn-edit {
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