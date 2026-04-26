'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchQuotes(); // Refresh the list
        alert(`Quote ${newStatus}. ${newStatus === 'approved' ? 'A job has been created.' : ''}`);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading quotes...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>💰 Quotes</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>When approved, a job is automatically created</p>
        </div>
        <Link href="/quotes/new">
          <button style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
            + New Quote
          </button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
          No quotes found. Click "New Quote" to create one.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Quote #</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Client</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Linked Job</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}><strong>{quote.quote_number}</strong></td>
                  <td style={{ padding: '0.75rem' }}>{new Date(quote.quote_date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>{quote.client_name || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>R {(quote.total_amount || 0).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <select
                      value={quote.status}
                      onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        border: '1px solid #ddd',
                        background: quote.status === 'approved' ? '#d1fae5' : quote.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: quote.status === 'approved' ? '#065f46' : quote.status === 'rejected' ? '#991b1b' : '#92400e',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {quote.job_id ? (
                      <Link href={`/jobs/${quote.job_id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        JOB-{quote.quote_number} →
                      </Link>
                    ) : quote.status === 'approved' ? (
                      <span style={{ color: '#f59e0b' }}>Creating...</span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <Link href={`/quotes/${quote.id}`}>
                      <button style={{ background: '#6b7280', color: 'white', padding: '0.25rem 0.75rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}