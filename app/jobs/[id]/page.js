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
    over_budget_count: 0,
    original_po_amount: 0,
    variation_required: false,
    variation_amount: 0
  });
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    quoted_quantity: 1,
    quoted_unit_price: 0
  });
  const [variationDetails, setVariationDetails] = useState({
    item_id: null,
    original_total: 0,
    new_total: 0,
    difference: 0
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
      
      const totalQuoted = data.items?.reduce((sum, i) => sum + (i.quoted_total || 0), 0) || 0;
      const originalTotal = data.items?.reduce((sum, i) => sum + (i.original_total || i.quoted_total || 0), 0) || 0;
      const variationAmount = totalQuoted - originalTotal;
      
      setSummary({
        total_quoted: totalQuoted,
        total_actual: data.summary?.total_actual || 0,
        completed_value: data.summary?.completed_value || 0,
        progress: data.summary?.progress || 0,
        over_budget_count: data.summary?.over_budget_count || 0,
        original_po_amount: job?.po_amount || originalTotal,
        variation_required: variationAmount > 0,
        variation_amount: variationAmount
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
      original_quantity: item.original_quantity || item.quoted_quantity,
      original_unit_price: item.original_unit_price || item.quoted_unit_price,
      original_total: item.original_total || (item.quoted_quantity * item.quoted_unit_price),
      revision_number: (item.revision_number || 1) + 1
    });
    setShowEditItemModal(true);
  };

  const saveItemEdit = async () => {
    const newTotal = selectedItem.quoted_quantity * selectedItem.quoted_unit_price;
    const originalTotal = selectedItem.original_total;
    
    if (newTotal < originalTotal) {
      // Below original - can be finalized with comment
      const comment = prompt('Reason for reduction (PO amount not fully invoiced):', 'Partial delivery/savings');
      await performSaveEdit(comment, false);
    } else if (newTotal > originalTotal) {
      // Above original - needs variation PO
      setVariationDetails({
        item_id: selectedItem.id,
        item_name: selectedItem.item_name,
        original_total: originalTotal,
        new_total: newTotal,
        difference: newTotal - originalTotal
      });
      setShowVariationModal(true);
    } else {
      // Same - just update
      await performSaveEdit(null, false);
    }
  };

  const performSaveEdit = async (comment, isVariation) => {
    try {
      const newTotal = selectedItem.quoted_quantity * selectedItem.quoted_unit_price;
      
      const res = await fetch(`/api/jobs/${params.id}/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoted_quantity: selectedItem.quoted_quantity,
          quoted_unit_price: selectedItem.quoted_unit_price,
          description: selectedItem.description,
          revision_number: selectedItem.revision_number,
          revision_reason: comment || (isVariation ? 'Variation order required' : 'Standard revision'),
          original_quantity: selectedItem.original_quantity,
          original_unit_price: selectedItem.original_unit_price,
          original_total: selectedItem.original_total
        })
      });
      
      if (res.ok) {
        success('Item updated successfully');
        setShowEditItemModal(false);
        fetchJobItems();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error saving item edit:', error);
      toastError('Failed to update item');
    }
  };

  const createVariationPO = async () => {
    try {
      // Create variation quote
      const quoteNumber = `VAR-${quote?.quote_number || job?.lc_number}-${new Date().getFullYear()}`;
      
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_number: quoteNumber,
          client_id: job?.client_id,
          original_quote_id: quote?.id,
          scope_subject: `Variation order for ${job?.lc_number} - Additional ${variationDetails.difference}`,
          status: 'pending',
          total_amount: variationDetails.difference,
          items: [{
            item_number: 1,
            description: `Variation for ${variationDetails.item_name} - overage`,
            quantity: 1,
            price_ex_vat: variationDetails.difference
          }]
        })
      });
      
      if (res.ok) {
        const variationQuote = await res.json();
        success('Variation PO created. Please have it approved.');
        
        // Update the job item with variation reference
        await fetch(`/api/jobs/${params.id}/items/${variationDetails.item_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variation_po_required: true,
            variation_quote_id: variationQuote.id,
            revision_reason: `Variation PO created: ${quoteNumber}`
          })
        });
        
        setShowVariationModal(false);
        setShowEditItemModal(false);
        fetchJobItems();
      }
    } catch (error) {
      toastError('Failed to create variation PO');
    }
  };

  const addNewItem = async () => {
    if (!newItem.item_name) {
      toastError('Item name is required');
      return;
    }
    
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
        const error = await res.json();
        toastError(error.error || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toastError('Failed to add item');
    }
  };

  const finalizeItem = async (item) => {
    if (jobStatus !== 'in_progress' && jobStatus !== 'completed') {
      toastError('Job must be In Progress or Completed to finalize items');
      return;
    }
    
    // Check if this item has variation pending
    if (item.variation_po_required) {
      toastError('This item requires a variation PO approval before finalizing.');
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
        const error = await res.json();
        toastError(error.error || 'Failed to finalize item');
      }
    } catch (error) {
      console.error('Error finalizing item:', error);
      toastError('Failed to finalize item');
    }
  };

  const progressPercentage = summary.total_quoted > 0 
    ? (summary.completed_value / summary.total_quoted * 100).toFixed(1) 
    : 0;

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
              <Button variant="secondary" size="sm">← Back to Jobs</Button>
            </Link>
          </div>
        }
      />

      {/* Warning if variation is required */}
      {summary.variation_required && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem', borderLeft: '4px solid #dc2626' }}>
          <strong>⚠️ Variation Required</strong><br />
          Total has increased by <CurrencyAmount amount={summary.variation_amount} /> from the original PO amount.
          Please create a variation PO to proceed with invoicing.
        </div>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div><strong>📊 Job Progress</strong></div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>Job Status: <StatusBadge status={jobStatus} /></div>
            {quote?.po_amount && (
              <div>Original PO: <CurrencyAmount amount={quote.po_amount} /></div>
            )}
            <div>Current Total: <CurrencyAmount amount={summary.total_quoted} /></div>
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

      {/* Tab: Job Items */}
      {activeTab === 'items' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Click Edit to modify items. 
              {jobStatus === 'in_progress' ? ' Edits below original amount can be finalized with comment. Edits above require variation PO.' : ' Job must be In Progress to edit items.'}
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Original Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Current Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Original Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Current Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No items for this job yet. Click "Add Item" to create one.
                    </td>
                  </tr>
                ) : (
                  jobItems.map(item => {
                    const isReduced = item.quoted_total < (item.original_total || item.quoted_total);
                    const isIncreased = item.quoted_total > (item.original_total || item.quoted_total);
                    const originalTotal = item.original_total || item.quoted_total;
                    
                    return (
                      <tr key={item.id} style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        background: isIncreased ? '#fef3c7' : isReduced ? '#d1fae5' : 'transparent'
                      }}>
                        <td style={{ padding: '0.75rem' }}><strong>{item.item_name}</strong></td>
                        <td style={{ padding: '0.75rem' }}>{item.description || '-'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.original_quantity || item.quoted_quantity}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {item.quoted_quantity}
                          {isReduced && <span style={{ fontSize: '0.7rem', color: '#10b981', marginLeft: '0.25rem' }}>▼</span>}
                          {isIncreased && <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginLeft: '0.25rem' }}>▲</span>}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_unit_price} /></td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={originalTotal} /></td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_total} /></td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {item.is_finalized ? (
                            <span style={{ color: '#10b981' }}>✓ Ready for Invoice</span>
                          ) : item.variation_po_required ? (
                            <span style={{ color: '#f59e0b' }}>⏳ Awaiting Variation PO</span>
                          ) : (
                            <StatusBadge status={item.completion_status === 'completed' ? 'completed' : 'pending'} />
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            {!item.is_finalized && jobStatus === 'in_progress' && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => editItem(item)}>Edit</Button>
                                <Button variant="success" size="sm" onClick={() => finalizeItem(item)}>Finalize</Button>
                              </>
                            )}
                            {item.is_finalized && (
                              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Invoicing Ready</span>
                            )}
                            {item.variation_po_required && !item.is_finalized && (
                              <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Variation Required</span>
                            )}
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
      )}

      {/* Tab: Original Quote */}
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
                  <strong>✓ Original PO Received</strong><br />
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
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <strong>{item.description}</strong>
                            {item.additional_description && (
                              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.additional_description}</div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.price_ex_vat} /></td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quantity * item.price_ex_vat} /></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f9fafb' }}>
                        <td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Original Subtotal:</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}><CurrencyAmount amount={quote.subtotal || 0} /></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No quote linked to this job.</p>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Progress */}
      {activeTab === 'progress' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Card>
            <h3>💰 Financial Progress</h3>
            <div><strong>Original PO Amount:</strong> <CurrencyAmount amount={summary.original_po_amount} /></div>
            <div><strong>Current Total:</strong> <CurrencyAmount amount={summary.total_quoted} /></div>
            <div><strong>Variance:</strong> <CurrencyAmount amount={summary.total_quoted - summary.original_po_amount} /></div>
            <div><strong>Finalized for Invoice:</strong> <CurrencyAmount amount={summary.completed_value} /></div>
            {summary.variation_required && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fef3c7', borderRadius: '0.5rem', color: '#92400e' }}>
                ⚠️ Variation Required: <CurrencyAmount amount={summary.variation_amount} />
              </div>
            )}
          </Card>

          <Card>
            <h3>📋 Item Status</h3>
            <div><strong>Total Items:</strong> {jobItems.length}</div>
            <div><strong>Finalized:</strong> {jobItems.filter(i => i.is_finalized).length}</div>
            <div><strong>In Progress:</strong> {jobItems.filter(i => !i.is_finalized && !i.variation_po_required).length}</div>
            <div><strong>Awaiting Variation:</strong> {jobItems.filter(i => i.variation_po_required).length}</div>
          </Card>

          <Card>
            <h3>📈 Job Status</h3>
            <div><strong>Current Status:</strong> <StatusBadge status={jobStatus} /></div>
            <div><strong>Completion:</strong> {progressPercentage}%</div>
          </Card>
        </div>
      )}

      {/* Tab: Quick Actions */}
      {activeTab === 'actions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <Link href={`/jobs/${params.id}/hours`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>⏰<br/><strong>Book Employee Hours</strong></div></Card>
          </Link>
          <Link href={`/jobs/${params.id}/financial`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>💰<br/><strong>Financial / Invoicing</strong></div></Card>
          </Link>
          <Link href={`/jobs/${params.id}/stock`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>📦<br/><strong>Stock Management</strong></div></Card>
          </Link>
          <Link href={`/jobs/${params.id}/tools`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>🔧<br/><strong>Tools Management</strong></div></Card>
          </Link>
        </div>
      )}

      {/* Edit Item Modal */}
      <Modal isOpen={showEditItemModal} onClose={() => setShowEditItemModal(false)} title="Edit Job Item">
        {selectedItem && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
              <strong>Original values:</strong> {selectedItem.original_quantity} @ <CurrencyAmount amount={selectedItem.original_unit_price} /> = <CurrencyAmount amount={selectedItem.original_total} />
              <br />
              <strong>Revision #{selectedItem.revision_number}</strong>
            </div>
            <FormInput 
              label="Item Name" 
              value={selectedItem.item_name} 
              onChange={e => setSelectedItem({...selectedItem, item_name: e.target.value})} 
            />
            <FormTextarea 
              label="Description" 
              value={selectedItem.description} 
              onChange={e => setSelectedItem({...selectedItem, description: e.target.value})} 
            />
            <FormInput 
              label="Quantity" 
              type="number" 
              step="0.01" 
              value={selectedItem.quoted_quantity} 
              onChange={e => setSelectedItem({...selectedItem, quoted_quantity: parseFloat(e.target.value)})} 
            />
            <FormCurrencyInput 
              label="Unit Price" 
              value={selectedItem.quoted_unit_price} 
              onChange={e => setSelectedItem({...selectedItem, quoted_unit_price: parseFloat(e.target.value)})} 
            />
            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#6b7280' }}>
              New Total: <CurrencyAmount amount={selectedItem.quoted_quantity * selectedItem.quoted_unit_price} />
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
              <Button onClick={saveItemEdit}>Save Changes</Button>
              <Button variant="secondary" onClick={() => setShowEditItemModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Add New Item">
        <div>
          <FormInput 
            label="Item Name" 
            value={newItem.item_name} 
            onChange={e => setNewItem({...newItem, item_name: e.target.value})} 
            required 
          />
          <FormTextarea 
            label="Description" 
            value={newItem.description} 
            onChange={e => setNewItem({...newItem, description: e.target.value})} 
          />
          <FormInput 
            label="Quantity" 
            type="number" 
            step="0.01" 
            value={newItem.quoted_quantity} 
            onChange={e => setNewItem({...newItem, quoted_quantity: parseFloat(e.target.value)})} 
          />
          <FormCurrencyInput 
            label="Unit Price" 
            value={newItem.quoted_unit_price} 
            onChange={e => setNewItem({...newItem, quoted_unit_price: parseFloat(e.target.value)})} 
          />
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
            <Button onClick={addNewItem}>Add Item</Button>
            <Button variant="secondary" onClick={() => setShowAddItemModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Variation PO Modal */}
      <Modal isOpen={showVariationModal} onClose={() => setShowVariationModal(false)} title="Variation Order Required">
        <div>
          <p>The edited amount exceeds the original PO value.</p>
          <div style={{ margin: '1rem 0', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
            <strong>Item:</strong> {variationDetails.item_name}<br />
            <strong>Original Total:</strong> <CurrencyAmount amount={variationDetails.original_total} /><br />
            <strong>New Total:</strong> <CurrencyAmount amount={variationDetails.new_total} /><br />
            <strong>Difference:</strong> <CurrencyAmount amount={variationDetails.difference} />
          </div>
          <p>A variation PO must be created and approved before this item can be finalized.</p>
          <p>Would you like to create a variation PO now?</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <Button onClick={createVariationPO}>Create Variation PO</Button>
            <Button variant="secondary" onClick={() => setShowVariationModal(false)}>Cancel Edit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}