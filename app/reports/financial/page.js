'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyData: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/jobs');
        const jobs = Array.isArray(await response.json()) ? await response.json() : [];
        
        const totalRevenue = jobs.reduce((sum, j) => sum + (j.po_amount || 0), 0);
        const totalExpenses = jobs.reduce((sum, j) => sum + ((j.po_amount || 0) * 0.7), 0);
        
        setData({
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          monthlyData: [
            { month: 'Jan', revenue: 25000, expenses: 17500 },
            { month: 'Feb', revenue: 28000, expenses: 19600 },
            { month: 'Mar', revenue: 32000, expenses: 22400 },
            { month: 'Apr', revenue: 35000, expenses: 24500 },
          ]
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

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
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Financial Reports</h1>
        <p>View financial performance and analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(data.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{formatCurrency(data.totalExpenses)}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Net Profit</div>
          <div className="stat-value">{formatCurrency(data.netProfit)}</div>
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
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
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