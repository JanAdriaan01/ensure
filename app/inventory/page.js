'use client';

import { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => {
        setStock(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="inventory-container">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Track stock levels, materials, and supplies</p>
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
                  <td>{item.quantity}</td>
                  <td>{item.min_quantity || 0}</td>
                  <td>
                    <span className={`status ${item.quantity <= (item.min_quantity || 0) ? 'low' : 'normal'}`}>
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
        .table-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }
        .dark .table-container {
          background: #1f2937;
          border-color: #374151;
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
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark td {
          color: #f9fafb;
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