// app/invoicing/new/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewInvoicePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  
  const [formData, setFormData] = useState({
    job_id: '',
    amount: '',
    vat_rate: 15,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: ''
  });
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAvailableJobs();
    }
  }, [isAuthenticated, token]);

  const fetchAvailableJobs = async () => {
    try {
      setFetchingJobs(true);
      const response = await fetch('/api/invoices/available-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAvailableJobs(data.data);
      } else {
        console.error('Failed to fetch jobs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleJobSelect = (jobId) => {
    const job = availableJobs.find(j => j.id === parseInt(jobId));
    setSelectedJob(job);
    setFormData(prev => ({ ...prev, job_id: jobId }));
    
    // Clear amount error when job changes
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.job_id) {
      newErrors.job_id = 'Please select a job';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (selectedJob && parseFloat(formData.amount) > selectedJob.available_balance) {
      newErrors.amount = `Amount exceeds available balance of ${formatCurrency(selectedJob.available_balance)}`;
    }
    
    if (!formData.issue_date) {
      newErrors.issue_date = 'Issue date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: parseInt(formData.job_id),
          amount: parseFloat(formData.amount),
          vat_rate: parseFloat(formData.vat_rate),
          issue_date: formData.issue_date,
          due_date: formData.due_date || null,
          notes: formData.notes || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push(`/invoicing/${data.data.id}`);
      } else {
        alert(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
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

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const vatRate = parseFloat(formData.vat_rate) || 0;
    const vatAmount = (amount * vatRate) / 100;
    const total = amount + vatAmount;
    return { amount, vatAmount, total };
  };

  const { amount, vatAmount, total } = calculateTotal();

  if (fetchingJobs) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading available jobs...</p>
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
            border: 3px solid #e2e8f0;
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
    <div className="new-invoice-container">
      <div className="page-header">
        <div>
          <Link href="/invoicing" className="back-link">← Back to Invoices</Link>
          <h1>Create New Invoice</h1>
          <p>Generate an invoice for an approved job</p>
        </div>
      </div>

      {availableJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No Jobs Available for Invoicing</h3>
          <p>There are no active jobs with available funds to invoice.</p>
          <Link href="/jobs" className="btn-primary">View Jobs</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="form-grid">
            {/* Left Column - Main Details */}
            <div className="form-main">
              <div className="form-section">
                <h3>Invoice Details</h3>
                
                <div className="form-group">
                  <label>Select Job *</label>
                  <select
                    name="job_id"
                    value={formData.job_id}
                    onChange={(e) => handleJobSelect(e.target.value)}
                    className={errors.job_id ? 'error' : ''}
                  >
                    <option value="">-- Select a job --</option>
                    {availableJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.job_number} - {job.client_name} (Available: {formatCurrency(job.available_balance)})
                      </option>
                    ))}
                  </select>
                  {errors.job_id && <span className="error-message">{errors.job_id}</span>}
                </div>

                {selectedJob && (
                  <div className="job-info">
                    <div className="job-info-item">
                      <span className="label">Client:</span>
                      <span className="value">{selectedJob.client_name}</span>
                    </div>
                    <div className="job-info-item">
                      <span className="label">PO Amount:</span>
                      <span className="value">{formatCurrency(selectedJob.po_amount)}</span>
                    </div>
                    <div className="job-info-item">
                      <span className="label">Already Invoiced:</span>
                      <span className="value">{formatCurrency(selectedJob.total_invoiced)}</span>
                    </div>
                    <div className="job-info-item">
                      <span className="label">Available Balance:</span>
                      <span className="value highlight">{formatCurrency(selectedJob.available_balance)}</span>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Issue Date *</label>
                    <input
                      type="date"
                      name="issue_date"
                      value={formData.issue_date}
                      onChange={handleChange}
                      className={errors.issue_date ? 'error' : ''}
                    />
                    {errors.issue_date && <span className="error-message">{errors.issue_date}</span>}
                  </div>

                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes for this invoice..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Amount Calculation */}
            <div className="form-sidebar">
              <div className="form-section calculation-section">
                <h3>Amount Calculation</h3>
                
                <div className="form-group">
                  <label>Invoice Amount (excl. VAT) *</label>
                  <div className="currency-input">
                    <span className="currency-symbol">R</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={errors.amount ? 'error' : ''}
                    />
                  </div>
                  {errors.amount && <span className="error-message">{errors.amount}</span>}
                </div>

                <div className="form-group">
                  <label>VAT Rate (%)</label>
                  <select
                    name="vat_rate"
                    value={formData.vat_rate}
                    onChange={handleChange}
                  >
                    <option value="0">0%</option>
                    <option value="15">15%</option>
                  </select>
                </div>

                <div className="calculation-summary">
                  <div className="calc-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                  <div className="calc-row">
                    <span>VAT ({formData.vat_rate}%):</span>
                    <span>{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="calc-row total">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Link href="/invoicing" className="btn-cancel">Cancel</Link>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <style jsx>{`
        .new-invoice-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        p {
          color: #64748b;
          margin: 0;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: #f8fafc;
          border-radius: 1rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-block;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }

        .form-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .form-group select,
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s;
        }

        .form-group select:focus,
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .form-group select.error,
        .form-group input.error {
          border-color: #ef4444;
        }

        .error-message {
          font-size: 0.7rem;
          color: #ef4444;
          margin-top: 0.25rem;
          display: block;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .currency-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .currency-input input {
          padding-left: 1.75rem;
        }

        .job-info {
          background: #f8fafc;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .job-info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .job-info-item:last-child {
          border-bottom: none;
        }

        .job-info-item .label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .job-info-item .value {
          font-weight: 500;
          color: #1e293b;
        }

        .job-info-item .value.highlight {
          color: #10b981;
          font-weight: 600;
        }

        .calculation-section {
          position: sticky;
          top: 2rem;
        }

        .calculation-summary {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .calc-row.total {
          font-weight: 700;
          font-size: 1rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .btn-cancel {
          padding: 0.625rem 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
          color: #64748b;
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f8fafc;
        }

        .btn-submit {
          padding: 0.625rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-submit:hover {
          background: #2563eb;
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        @media (max-width: 900px) {
          .new-invoice-container {
            padding: 1rem;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-sidebar {
            order: -1;
          }
          .calculation-section {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}