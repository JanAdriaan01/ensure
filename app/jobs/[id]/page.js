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
  const [summary, setSummary] = useState({ total_quoted: 0, total_actual: 0, completed_value: 0, progress: 0 });
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [poStatus, setPoStatus] = useState('pending');

  useEffect(() => {
    if (jobData) {
      setJob(jobData.job);
      fetchQuote();
      fetchJobItems();
      if (jobData.job?.po_status) setPoStatus(jobData.job.po_status);
    }
  }, [jobData]);

  const fetchQuote = async () => {
    if (jobData?.job?.quote_id) {
      const res = await fetch(`/api/quotes/${jobData.job.quote_id}`);
      setQuote(await res.json());
    }
  };

  const fetchJobItems = async () => {
    const res = await fetch(`/api/jobs/${params.id}/items`);
    const data = await res.json();
    setJobItems(data.items || []);
    setSummary(data.summary || { total_quoted: 0, total_actual: 0, completed_value: 0, progress: 0 });
  };

  const updatePoStatus = async (newStatus) => {
    const res = await fetch(`/api/jobs/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ po_status: newStatus })
    });
    if (res.ok) {
      setPoStatus(newStatus);
      success(`PO Status updated to ${newStatus}`);
      refetch();
    }
  };

  const finalizeItem = async (item) => {
    const actualQuantity = prompt('Enter actual quantity completed:', item.quoted_quantity);
    const actualCost = prompt('Enter actual cost:', item.quoted_total);
    if (!actualQuantity || !actualCost) return;
    
    const res = await fetch(`/api/jobs/${params.id}/items/${item.id}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual_quantity: parseFloat(actualQuantity), actual_cost: parseFloat(actualCost) })
    });
    if (res.ok) {
      success('Item finalized');
      fetchJobItems();
    }
  };

  const editItem = (item) => {
    setSelectedItem({ ...item });
    setShowEditItemModal(true);
  };

  const saveItemEdit = async () => {
    const res = await fetch(`/api/jobs/${params.id}/items/${selectedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoted_quantity: selectedItem.quoted_quantity,
        quoted_unit_price: selectedItem.quoted_unit_price,
        description: selectedItem.description
      })
    });
    if (res.ok) {
      success('Item updated');
      setShowEditItemModal(false);
      fetchJobItems();
    }
  };

  const progressPercentage = summary.total_quoted > 0 ? (summary.completed_value / summary.total_quoted * 100).toFixed(1) : 0;

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (!job) return <div>Job not found</div>;

  const tabs = [
    { id: 'items', label: '📦 Job Items', icon: '📦' },
    { id: 'quote', label: '💰 Original Quote', icon: '💰' },
    { id: 'progress', label: '📊 Progress', icon: '📊' },
    { id: 'actions', label: '⚡ Quick Actions', icon: '⚡' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <PageHeader 
        title={`📋 Job: ${job.lc_number}`}
        description={`Created from quote: ${quote?.quote_number || 'N/A'} | Client: ${job.client_name || 'N/A'}`}
        action={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem' }}>PO Status:</span>
              <select value={poStatus} onChange={(e) => updatePoStatus(e.target.value)} style={{ padding: '0.25rem', borderRadius: '0.25rem', border: '1px solid #ddd' }}>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="invoiced">Invoiced</option>
              </select>
            </div>
            <Link href={`/jobs/${params.id}/financial`}>
              <Button variant="primary">💰 Financial</Button>
            </Link>
            <Link href={`/jobs/${params.id}/hours`}>
              <Button variant="primary">⏰ Book Hours</Button>
            </Link>
            <Link href={`/jobs/${params.id}/stock`}>
              <Button variant="secondary">📦 Stock</Button>
            </Link>
            <Link href={`/jobs/${params.id}/tools`}>
              <Button variant="secondary">🔧 Tools</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary">← Back</Button>
            </Link>
          </div>
        }
      />

      {/* Progress Overview Card */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div><strong>📊 Job Progress</strong></div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div>Quoted: <CurrencyAmount amount={summary.total_quoted} /></div>
            <div>Actual: <CurrencyAmount amount={summary.total_actual} /></div>
            <div>Completed: <CurrencyAmount amount={summary.completed_value} /></div>
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem' }}>Completion Progress</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{progressPercentage}%</span>
          </div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercentage}%`, height: '100%', background: progressPercentage > 80 ? '#10b981' : progressPercentage > 50 ? '#f59e0b' : '#2563eb' }} />
          </div>
        </div>
        {poStatus === 'received' && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#dbeafe', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
            ✅ PO Received - Job ready for execution. You can now book hours, issue stock, and finalize items.
          </div>
        )}
        {poStatus === 'invoiced' && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#d1fae5', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
            💰 Job Invoiced - No further changes allowed unless creating a variation order.
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
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
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Click Edit to modify line items. Click Finalize when work is completed.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Quoted Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actual Cost</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', background: item.is_over_budget ? '#fee2e2' : 'transparent' }}>
                    <td style={{ padding: '0.75rem' }}><strong>{item.item_name}</strong></td>
                    <td style={{ padding: '0.75rem' }}>{item.description || '-'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quoted_quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_unit_price} /></td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.quoted_total} /></td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}><CurrencyAmount amount={item.actual_cost || 0} /></td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <StatusBadge status={item.is_finalized ? 'completed' : (item.actual_cost > 0 ? 'in_progress' : 'pending')} />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Button variant="outline" size="sm" onClick={() => editItem(item)}>Edit</Button>
                        {!item.is_finalized && poStatus === 'received' && (
                          <Button variant="success" size="sm" onClick={() => finalizeItem(item)}>Finalize</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Original Quote */}
      {activeTab === 'quote' && quote && (
        <Card>
          <h3>Original Quote: {quote.quote_number}</h3>
          <p><strong>Scope:</strong> {quote.scope_subject}</p>
          <p><strong>Quote Date:</strong> {new Date(quote.quote_date).toLocaleDateString()}</p>
          <p><strong>Prepared By:</strong> {quote.quote_prepared_by || 'N/A'}</p>
          <div style={{ marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {quote.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td><CurrencyAmount amount={item.price_ex_vat} /></td>
                    <td><CurrencyAmount amount={item.quantity * item.price_ex_vat} /></td>
                   </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan="3" style={{ textAlign: 'right' }}>Total:</td><td><CurrencyAmount amount={quote.total_amount} /></td></tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Progress */}
      {activeTab === 'progress' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <Card>
            <h3>Financial Progress</h3>
            <p><strong>Total Quoted:</strong> <CurrencyAmount amount={summary.total_quoted} /></p>
            <p><strong>Total Actual:</strong> <CurrencyAmount amount={summary.total_actual} /></p>
            <p><strong>Completed Value:</strong> <CurrencyAmount amount={summary.completed_value} /></p>
            <p><strong>Remaining Value:</strong> <CurrencyAmount amount={summary.total_quoted - summary.completed_value} /></p>
          </Card>
          <Card>
            <h3>Item Status</h3>
            <p><strong>Total Items:</strong> {jobItems.length}</p>
            <p><strong>Finalized:</strong> {jobItems.filter(i => i.is_finalized).length}</p>
            <p><strong>In Progress:</strong> {jobItems.filter(i => i.actual_cost > 0 && !i.is_finalized).length}</p>
            <p><strong>Not Started:</strong> {jobItems.filter(i => !i.actual_cost && !i.is_finalized).length}</p>
            <p><strong>Over Budget Items:</strong> {jobItems.filter(i => i.is_over_budget).length}</p>
          </Card>
        </div>
      )}

      {/* Tab: Quick Actions */}
      {activeTab === 'actions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Link href={`/jobs/${params.id}/hours`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>⏰<br/><strong>Book Employee Hours</strong><br/>Log time against this job</div></Card>
          </Link>
          <Link href={`/jobs/${params.id}/financial`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>💰<br/><strong>Financial / Invoicing</strong><br/>Invoice items and track payments</div></Card>
          </Link>
          <Link href={`/jobs/${params.id}/stock`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>📦<br/><strong>Stock Management</strong><br/>Issue stock to this job</div></Card>
          </Link>
          <Link href={`/jobs/${params.id}/tools`} style={{ textDecoration: 'none' }}>
            <Card hover><div style={{ textAlign: 'center' }}>🔧<br/><strong>Tools Management</strong><br/>Check out tools for this job</div></Card>
          </Link>
        </div>
      )}

      {/* Edit Item Modal */}
      <Modal isOpen={showEditItemModal} onClose={() => setShowEditItemModal(false)} title="Edit Job Item">
        {selectedItem && (
          <div>
            <FormInput label="Item Name" value={selectedItem.item_name} onChange={e => setSelectedItem({...selectedItem, item_name: e.target.value})} />
            <FormTextarea label="Description" value={selectedItem.description || ''} onChange={e => setSelectedItem({...selectedItem, description: e.target.value})} />
            <FormInput label="Quantity" type="number" step="0.01" value={selectedItem.quoted_quantity} onChange={e => setSelectedItem({...selectedItem, quoted_quantity: parseFloat(e.target.value)})} />
            <FormCurrencyInput label="Unit Price" value={selectedItem.quoted_unit_price} onChange={e => setSelectedItem({...selectedItem, quoted_unit_price: parseFloat(e.target.value)})} />
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