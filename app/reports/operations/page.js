'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OperationsReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalTools: 0,
    toolsCheckedOut: 0,
    totalStock: 0,
    lowStock: 0,
    scheduleCount: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [toolsRes, stockRes, scheduleRes] = await Promise.all([
          fetch('/api/tools'),
          fetch('/api/stock'),
          fetch('/api/schedule')
        ]);
        
        const tools = Array.isArray(await toolsRes.json()) ? await toolsRes.json() : [];
        const stock = Array.isArray(await stockRes.json()) ? await stockRes.json() : [];
        const schedule = Array.isArray(await scheduleRes.json()) ? await scheduleRes.json() : [];
        
        setData({
          totalTools: tools.length,
          toolsCheckedOut: tools.filter(t => t.status === 'checked_out').length,
          totalStock: stock.length,
          lowStock: stock.filter(i => i.quantity <= (i.min_quantity || 0)).length,
          scheduleCount: schedule.length
        });
      } catch (error) {
        console.error('Error fetching operations report:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading report...</p>
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Operations Reports</h1>
        <p>View tools, inventory, and schedule analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tools</div>
          <div className="stat-value">{data.totalTools}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tools Checked Out</div>
          <div className="stat-value">{data.toolsCheckedOut}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stock Items</div>
          <div className="stat-value">{data.totalStock}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{data.lowStock}</div>
        </div>
      </div>

      <div className="back-link">
        <Link href="/reports/monthly">← Back to Reports</Link>
      </div>

      <style jsx>{`
        .reports-container {
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
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .stat-card.warning .stat-value {
          color: #ef4444;
        }
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }
        .back-link {
          margin-top: 2rem;
        }
        .back-link a {
          color: #3b82f6;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}