'use client';

import { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStock() {
      try {
        const response = await fetch('/api/stock');
        const result = await response.json();
        setStock(result.data || []);
      } catch (error) {
        console.error('Error fetching stock:', error);
        setStock([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStock();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
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
    <div className="inventory-container">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Track stock levels, materials, and supplies</p>
      </div>
      <div className="stats-summary">
        <div className="stat">Total Items: {stock.length}</div>
        <div className="stat">Low Stock Items: {stock.filter(i => i.quantity <= i.min_quantity).length}</div>
      </div>
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No inventory items found</td>
              </tr>
            ) : (
              stock.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.quantity} {item.unit || ''}</td>
                  <td>{item.min_quantity || 0}</td>
                  <td>
                    <span className={item.quantity <= (item.min_quantity || 0) ? 'status low' : 'status normal'}>
                      {item.quantity <= (item.min_quantity || 0) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .inventory-container {
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
        .stats-summary {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat {
          background: #f3f4f6;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .inventory-table {
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
        .status.normal {
          background: #d1fae5;
          color: #065f46;
        }
        .status.low {
          background: #fee2e2;
          color: #991b1b;
        }
        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}