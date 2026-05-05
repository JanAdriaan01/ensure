// app/invoicing/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function InvoicingPage() {
  const { token, isAuthenticated } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [stats, setStats] = useState({
    total_invoiced: 0,
    total_paid: 0,
    total_pending: 0,
    total_overdue: 0
  });
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    client_id: '',
    job_id: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchInvoices();
      fetchClientsAndJobs();
    }
  }, [isAuthenticated, token]);

  // Apply filters whenever invoices or filters change
  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setInvoices(result.data || []);
        setStats(result.stats || {
          total_invoiced: 0,
          total_paid: 0,
          total_pending: 0,
          total_overdue: 0
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndJobs = async () => {
    try {
      const [clientsRes, jobsRes] = await Promise.all([
        fetch('/api/clients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const clientsData = await clientsRes.json();
      const jobsData = await jobsRes.json();
      
      setClients(clientsData.data || clientsData || []);
      setJobs(jobsData.data || []);
    } catch (error) {
      console.error('Error fetching clients/jobs:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    
    // Filter by client
    if (filters.client_id) {
      filtered = filtered.filter(i => i.client_id === parseInt(filters.client_id));
    }
    
    // Filter by job
    if (filters.job_id) {
      filtered = filtered.filter(i => i.job_id === parseInt(filters.job_id));
    }
    
    // Filter by date range
    if (filters.date_from) {
      filtered = filtered.filter(i => i.issue_date >= filters.date_from);
    }
    if (filters.date_to) {
      filtered = filtered.filter(i => i.issue_date <= filters.date_to);
    }
    
    // Filter by search (invoice number or client name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(i => 
        i.invoice_number?.toLowerCase().includes(searchLower) ||
        i.client_name?.toLowerCase().includes(searchLower) ||
        i.job_number?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredInvoices(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      client_id: '',
      job_id: '',
      date_from: '',
      date_to: '',
      search: ''
    });
  };

  const markAsPaid = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id, 
          status: 'paid', 
          paid_date: new Date().toISOString().split('T')[0] 
        })
      });
      const result = await response.json();
      
      if (result.success) {
        fetchInvoices();
      } else {
        alert(result.error || 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to update invoice');
    } finally {
      setActionLoading(null);
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

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-draft';
    }
  };

  // Calculate filtered stats
  const filteredStats = {
    total_invoiced: filteredInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    total_paid: filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    total_pending: filteredInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    total_overdue: filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    count: filteredInvoices.length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading invoices...</p>
        <style jsx>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
          .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="invoicing-container">
      <div className="page-header">
        <div>
          <h1>Invoicing</h1>
          <p>Manage client invoices and track payments</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-filter" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'} 🔍
          </button>
          <Link href="/invoicing/new" className="btn-primary">
            + New Invoice
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Client</label>
              <select
                value={filters.client_id}
                onChange={(e) => handleFilterChange('client_id', e.target.value)}
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.client_name || client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Job</label>
              <select
                value={filters.job_id}
                onChange={(e) => handleFilterChange('job_id', e.target.value)}
              >
                <option value="">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.job_number} - {job.client_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>

            <div className="filter-group search-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Invoice #, Client, Job..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group filter-actions">
              <button className="btn-clear" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value">{formatCurrency(filteredStats.total_invoiced)}</div>
          <div className="stat-sub">{filteredStats.count} invoices</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">{formatCurrency(filteredStats.total_paid)}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Pending Payment</div>
          <div className="stat-value">{formatCurrency(filteredStats.total_pending)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{formatCurrency(filteredStats.total_overdue)}</div>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filters.status === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('status', 'all')}
        >
          All ({filteredStats.count})
        </button>
        <button 
          className={`filter-tab ${filters.status === 'pending' ? 'active' : ''}`}
          onClick={() => handleFilterChange('status', 'pending')}
        >
          Pending ({invoices.filter(i => i.status === 'pending').length})
        </button>
        <button 
          className={`filter-tab ${filters.status === 'paid' ? 'active' : ''}`}
          onClick={() => handleFilterChange('status', 'paid')}
        >
          Paid ({invoices.filter(i => i.status === 'paid').length})
        </button>
        <button 
          className={`filter-tab ${filters.status === 'overdue' ? 'active' : ''}`}
          onClick={() => handleFilterChange('status', 'overdue')}
        >
          Overdue ({invoices.filter(i => i.status === 'overdue').length})
        </button>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices found matching your filters</p>
            {(filters.status !== 'all' || filters.client_id || filters.job_id || filters.search) && (
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            )}
          </div>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Job Number</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-link">
                    <Link href={`/invoicing/${invoice.id}`}>
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/clients/${invoice.client_id}`} className="client-link">
                      {invoice.client_name || 'Unknown Client'}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/jobs/${invoice.job_id}`} className="job-link">
                      {invoice.job_number || '-'}
                    </Link>
                  </td>
                  <td>{formatDate(invoice.issue_date)}</td>
                  <td className={invoice.status === 'overdue' ? 'overdue-date' : ''}>
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="amount">{formatCurrency(invoice.total_amount)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="actions">
                    {invoice.status === 'pending' && (
                      <button 
                        className="action-btn paid"
                        onClick={() => markAsPaid(invoice.id)}
                        disabled={actionLoading === invoice.id}
                      >
                        {actionLoading === invoice.id ? '...' : 'Mark Paid'}
                      </button>
                    )}
                    <Link href={`/invoicing/${invoice.id}`} className="action-btn view">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .invoicing-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .page-header p {
          color: #64748b;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-filter {
          background: #f1f5f9;
          color: #1e293b;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn-filter:hover {
          background: #e2e8f0;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
          display: inline-block;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        /* Filter Panel */
        .filter-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .filter-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .filter-row:last-child {
          margin-bottom: 0;
        }

        .filter-group {
          flex: 1;
          min-width: 150px;
        }

        .filter-group label {
          display: block;
          font-size: 0.7rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }

        .filter-group select,
        .filter-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .search-group {
          flex: 2;
        }

        .filter-actions {
          display: flex;
          align-items: flex-end;
        }

        .btn-clear {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          width: 100%;
        }

        .btn-clear:hover {
          background: #dc2626;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
        }

        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-sub {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #64748b;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .filter-tab.active {
          background: #3b82f6;
          color: white;
        }

        /* Table */
        .table-container {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .invoices-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
        }

        .invoice-link a, .client-link, .job-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .invoice-link a:hover, .client-link:hover, .job-link:hover {
          text-decoration: underline;
        }

        .amount {
          font-weight: 600;
          font-family: monospace;
        }

        .overdue-date {
          color: #ef4444;
          font-weight: 500;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fee2e2; color: #991b1b; }

        .actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .action-btn.paid {
          background: #10b981;
          color: white;
        }

        .action-btn.paid:hover {
          background: #059669;
        }

        .action-btn.view {
          background: #f1f5f9;
          color: #475569;
        }

        .action-btn.view:hover {
          background: #e2e8f0;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
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
          .invoicing-container {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .stat-value {
            font-size: 1.125rem;
          }
          .filter-row {
            flex-direction: column;
          }
          .filter-group {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}