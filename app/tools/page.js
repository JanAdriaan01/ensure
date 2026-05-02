'use client';

import { useState, useEffect } from 'react';

export default function ToolsPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTools() {
      try {
        const response = await fetch('/api/tools');
        const result = await response.json();
        // Handle both response formats: direct array or { data: [] }
        if (Array.isArray(result)) {
          setTools(result);
        } else if (result.data && Array.isArray(result.data)) {
          setTools(result.data);
        } else {
          setTools([]);
        }
      } catch (error) {
        console.error('Error fetching tools:', error);
        setTools([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tools...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tools-container">
      <div className="page-header">
        <h1>Tool Management</h1>
        <p>Track and manage tools, equipment, and checkouts</p>
      </div>
      <div className="table-container">
        <table className="tools-table">
          <thead>
            <tr>
              <th>Tool Name</th>
              <th>Serial Number</th>
              <th>Category</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {tools.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">No tools found</td>
              </tr>
            ) : (
              tools.map((tool) => (
                <tr key={tool.id}>
                  <td>{tool.name}</td>
                  <td>{tool.serial_number || '-'}</td>
                  <td>{tool.category || '-'}</td>
                  <td>
                    <span className={`status ${tool.status}`}>
                      {tool.status === 'available' ? 'Available' : tool.status === 'checked_out' ? 'Checked Out' : tool.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{tool.location || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .tools-container {
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
        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .tools-table {
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
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .status.available {
          background: #d1fae5;
          color: #065f46;
        }
        .status.checked_out {
          background: #fef3c7;
          color: #92400e;
        }
        .status.maintenance {
          background: #fee2e2;
          color: #991b1b;
        }
        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }
        @media (max-width: 768px) {
          .tools-container { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}