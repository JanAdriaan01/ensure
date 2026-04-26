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
  const [summary, setSummary] = useState({ 
    total_quoted: 0, 
    total_actual: 0, 
    completed_value: 0, 
    progress: 0,
    over_budget_count: 0
  });
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (jobData) {
      setJob(jobData.job);
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

  const editItem = (item) => {
    setSelectedItem({ 
      id: item.id,
      item_name: item.item_name,
      description: item.description || '',
      quoted_quantity: item.quoted_quantity,
      quoted_unit_price: item.quoted_unit_price,
      original_quantity: item.quoted_quantity,
      original_price: item.quoted_unit_price
    });
    setShowEditItemModal(true);
  };

  const saveItemEdit = async () => {
    try {
      const newTotal = selectedItem.quoted_quantity * selectedItem.quoted_unit_price;
      const originalTotal = selectedItem.original_quantity * selectedItem.original_price;
      const isOverBudget = newTotal > originalTotal;
      
      const res = await fetch(`/api/jobs/${params.id}/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoted_quantity: selectedItem.quoted_quantity,
          quoted_unit_price: selectedItem.quoted_unit_price,
          description: selectedItem.description,
          is_over_budget: isOverBudget
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

  const finalizeItem = async (item) => {
    const actualQuantity = prompt('Enter actual quantity completed:', item.quoted_quantity);
    const actualCost = prompt('Enter actual cost:', item.quoted_total);
    if (!actualQuantity || !actualCost) return;
    
    try {
      const res = await fetch(`/api/jobs/${params.id}/items/${item.id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actual_quantity: parseFloat(actualQuantity), 
          actual_cost: parseFloat(actualCost)
        })
      });
      if (res.ok) {
        success('Item finalized');
        fetchJobItems();
      } else {
        toastError('Failed to finalize item');
      }
    } catch (error) {
      toastError('Failed to finalize item');
    }
  };

  const progressPercentage = summary.total_quoted > 0 
    ? (summary.completed_value / summary.total_quoted * 100).toFixed(1) 
    : 0;

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (!job) return <div style={{ padding: '2rem', textAlign: 'center' }}>Job not found</div>;

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
            <Link href={`/jobs/${params.id}/hours`}>
              <Button variant="primary" size="sm">⏰ Book Hours</Button>
            </Link>
            <Link href={`/jobs/${params.id}/financial`}>
              <Button variant="primary" size="sm">💰 Financial</Button>
            </Link>
            <Link href={`/jobs/${params.id}/stock`}>
              <Button variant="secondary" size="sm">📦 Stock</Button>
            </Link>
            <Link href={`/jobs/${params.id}/tools`}>
              <Button variant="secondary" size="sm">🔧 Tools</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary" size="sm">← Back to Jobs</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div><strong>📊 Job Progress</strong></div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>Original Quote: <CurrencyAmount amount={summary.total_quoted} /></div>
            <div>Current Total: <CurrencyAmount amount={summary.total_actual} /></div>
            <div>Completed: <CurrencyAmount amount={summary.completed_value} /></div>
            {summary.over_budget_count > 0 && (
              <div style={{ color: '#dc2626' }}>⚠️ {summary.over_budget_count} items over budget</div>
            )}
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
              Click Edit to modify quantities or prices. Finalize items when work is complete.
              Original quote values are preserved for reference.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Current Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Current Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Current Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actual Cost</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No items for this job yet.
                    </td>
                  </tr>
                ) : (
                  jobItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', background: item.is_over_budget ? '#fee2e2' : 'transparent' }}>
                      <td style={{ padding: '0.75rem' }}><strong>{item.item_name}</strong></td>
                      <td style={{ padding: '0.75rem' }}>{item.description || '-'}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quoted_quantity}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_unit_price} /></td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_total} /></td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.actual_cost || 0} /></td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <StatusBadge status={item.completion_status === 'completed' ? 'completed' : (item.actual_cost > 0 ? 'in_progress' : 'pending')} />
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <Button variant="outline" size="sm" onClick={() => editItem(item)}>Edit</Button>
                          {item.completion_status !== 'completed' && (
                            <Button variant="success" size="sm" onClick={() => finalizeItem(item)}>Finalize</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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
              <p><strong>Scope:</strong> {quote.scope_subject || 'N/A'}</p>
              <p><strong>Quote Date:</strong> {new Date(quote.quote_date).toLocaleDateString()}</p>
              <p><strong>Prepared By:</strong> {quote.quote_prepared_by || 'N/A'}</p>
              <p><strong>Site:</strong> {quote.site_name || 'N/A'}</p>
              <p><strong>Contact Person:</strong> {quote.contact_person || 'N/A'}</p>
              
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
                      <tr>
                        <td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right' }}>VAT (15%):</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={quote.vat_amount || 0} /></td>
                      </tr>
                      <tr style={{ background: '#f0fdf4' }}>
                        <td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}>Original Total:</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}>
                          <CurrencyAmount amount={quote.total_amount || 0} />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No quote linked to this job.</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>This job was created manually or from an older system.</p>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Progress */}
      {activeTab === 'progress' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ marginBottom: '1rem' }}>💰 Financial Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Original Quote Amount:</span>
                <strong><CurrencyAmount amount={summary.total_quoted} /></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Current Total (with edits):</span>
                <strong><CurrencyAmount amount={summary.total_actual} /></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed Value:</span>
                <strong><CurrencyAmount amount={summary.completed_value} /></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Remaining Value:</span>
                <strong><CurrencyAmount amount={summary.total_actual - summary.completed_value} /></strong>
              </div>
              <hr style={{ margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Variance from Original:</span>
                <strong style={{ color: summary.total_actual > summary.total_quoted ? '#dc2626' : '#10b981' }}>
                  <CurrencyAmount amount={summary.total_actual - summary.total_quoted} />
                </strong>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ marginBottom: '1rem' }}>📋 Item Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Items:</span>
                <strong>{jobItems.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed:</span>
                <strong style={{ color: '#10b981' }}>{jobItems.filter(i => i.completion_status === 'completed').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>In Progress:</span>
                <strong style={{ color: '#f59e0b' }}>{jobItems.filter(i => i.actual_cost > 0 && i.completion_status !== 'completed').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Not Started:</span>
                <strong>{jobItems.filter(i => !i.actual_cost && i.completion_status !== 'completed').length}</strong>
              </div>
              <hr style={{ margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Over Budget Items:</span>
                <strong style={{ color: '#dc2626' }}>{summary.over_budget_count || 0}</strong>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ marginBottom: '1rem' }}>📈 Completion Progress</h3>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Overall Progress</span>
                <strong>{progressPercentage}%</strong>
              </div>
              <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(progressPercentage, 100)}%`, height: '100%', background: progressPercentage >= 100 ? '#10b981' : '#2563eb' }} />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Job Status</span>
                <StatusBadge status={job.completion_status} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Quick Actions */}
      {activeTab === 'actions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <Link href={`/jobs/${params.id}/hours`} style={{ textDecoration: 'none' }}>
            <Card hover>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Book Employee Hours</strong>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Log time spent by employees on this job</span>
              </div>
            </Card>
          </Link>

          <Link href={`/jobs/${params.id}/financial`} style={{ textDecoration: 'none' }}>
            <Card hover>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Financial / Invoicing</strong>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Generate invoices and track payments</span>
              </div>
            </Card>
          </Link>

          <Link href={`/jobs/${params.id}/stock`} style={{ textDecoration: 'none' }}>
            <Card hover>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Stock Management</strong>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Issue stock items to this job</span>
              </div>
            </Card>
          </Link>

          <Link href={`/jobs/${params.id}/tools`} style={{ textDecoration: 'none' }}>
            <Card hover>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔧</div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Tools Management</strong>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Check out tools for this job</span>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Edit Item Modal */}
      <Modal isOpen={showEditItemModal} onClose={() => setShowEditItemModal(false)} title="Edit Job Item">
        {selectedItem && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
              <strong>Note:</strong> Original quote values: {selectedItem.original_quantity} @ <CurrencyAmount amount={selectedItem.original_price} />
            </div>
            <FormInput 
              label="Item Name" 
              value={selectedItem.item_name} 
              onChange={e => setSelectedItem({...selectedItem, item_name: e.target.value})} 
            />
            <FormTextarea 
              label="Description" 
              value={selectedItem.description || ''} 
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
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button onClick={saveItemEdit}>Save Changes</Button>
              <Button variant="secondary" onClick={() => setShowEditItemModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}