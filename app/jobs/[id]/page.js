'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import StatusBadge from '@/app/components/common/StatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import Modal from '@/app/components/ui/Modal/Modal';
import { FormInput, FormTextarea, FormCurrencyInput } from '@/app/components/ui/Form';

export default function JobDetailPage({ params }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: jobData, loading, refetch } = useFetch(`/api/jobs/${params.id}`);
  const [job, setJob] = useState(null);
  const [quote, setQuote] = useState(null);
  const [jobItems, setJobItems] = useState([]);
  const [jobStatus, setJobStatus] = useState('not_started');
  const [summary, setSummary] = useState({ 
    total_quoted: 0, 
    total_actual: 0, 
    completed_value: 0, 
    progress: 0,
    over_budget_count: 0
  });
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showVarianceModal, setShowVarianceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [varianceAmount, setVarianceAmount] = useState(0);
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    quoted_quantity: 1,
    quoted_unit_price: 0
  });
  const [activeTab, setActiveTab] = useState('items');

  useEffect(() => {
    if (jobData) {
      setJob(jobData.job);
      setJobStatus(jobData.job.completion_status || 'not_started');
      fetchQuote();
      fetchJobItems();
    }
  }, [jobData]);

  const fetchQuote = async () => {
    if (jobData?.job?.quote_id) {
      try {
        const res = await fetch(`/api/quotes/${jobData.job.quote_id}`);
        const quoteData = await res.json();
        setQuote(quoteData);
      } catch (error) {
        console.error('Error fetching quote:', error);
      }
    }
  };

  const fetchJobItems = async () => {
    try {
      const res = await fetch(`/api/jobs/${params.id}/items`);
      const data = await res.json();
      setJobItems(data.items || []);
      setSummary(data.summary || { 
        total_quoted: 0, 
        total_actual: 0, 
        completed_value: 0, 
        progress: 0,
        over_budget_count: 0
      });
    } catch (error) {
      console.error('Error fetching job items:', error);
    }
  };

  const updateJobStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completion_status: newStatus })
      });
      if (res.ok) {
        setJobStatus(newStatus);
        success(`Job status updated to ${newStatus.replace('_', ' ')}`);
        
        if (newStatus === 'completed') {
          setTimeout(() => {
            if (confirm('Job marked as completed. Would you like to go to the Financial screen to finalize invoicing?')) {
              router.push(`/jobs/${params.id}/financial`);
            }
          }, 500);
        }
        refetch();
      }
    } catch (error) {
      toastError('Failed to update job status');
    }
  };

  const editItem = (item) => {
    setSelectedItem({ 
      id: item.id,
      item_name: item.item_name,
      description: item.description || '',
      quoted_quantity: item.quoted_quantity,
      quoted_unit_price: item.quoted_unit_price,
      original_quantity: item.quoted_quantity,
      original_price: item.quoted_unit_price,
      original_total: item.quoted_total
    });
    setShowEditItemModal(true);
  };

  const saveItemEdit = async () => {
    const newTotal = selectedItem.quoted_quantity * selectedItem.quoted_unit_price;
    const originalTotal = selectedItem.original_total;
    
    const currentPoAmount = quote?.po_amount || 0;
    const currentJobTotal = summary.total_actual - originalTotal + newTotal;
    
    if (currentJobTotal > currentPoAmount && currentPoAmount > 0) {
      setVarianceAmount(currentJobTotal - currentPoAmount);
      setShowVarianceModal(true);
      return;
    }
    
    await performSaveEdit();
  };

  const performSaveEdit = async () => {
    try {
      const newTotal = selectedItem.quoted_quantity * selectedItem.quoted_unit_price;
      const isRevision = newTotal !== selectedItem.original_total;
      
      const res = await fetch(`/api/jobs/${params.id}/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoted_quantity: selectedItem.quoted_quantity,
          quoted_unit_price: selectedItem.quoted_unit_price,
          description: selectedItem.description,
          is_revision: isRevision
        })
      });
      if (res.ok) {
        success('Item updated successfully');
        setShowEditItemModal(false);
        fetchJobItems();
      } else {
        toastError('Failed to update item');
      }
    } catch (error) {
      toastError('Failed to update item');
    }
  };

  const requestVariancePO = async () => {
    try {
      const res = await fetch(`/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_number: `VAR-${quote.quote_number}-${new Date().getFullYear()}`,
          client_id: quote.client_id,
          original_quote_id: quote.id,
          scope_subject: `Variance PO for ${quote.quote_number} - Additional ${varianceAmount}`,
          status: 'pending',
          total_amount: varianceAmount,
          items: [{
            item_number: 1,
            description: `Variance for overage on ${selectedItem.item_name}`,
            quantity: 1,
            price_ex_vat: varianceAmount
          }]
        })
      });
      
      if (res.ok) {
        success('Variance PO request created. Please have it approved.');
        setShowVarianceModal(false);
        setShowEditItemModal(false);
      } else {
        toastError('Failed to create variance PO');
      }
    } catch (error) {
      toastError('Failed to create variance PO');
    }
  };

  const addNewItem = async () => {
    if (!newItem.item_name) {
      toastError('Item name is required');
      return;
    }
    
    const newTotal = newItem.quoted_quantity * newItem.quoted_unit_price;
    const currentPoAmount = quote?.po_amount || 0;
    const currentJobTotal = summary.total_actual + newTotal;
    
    if (currentJobTotal > currentPoAmount && currentPoAmount > 0) {
      setVarianceAmount(currentJobTotal - currentPoAmount);
      setShowVarianceModal(true);
      return;
    }
    
    await performAddNewItem();
  };

  const performAddNewItem = async () => {
    try {
      const res = await fetch(`/api/jobs/${params.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: newItem.item_name,
          description: newItem.description,
          quoted_quantity: newItem.quoted_quantity,
          quoted_unit_price: newItem.quoted_unit_price
        })
      });
      if (res.ok) {
        success('Item added successfully');
        setShowAddItemModal(false);
        setNewItem({
          item_name: '',
          description: '',
          quoted_quantity: 1,
          quoted_unit_price: 0
        });
        fetchJobItems();
      } else {
        toastError('Failed to add item');
      }
    } catch (error) {
      toastError('Failed to add item');
    }
  };

  const finalizeItem = async (item) => {
    if (jobStatus !== 'in_progress' && jobStatus !== 'completed') {
      toastError('Job must be In Progress or Completed to finalize items');
      return;
    }
    
    const confirmFinalize = confirm(`Finalize "${item.item_name}"? This will mark it ready for invoicing.`);
    if (!confirmFinalize) return;
    
    try {
      const res = await fetch(`/api/jobs/${params.id}/items/${item.id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actual_quantity: item.quoted_quantity,
          actual_cost: item.quoted_total,
          finalized_at: new Date().toISOString()
        })
      });
      if (res.ok) {
        success('Item finalized and ready for invoicing');
        fetchJobItems();
      } else {
        toastError('Failed to finalize item');
      }
    } catch (error) {
      toastError('Failed to finalize item');
    }
  };

  const progressPercentage = summary.total_actual > 0 
    ? (summary.completed_value / summary.total_actual * 100).toFixed(1) 
    : 0;

  const getPoDisplayStatus = () => {
    if (!quote?.po_received) return 'pending_receipt';
    const totalItems = jobItems.length;
    const finalizedItems = jobItems.filter(i => i.is_finalized).length;
    if (finalizedItems === 0) return 'po_received';
    if (finalizedItems === totalItems) return 'fully_invoiced';
    return 'partial_invoiced';
  };

  const poDisplayStatus = getPoDisplayStatus();

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (!job) return <div style={{ padding: '2rem', textAlign: 'center' }}>Job not found</div>;

  const statusOptions = [
    { value: 'not_started', label: 'Not Started', color: '#6b7280' },
    { value: 'in_progress', label: 'In Progress', color: '#2563eb' },
    { value: 'in_progress_paused', label: 'Paused', color: '#f59e0b' },
    { value: 'completed', label: 'Completed', color: '#10b981' }
  ];

  const tabs = [
    { id: 'items', label: '📦 Job Items', icon: '📦' },
    { id: 'quote', label: '💰 Original Quote', icon: '💰' },
    { id: 'progress', label: '📊 Progress', icon: '📊' },
    { id: 'actions', label: '⚡ Quick Actions', icon: '⚡' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title={`📋 Job: ${job.lc_number}`}
        description={`${quote ? `From quote: ${quote.quote_number}` : 'Manual job'} | Client: ${job.client_name || 'N/A'}`}
        action={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={jobStatus}
              onChange={(e) => updateJobStatus(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                background: statusOptions.find(o => o.value === jobStatus)?.color || '#6b7280',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value} style={{ background: 'white', color: '#111827' }}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm" onClick={() => setShowAddItemModal(true)}>➕ Add Item</Button>
            <Link href={`/jobs/${params.id}/financial`}>
              <Button variant="primary" size="sm">💰 Financial</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary" size="sm">← Back</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div><strong>📊 Job Progress</strong></div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>Job Status: <StatusBadge status={jobStatus} /></div>
            <div>PO Status: 
              <span style={{ marginLeft: '0.25rem' }}>
                {poDisplayStatus === 'pending_receipt' && <StatusBadge status="pending" />}
                {poDisplayStatus === 'po_received' && <span style={{ color: '#10b981' }}>✓ PO Received</span>}
                {poDisplayStatus === 'partial_invoiced' && <StatusBadge status="in_progress" />}
                {poDisplayStatus === 'fully_invoiced' && <StatusBadge status="completed" />}
              </span>
            </div>
            {quote?.po_amount && (
              <div>PO Amount: <CurrencyAmount amount={quote.po_amount} /></div>
            )}
            <div>Current Total: <CurrencyAmount amount={summary.total_actual} /></div>
            <div>Finalized: <CurrencyAmount amount={summary.completed_value} /></div>
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem' }}>Completion Progress</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{progressPercentage}%</span>
          </div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${Math.min(progressPercentage, 100)}%`, 
              height: '100%', 
              background: progressPercentage >= 100 ? '#10b981' : progressPercentage >= 50 ? '#f59e0b' : '#2563eb' 
            }} />
          </div>
        </div>
        {quote?.po_received && quote?.po_amount && summary.total_actual > quote.po_amount && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#dc2626' }}>
            ⚠️ WARNING: Current total exceeds PO amount. A variance PO is required.
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb', marginTop: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#2563eb' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'items' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Click Edit to modify items. Finalize when work is complete.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobItems.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No items for this job yet. Click "Add Item" to create one.</td></tr>
                ) : (
                  jobItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}><strong>{item.item_name}</strong></td>
                      <td style={{ padding: '0.75rem' }}>{item.description || '-'}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quoted_quantity}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_unit_price} /></td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_total} /></td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {item.is_finalized ? <span style={{ color: '#10b981' }}>✓ Ready for Invoice</span> : <StatusBadge status="pending" />}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {!item.is_finalized && jobStatus !== 'completed' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => editItem(item)}>Edit</Button>
                              <Button variant="success" size="sm" onClick={() => finalizeItem(item)}>Finalize</Button>
                            </>
                          )}
                          {item.is_finalized && <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Invoicing Ready</span>}
                        </div>
                      </td>
                    </table>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'quote' && (
        <Card>
          {quote ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Original Quote: {quote.quote_number}</h3>
                <StatusBadge status={quote.status} />
              </div>
              {quote.po_received && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#d1fae5', borderRadius: '0.5rem' }}>
                  <strong>✓ PO Received</strong><br />
                  PO Number: {quote.po_number}<br />
                  PO Amount: <CurrencyAmount amount={quote.po_amount} /><br />
                  PO Date: {new Date(quote.po_date).toLocaleDateString()}
                </div>
              )}
              <p><strong>Scope:</strong> {quote.scope_subject || 'N/A'}</p>
              <p><strong>Quote Date:</strong> {new Date(quote.quote_date).toLocaleDateString()}</p>
              
              <div style={{ marginTop: '1.5rem' }}>
                <h4>Original Quote Items (Reference Only)</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f9fafb' }}><th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Qty</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th></tr></thead>
                    <tbody>
                      {quote.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem' }}><strong>{item.description}</strong>{item.additional_description && <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.additional_description}</div>}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.price_ex_vat} /></td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quantity * item.price_ex_vat} /></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f9fafb' }}><td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Original Subtotal:</td><td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}><CurrencyAmount amount={quote.subtotal || 0} /></td></tr>
                      <tr><td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right' }}>VAT (15%):</td><td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={quote.vat_amount || 0} /></td></tr>
                      <tr style={{ background: '#f0fdf4' }}><td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}>Original Total:</td><td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}><CurrencyAmount amount={quote.total_amount || 0} /></td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}><p>No quote linked to this job.</p></div>
          )}
        </Card>
      )}

      {activeTab === 'progress' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Card><h3>💰 Financial Progress</h3><div><strong>PO Amount:</strong> {quote?.po_amount ? <CurrencyAmount amount={quote.po_amount} /> : 'Not received'}</div><div><strong>Current Total:</strong> <CurrencyAmount amount={summary.total_actual} /></div><div><strong>Finalized:</strong> <CurrencyAmount amount={summary.completed_value} /></div><div><strong>Remaining:</strong> <CurrencyAmount amount={summary.total_actual - summary.completed_value} /></div></Card>
          <Card><h3>📋 Item Status</h3><div><strong>Total Items:</strong> {jobItems.length}</div><div><strong>Finalized:</strong> {jobItems.filter(i => i.is_finalized).length}</div><div><strong>In Progress:</strong> {jobItems.filter(i => !i.is_finalized).length}</div></Card>
          <Card><h3>📈 Job Status</h3><div><strong>Current Status:</strong> <StatusBadge status={jobStatus} /></div><div><strong>PO Status:</strong> {poDisplayStatus === 'pending_receipt' ? 'Awaiting PO' : poDisplayStatus === 'po_received' ? 'PO Received' : poDisplayStatus === 'partial_invoiced' ? 'Partial Invoiced' : 'Fully Invoiced'}</div><div><strong>Completion:</strong> {progressPercentage}%</div></Card>
        </div>
      )}

      {activeTab === 'actions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <Link href={`/jobs/${params.id}/hours`} style={{ textDecoration: 'none' }}><Card hover><div style={{ textAlign: 'center' }}>⏰<br/><strong>Book Employee Hours</strong></div></Card></Link>
          <Link href={`/jobs/${params.id}/financial`} style={{ textDecoration: 'none' }}><Card hover><div style={{ textAlign: 'center' }}>💰<br/><strong>Financial / Invoicing</strong></div></Card></Link>
          <Link href={`/jobs/${params.id}/stock`} style={{ textDecoration: 'none' }}><Card hover><div style={{ textAlign: 'center' }}>📦<br/><strong>Stock Management</strong></div></Card></Link>
          <Link href={`/jobs/${params.id}/tools`} style={{ textDecoration: 'none' }}><Card hover><div style={{ textAlign: 'center' }}>🔧<br/><strong>Tools Management</strong></div></Card></Link>
        </div>
      )}

      {/* Edit Item Modal */}
      <Modal isOpen={showEditItemModal} onClose={() => setShowEditItemModal(false)} title="Edit Job Item">
        {selectedItem && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
              Original: {selectedItem.original_quantity} @ <CurrencyAmount amount={selectedItem.original_price} />
            </div>
            <FormInput label="Item Name" value={selectedItem.item_name} onChange={e => setSelectedItem({...selectedItem, item_name: e.target.value})} />
            <FormTextarea label="Description" value={selectedItem.description} onChange={e => setSelectedItem({...selectedItem, description: e.target.value})} />
            <FormInput label="Quantity" type="number" step="0.01" value={selectedItem.quoted_quantity} onChange={e => setSelectedItem({...selectedItem, quoted_quantity: parseFloat(e.target.value)})} />
            <FormCurrencyInput label="Unit Price" value={selectedItem.quoted_unit_price} onChange={e => setSelectedItem({...selectedItem, quoted_unit_price: parseFloat(e.target.value)})} />
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}><Button onClick={saveItemEdit}>Save Changes</Button><Button variant="secondary" onClick={() => setShowEditItemModal(false)}>Cancel</Button></div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Add New Item">
        <FormInput label="Item Name" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required />
        <FormTextarea label="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
        <FormInput label="Quantity" type="number" step="0.01" value={newItem.quoted_quantity} onChange={e => setNewItem({...newItem, quoted_quantity: parseFloat(e.target.value)})} />
        <FormCurrencyInput label="Unit Price" value={newItem.quoted_unit_price} onChange={e => setNewItem({...newItem, quoted_unit_price: parseFloat(e.target.value)})} />
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}><Button onClick={addNewItem}>Add Item</Button><Button variant="secondary" onClick={() => setShowAddItemModal(false)}>Cancel</Button></div>
      </Modal>

      {/* Variance PO Modal */}
      <Modal isOpen={showVarianceModal} onClose={() => setShowVarianceModal(false)} title="Variance PO Required">
        <div>
          <p>The current changes exceed the approved PO amount by <strong><CurrencyAmount amount={varianceAmount} /></strong>.</p>
          <p>Would you like to create a variance PO request?</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <Button onClick={requestVariancePO}>Create Variance PO</Button>
            <Button variant="secondary" onClick={() => setShowVarianceModal(false)}>Cancel Edit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}