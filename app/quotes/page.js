'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
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
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
      
      const result = await res.json();
      success(`Quote ${newStatus}. ${result.job_created ? 'A job has been created.' : ''}`);
      fetchQuotes(); // Refresh the list
      
    } catch (err) {
      toastError(err.message);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'approved':
        return { background: '#d1fae5', color: '#065f46' };
      case 'rejected':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#fef3c7', color: '#92400e' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
        Loading quotes...
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        Error: {error}
        <button onClick={fetchQuotes} style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>💰 Quote Management</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>When approved, a job is automatically created</p>
        </div>
        <Link href="/quotes/new">
          <button style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
            + New Quote
          </button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>No quotes found.</p>
          <Link href="/quotes/new">
            <button style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              Create your first quote →
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Quote #</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Client</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Linked Job</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <strong>{quote.quote_number}</strong>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {new Date(quote.quote_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {quote.client_name || '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    R {(quote.total_amount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <select
                      value={quote.status}
                      onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        border: '1px solid #ddd',
                        background: getStatusStyles(quote.status).background,
                        color: getStatusStyles(quote.status).color,
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {quote.job_id ? (
                      <Link 
                        href={`/jobs/${quote.job_id}`} 
                        style={{ color: '#2563eb', textDecoration: 'none' }}
                      >
                        {quote.job_lc_number || `JOB-${quote.quote_number}`} →
                      </Link>
                    ) : quote.status === 'approved' ? (
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>Creating...</span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <Link href={`/quotes/${quote.id}`}>
                      <button style={{ 
                        background: '#6b7280', 
                        color: 'white', 
                        padding: '0.25rem 0.75rem', 
                        border: 'none', 
                        borderRadius: '0.25rem', 
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}>
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