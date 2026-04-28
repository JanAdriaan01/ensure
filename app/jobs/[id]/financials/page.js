'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import StatusBadge from '@/app/components/common/StatusBadge/StatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import Modal from '@/app/components/ui/Modal/Modal';
import { FormInput, FormSelect, FormDatePicker } from '@/app/components/ui/Form';

export default function FinancialPage({ params }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: jobData, loading: jobLoading } = useFetch(`/api/jobs/${params.id}`);
  const [job, setJob] = useState(null);
  const [finalizedItems, setFinalizedItems] = useState([]);
  const [invoicedItems, setInvoicedItems] = useState([]);
  const [monthlyInvoicing, setMonthlyInvoicing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });
  const [summary, setSummary] = useState({
    total_finalized: 0,
    total_invoiced: 0,
    total_remaining: 0,
    po_remaining: 0
  });

  useEffect(() => {
    if (jobData) {
      setJob(jobData.job);
      fetchFinancialData();
    }
  }, [jobData]);

  const fetchFinancialData = async () => {
    try {
      const [finalizedRes, invoicedRes, monthlyRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}/finalized-items`),
        fetch(`/api/jobs/${params.id}/invoiced-items`),
        fetch(`/api/jobs/${params.id}/monthly-invoicing`)
      ]);
      
      const finalized = await finalizedRes.json();
      const invoiced = await invoicedRes.json();
      const monthly = await monthlyRes.json();
      
      setFinalizedItems(finalized.items || []);
      setInvoicedItems(invoiced.items || []);
      setMonthlyInvoicing(monthly || []);
      
      const totalFinalized = finalized.summary?.total_finalized || 0;
      const totalInvoiced = invoiced.summary?.total_invoiced || 0;
      const poBudget = jobData?.job?.po_amount || 0;
      
      setSummary({
        total_finalized: totalFinalized,
        total_invoiced: totalInvoiced,
        total_remaining: totalFinalized - totalInvoiced,
        po_remaining: poBudget - totalInvoiced
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === finalizedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(finalizedItems.map(item => item.id));
    }
  };

  const createInvoice = async () => {
    if (selectedItems.length === 0) {
      toastError('Please select at least one item to invoice');
      return;
    }
    
    if (!invoiceData.invoice_number) {
      toastError('Invoice number is required');
      return;
    }
    
    try {
      const res = await fetch(`/api/jobs/${params.id}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: invoiceData.invoice_number,
          invoice_date: invoiceData.invoice_date,
          due_date: invoiceData.due_date,
          notes: invoiceData.notes,
          item_ids: selectedItems
        })
      });
      
      if (res.ok) {
        success(`Invoice ${invoiceData.invoice_number} created successfully`);
        setShowInvoiceModal(false);
        setSelectedItems([]);
        setInvoiceData({
          invoice_number: '',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: ''
        });
        fetchFinancialData();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to create invoice');
      }
    } catch (error) {
      toastError('Error creating invoice');
    }
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}-${random}`;
  };

  if (jobLoading || loading) return <LoadingSpinner text="Loading financial data..." />;
  if (!job) return <div style={{ padding: '2rem', textAlign: 'center' }}>Job not found</div>;

  const poBudget = job.po_amount || 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="💰 Financial & Invoicing"
        description={`Job: ${job.lc_number} | Client: ${job.client_name || 'N/A'}`}
        action={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href={`/jobs/${params.id}`}>
              <Button variant="secondary" size="sm">← Back to Job</Button>
            </Link>
          </div>
        }
      />

      {/* Financial Summary Cards */}
      <div className="financial-summary">
        <div className="summary-card po-card">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <div className="summary-label">PO Budget</div>
            <div className="summary-value"><CurrencyAmount amount={poBudget} /></div>
            <div className="summary-sub">Total approved amount</div>
          </div>
        </div>
        
        <div className="summary-card finalized-card">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <div className="summary-label">Work Finalized</div>
            <div className="summary-value"><CurrencyAmount amount={summary.total_finalized} /></div>
            <div className="summary-sub">Ready for invoicing</div>
          </div>
        </div>
        
        <div className="summary-card invoiced-card">
          <div className="summary-icon">📄</div>
          <div className="summary-info">
            <div className="summary-label">Already Invoiced</div>
            <div className="summary-value"><CurrencyAmount amount={summary.total_invoiced} /></div>
            <div className="summary-sub">Invoiced to date</div>
          </div>
        </div>
        
        <div className="summary-card remaining-card">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <div className="summary-label">Remaining to Invoice</div>
            <div className={`summary-value ${summary.total_remaining < 0 ? 'negative' : ''}`}>
              <CurrencyAmount amount={summary.total_remaining} />
            </div>
            <div className="summary-sub">From finalized work</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span>PO Budget Utilization</span>
          <span>{poBudget > 0 ? ((summary.total_invoiced / poBudget) * 100).toFixed(1) : 0}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ 
            width: `${Math.min(poBudget > 0 ? (summary.total_invoiced / poBudget) * 100 : 0, 100)}%`,
            background: (summary.total_invoiced / poBudget) > 1 ? '#dc2626' : '#2563eb'
          }}></div>
        </div>
        <div className="progress-stats">
          <span>Invoiced: <CurrencyAmount amount={summary.total_invoiced} /></span>
          <span>Remaining PO: <CurrencyAmount amount={poBudget - summary.total_invoiced} /></span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="two-column">
        {/* Left Column - Finalized Items Ready for Invoice */}
        <div className="column">
          <div className="column-header">
            <h3>📋 Items Ready for Invoice</h3>
            <div className="column-actions">
              <Button size="sm" variant="outline" onClick={selectAllItems}>
                {selectedItems.length === finalizedItems.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowInvoiceModal(true)} 
                disabled={selectedItems.length === 0}
              >
                Create Invoice ({selectedItems.length})
              </Button>
            </div>
          </div>
          
          {finalizedItems.length === 0 ? (
            <div className="empty-state">
              <p>No items ready for invoicing yet.</p>
              <p className="empty-hint">Finalize items in Job Management to see them here.</p>
              <Link href={`/jobs/${params.id}`}>
                <Button variant="primary" size="sm">Go to Job Items →</Button>
              </Link>
            </div>
          ) : (
            <div className="items-list">
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === finalizedItems.length && finalizedItems.length > 0}
                        onChange={selectAllItems}
                      />
                    </th>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th className="right">Quantity</th>
                    <th className="right">Unit Price</th>
                    <th className="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {finalizedItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                        />
                      </td>
                      <td><strong>{item.item_name}</strong></td>
                      <td>{item.description || '-'}</td>
                      <td className="right">{item.quoted_quantity}</td>
                      <td className="right"><CurrencyAmount amount={item.quoted_unit_price} /></td>
                      <td className="right"><CurrencyAmount amount={item.quoted_total} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="right"><strong>Total Selected:</strong></td>
                    <td className="right">
                      <strong>
                        <CurrencyAmount amount={
                          finalizedItems
                            .filter(item => selectedItems.includes(item.id))
                            .reduce((sum, item) => sum + (item.quoted_total || 0), 0)
                        } />
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Right Column - Invoice History */}
        <div className="column">
          <div className="column-header">
            <h3>📄 Invoice History</h3>
          </div>
          
          {invoicedItems.length === 0 ? (
            <div className="empty-state">
              <p>No invoices created yet.</p>
              <p className="empty-hint">Select items from the left and click "Create Invoice".</p>
            </div>
          ) : (
            <div className="invoices-list">
              {invoicedItems.map(invoice => (
                <Card key={invoice.id} className="invoice-card">
                  <div className="invoice-header">
                    <div>
                      <strong>Invoice #{invoice.invoice_number}</strong>
                      <StatusBadge status={invoice.status || 'sent'} size="sm" />
                    </div>
                    <div className="invoice-date">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="invoice-details">
                    <div className="invoice-amount">
                      Total: <CurrencyAmount amount={invoice.total_amount} />
                    </div>
                    {invoice.due_date && (
                      <div className={`invoice-due ${new Date(invoice.due_date) < new Date() ? 'overdue' : ''}`}>
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {invoice.notes && <div className="invoice-notes">{invoice.notes}</div>}
                  <div className="invoice-items">
                    <details>
                      <summary>Items ({invoice.items?.length || 0})</summary>
                      <table className="invoice-items-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th className="right">Qty</th>
                            <th className="right">Price</th>
                            <th className="right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items?.map(item => (
                            <tr key={item.id}>
                              <td>{item.item_name}</td>
                              <td className="right">{item.quantity}</td>
                              <td className="right"><CurrencyAmount amount={item.unit_price} /></td>
                              <td className="right"><CurrencyAmount amount={item.total} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Invoicing Summary */}
      <div className="monthly-summary">
        <h3>📅 Monthly Invoicing Summary</h3>
        {monthlyInvoicing.length === 0 ? (
          <div className="empty-state-small">No monthly invoicing records yet.</div>
        ) : (
          <table className="monthly-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="right">Amount Invoiced</th>
                <th className="right">Cumulative Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyInvoicing.map((month, idx) => {
                const cumulative = monthlyInvoicing
                  .slice(0, idx + 1)
                  .reduce((sum, m) => sum + m.amount_invoiced, 0);
                return (
                  <tr key={month.id}>
                    <td>{month.invoice_month}</td>
                    <td className="right"><CurrencyAmount amount={month.amount_invoiced} /></td>
                    <td className="right"><CurrencyAmount amount={cumulative} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Create Invoice">
        <div>
          <div className="modal-summary">
            <p>Creating invoice for <strong>{selectedItems.length}</strong> item(s).</p>
            <p className="modal-total">
              Total Amount: <strong>
                <CurrencyAmount amount={
                  finalizedItems
                    .filter(item => selectedItems.includes(item.id))
                    .reduce((sum, item) => sum + (item.quoted_total || 0), 0)
                } />
              </strong>
            </p>
          </div>
          
          <FormInput
            label="Invoice Number *"
            value={invoiceData.invoice_number}
            onChange={e => setInvoiceData({...invoiceData, invoice_number: e.target.value})}
            placeholder="e.g., INV-2024-001"
            required
          />
          <button 
            type="button" 
            onClick={() => setInvoiceData({...invoiceData, invoice_number: generateInvoiceNumber()})}
            style={{ fontSize: '0.7rem', marginBottom: '1rem' }}
          >
            Generate Invoice Number
          </button>
          
          <FormInput
            label="Invoice Date"
            type="date"
            value={invoiceData.invoice_date}
            onChange={e => setInvoiceData({...invoiceData, invoice_date: e.target.value})}
          />
          
          <FormInput
            label="Due Date"
            type="date"
            value={invoiceData.due_date}
            onChange={e => setInvoiceData({...invoiceData, due_date: e.target.value})}
          />
          
          <FormTextarea
            label="Notes (Optional)"
            value={invoiceData.notes}
            onChange={e => setInvoiceData({...invoiceData, notes: e.target.value})}
            rows="3"
            placeholder="Payment terms, special instructions..."
          />
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button onClick={createInvoice}>Create Invoice</Button>
            <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .financial-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .summary-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .summary-icon {
          font-size: 2rem;
        }
        .summary-info {
          flex: 1;
        }
        .summary-label {
          font-size: 0.7rem;
          color: #6b7280;
          text-transform: uppercase;
        }
        .summary-value {
          font-size: 1.25rem;
          font-weight: bold;
          color: #111827;
        }
        .summary-value.negative {
          color: #dc2626;
        }
        .summary-sub {
          font-size: 0.65rem;
          color: #9ca3af;
          margin-top: 0.2rem;
        }
        .po-card .summary-icon { color: #2563eb; }
        .finalized-card .summary-icon { color: #10b981; }
        .invoiced-card .summary-icon { color: #8b5cf6; }
        .remaining-card .summary-icon { color: #f59e0b; }

        .progress-section {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .progress-bar-container {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .progress-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: #6b7280;
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .column {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .column-header h3 {
          margin: 0;
          font-size: 1rem;
        }
        .column-actions {
          display: flex;
          gap: 0.5rem;
        }
        .items-list {
          overflow-x: auto;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
        }
        .items-table th, .items-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }
        .items-table th {
          background: #f9fafb;
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #6b7280;
        }
        .right {
          text-align: right;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
        .empty-hint {
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .invoices-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .invoice-card {
          margin: 0;
          padding: 1rem;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .invoice-date {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .invoice-amount {
          font-weight: bold;
        }
        .invoice-due {
          font-size: 0.7rem;
        }
        .invoice-due.overdue {
          color: #dc2626;
        }
        .invoice-notes {
          font-size: 0.7rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 0.25rem;
        }
        .invoice-items details {
          cursor: pointer;
        }
        .invoice-items summary {
          font-size: 0.7rem;
          color: #2563eb;
        }
        .invoice-items-table {
          width: 100%;
          margin-top: 0.5rem;
          font-size: 0.7rem;
          border-collapse: collapse;
        }
        .invoice-items-table th, .invoice-items-table td {
          padding: 0.25rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .monthly-summary {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .monthly-summary h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }
        .monthly-table {
          width: 100%;
          border-collapse: collapse;
        }
        .monthly-table th, .monthly-table td {
          padding: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }
        .monthly-table th {
          text-align: left;
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #6b7280;
        }
        .empty-state-small {
          text-align: center;
          padding: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        .modal-summary {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
        }
        .modal-total {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .two-column {
            grid-template-columns: 1fr;
          }
          .financial-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}