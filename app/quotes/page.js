'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = async (id, quoteNumber) => {
    if (confirm(`Delete quote "${quoteNumber}"?`)) {
      await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      fetchQuotes();
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      quote.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || quote.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filteredQuotes.reduce((sum, q) => sum + (q.quote_amount || 0), 0);
  const pendingAmount = filteredQuotes.filter(q => q.status === 'pending').reduce((sum, q) => sum + (q.quote_amount || 0), 0);
  const approvedAmount = filteredQuotes.filter(q => q.status === 'approved').reduce((sum, q) => sum + (q.quote_amount || 0), 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading quotes...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>💰 Quote Management</h1>
          <p>Track and manage all client quotes</p>
        </div>
        <Link href="/quotes/new" className="btn-primary">+ New Quote</Link>
      </div>

      {/* Stats Summary */}
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-number">{quotes.length}</span>
          <span className="stat-label">Total Quotes</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">${totalAmount.toLocaleString()}</span>
          <span className="stat-label">Total Value</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">${pendingAmount.toLocaleString()}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">${approvedAmount.toLocaleString()}</span>
          <span className="stat-label">Approved</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by quote number or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
          <button className={`filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Approved</button>
          <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Rejected</button>
          <button className={`filter-btn ${filter === 'invoiced' ? 'active' : ''}`} onClick={() => setFilter('invoiced')}>Invoiced</button>
        </div>
      </div>

      {/* Quotes Table */}
      {filteredQuotes.length === 0 ? (
        <div className="no-data">
          <p>No quotes found.</p>
          <Link href="/quotes/new" className="btn-secondary">Create your first quote →</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="quotes-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Job #</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map(quote => (
                <tr key={quote.id} className="clickable-row" onClick={() => router.push(`/quotes/${quote.id}`)}>
                  <td><strong>{quote.quote_number}</strong></td>
                  <td>{quote.client_name || '-'}</td>
                  <td>{new Date(quote.quote_date).toLocaleDateString()}</td>
                  <td><strong>${quote.quote_amount?.toLocaleString()}</strong></td>
                  <td>
                    <span className={`status-badge status-${quote.status}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>{quote.job_number || '-'}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuote(quote.id, quote.quote_number);
                      }}
                      className="btn-delete-small"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; }
        .page-header h1 { margin: 0; }
        .page-header p { color: #6b7280; margin: 0.25rem 0 0 0; }
        
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-box { background: white; padding: 1rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 1.5rem; font-weight: bold; display: block; color: #111827; }
        .stat-label { font-size: 0.75rem; color: #6b7280; }
        
        .search-filter { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .search-input { flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 1rem; min-width: 200px; }
        .filter-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .filter-btn { padding: 0.75rem 1.25rem; background: white; border: 1px solid #ddd; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; }
        .filter-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
        .filter-btn:hover:not(.active) { background: #f3f4f6; }
        
        .table-container { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .quotes-table { width: 100%; border-collapse: collapse; }
        .quotes-table th { text-align: left; padding: 0.75rem 1rem; background: #f9fafb; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: #6b7280; }
        .quotes-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background: #f9fafb; }
        
        .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-invoiced { background: #dbeafe; color: #1e40af; }
        
        .btn-primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; transition: background 0.2s; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; }
        .btn-delete-small { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
        .btn-delete-small:hover { background: #fee2e2; }
        
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .no-data { text-align: center; padding: 3rem; background: white; border-radius: 0.75rem; }
        
        @media (max-width: 768px) { .container { padding: 1rem; } .search-filter { flex-direction: column; } .quotes-table { font-size: 0.75rem; } .quotes-table th, .quotes-table td { padding: 0.5rem; } }
      `}</style>
    </div>
  );
}