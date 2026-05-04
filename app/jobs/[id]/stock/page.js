// app/jobs/[id]/stock/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function JobStockPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [stock, setStock] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [jobRes, stockRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/jobs/${params.id}/stock`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const jobData = await jobRes.json();
      const stockData = await stockRes.json();
      
      setJob(jobData);
      setStock(stockData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading stock data...</p>
      </div>
    );
  }

  const totalStockCost = stock.reduce((sum, item) => sum + (parseFloat(item.total_cost) || 0), 0);

  return (
    <div className="page-container">
      <div className="header">
        <Link href={`/jobs/${params.id}`} className="back-link">← Back to Job</Link>
        <h1>Stock & Materials - {job?.job_number}</h1>
        <p className="subtitle">View all stock items purchased for this job</p>
      </div>

      <div className="summary-card">
        <div className="summary-label">Total Stock Cost</div>
        <div className="summary-value">{formatCurrency(totalStockCost)}</div>
      </div>

      <div className="stock-list">
        {stock.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No stock purchased for this job yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
                <th>Purchase Date</th>
                <th>Supplier</th>
                <th>Invoice #</th>
              </tr>
            </thead>
            <tbody>
              {stock.map(item => (
                <tr key={item.id}>
                  <td className="item-name">{item.item_name || '-'}</td>
                  <td className="sku">{item.sku || '-'}</td>
                  <td className="quantity">{item.quantity}</td>
                  <td className="cost">{formatCurrency(item.unit_cost)}</td>
                  <td className="cost total">{formatCurrency(item.total_cost)}</td>
                  <td>{item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : '-'}</td>
                  <td>{item.supplier || '-'}</td>
                  <td>{item.invoice_number || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="4" className="total-label">Total</td>
                <td className="total-value">{formatCurrency(totalStockCost)}</td>
                <td colSpan="3"></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #1e293b;
        }

        .subtitle {
          color: #64748b;
          margin: 0;
        }

        .summary-card {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
        }

        .data-table tbody tr:hover {
          background: #f8fafc;
        }

        .item-name {
          font-weight: 500;
          color: #1e293b;
        }

        .sku {
          color: #64748b;
          font-family: monospace;
          font-size: 0.875rem;
        }

        .quantity {
          text-align: center;
        }

        .cost {
          font-family: monospace;
        }

        .cost.total {
          font-weight: 600;
          color: #1e293b;
        }

        .total-row {
          background: #f8fafc;
          font-weight: 600;
        }

        .total-label {
          text-align: right;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .total-value {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
        }

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
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }
          .data-table {
            font-size: 0.75rem;
          }
          .data-table th,
          .data-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}