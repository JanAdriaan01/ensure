'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MonthlySummaryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [laborData, setLaborData] = useState([]);
  const [invoicingData, setInvoicingData] = useState({ totalInvoiced: 0, byJob: [] });
  const [poData, setPoData] = useState({ totalPO: 0, totalInvoiced: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const [laborRes, invoicingRes, poRes] = await Promise.all([
        fetch(`/api/labor/monthly-summary?month=${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`),
        fetch(`/api/invoicing/monthly?start=${firstDay}&end=${lastDay}`),
        fetch('/api/jobs/stats')
      ]);
      
      setLaborData(await laborRes.json());
      setInvoicingData(await invoicingRes.json());
      setPoData(await poRes.json());
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const totalProductive = laborData.reduce((sum, emp) => sum + (emp.productive_hours || 0), 0);
  const totalUnproductive = laborData.reduce((sum, emp) => sum + (emp.unproductive_hours || 0), 0);
  const totalLaborHours = totalProductive + totalUnproductive;

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading monthly summary...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>📊 Monthly Summary Report</h1>
          <p>{currentMonth} {currentYear}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => window.print()} className="btn-secondary">🖨️ Print Report</button>
          <Link href="/" className="btn-secondary">← Back to Dashboard</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card labor-productive">
          <div className="card-icon">💼</div>
          <div className="card-info">
            <div className="card-value">{totalProductive} hrs</div>
            <div className="card-label">Productive Labor</div>
            <div className="card-sub">Booked to jobs</div>
          </div>
        </div>
        <div className="summary-card labor-unproductive">
          <div className="card-icon">📚</div>
          <div className="card-info">
            <div className="card-value">{totalUnproductive} hrs</div>
            <div className="card-label">Unproductive Labor</div>
            <div className="card-sub">Training / Office / Leave</div>
          </div>
        </div>
        <div className="summary-card invoicing">
          <div className="card-icon">💰</div>
          <div className="card-info">
            <div className="card-value">R {invoicingData.totalInvoiced?.toLocaleString() || 0}</div>
            <div className="card-label">Total Invoiced</div>
            <div className="card-sub">Current month</div>
          </div>
        </div>
        <div className="summary-card po">
          <div className="card-icon">📋</div>
          <div className="card-info">
            <div className="card-value">{poData.percentage || 0}%</div>
            <div className="card-label">PO vs Invoiced</div>
            <div className="card-sub">R {poData.totalInvoiced?.toLocaleString() || 0} / R {poData.totalPO?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>

      {/* Labor Productivity Chart */}
      <div className="section">
        <h2>Employee Labor Breakdown</h2>
        <div className="labor-table-container">
          <table className="labor-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Productive</th>
                <th>Unproductive</th>
                <th>Total</th>
                <th>Productivity %</th>
              </tr>
            </thead>
            <tbody>
              {laborData.length === 0 ? (
                <tr><td colSpan="5" className="no-data">No labor data for this month</td></tr>
              ) : (
                laborData.map(emp => {
                  const total = (emp.productive_hours || 0) + (emp.unproductive_hours || 0);
                  const productivity = total > 0 ? ((emp.productive_hours / total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={emp.id}>
                      <td><strong>{emp.name} {emp.surname}</strong><br/><small>{emp.employee_number}</small></td>
                      <td className="productive">{emp.productive_hours || 0} hrs</td>
                      <td className="unproductive">{emp.unproductive_hours || 0} hrs</td>
                      <td>{total} hrs</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${productivity}%` }}></div>
                          <span className="progress-label">{productivity}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoicing by Job */}
      <div className="section">
        <h2>Invoicing by Job</h2>
        <div className="invoice-table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Job Number</th>
                <th>Client</th>
                <th>Total PO</th>
                <th>Invoiced This Month</th>
                <th>Total Invoiced</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {invoicingData.byJob?.length === 0 ? (
                <tr><td colSpan="6" className="no-data">No invoicing data for this month</td></tr>
              ) : (
                invoicingData.byJob?.map(job => (
                  <tr key={job.id}>
                    <td><Link href={`/jobs/${job.id}`}>{job.lc_number}</Link></td>
                    <td>{job.client_name || '-'}</td>
                    <td>R {job.po_amount?.toLocaleString() || 0}</td>
                    <td>R {job.monthly_invoiced?.toLocaleString() || 0}</td>
                    <td>R {job.total_invoiced?.toLocaleString() || 0}</td>
                    <td className={job.remaining < 0 ? 'negative' : 'positive'}>
                      R {job.remaining?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { margin: 0; }
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .summary-card { background: white; border-radius: 1rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card-icon { font-size: 2rem; }
        .card-info { flex: 1; }
        .card-value { font-size: 1.5rem; font-weight: bold; color: #111827; }
        .card-label { font-size: 0.75rem; color: #6b7280; }
        .card-sub { font-size: 0.65rem; color: #9ca3af; margin-top: 0.25rem; }
        
        .section { margin-bottom: 2rem; }
        .section h2 { font-size: 1.1rem; margin-bottom: 1rem; color: #374151; }
        
        .labor-table-container, .invoice-table-container { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 0.75rem 1rem; background: #f9fafb; font-weight: 600; font-size: 0.7rem; text-transform: uppercase; color: #6b7280; }
        td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.8rem; }
        .productive { color: #10b981; font-weight: 500; }
        .unproductive { color: #f59e0b; }
        .negative { color: #ef4444; font-weight: 500; }
        .positive { color: #10b981; }
        
        .progress-bar { position: relative; width: 100px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; display: inline-block; vertical-align: middle; }
        .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
        .progress-label { margin-left: 0.5rem; font-size: 0.7rem; }
        
        .btn-secondary { background: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; border: none; cursor: pointer; }
        .no-data { text-align: center; padding: 2rem; color: #6b7280; }
        
        @media (max-width: 768px) { .container { padding: 1rem; } .summary-cards { grid-template-columns: 1fr; } .labor-table-container, .invoice-table-container { overflow-x: auto; } }
      `}</style>
    </div>
  );
}