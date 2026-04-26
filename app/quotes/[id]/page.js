'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge';
import Button from '@/app/components/ui/Button/Button';
import Modal from '@/app/components/ui/Modal/Modal';
import { FormInput, FormCurrencyInput, FormTextarea } from '@/app/components/ui/Form';

export default function QuoteDetailPage({ params }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPoModal, setShowPoModal] = useState(false);
  const [poData, setPoData] = useState({
    po_number: '',
    po_amount: '',
    po_date: new Date().toISOString().split('T')[0],
    po_document: ''
  });

  useEffect(() => {
    fetchQuote();
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/quotes/${params.id}`);
      if (!res.ok) throw new Error('Quote not found');
      const data = await res.json();
      setQuote(data);
      if (data.po_received) {
        setPoData({
          po_number: data.po_number || '',
          po_amount: data.po_amount || '',
          po_date: data.po_date || new Date().toISOString().split('T')[0],
          po_document: data.po_document || ''
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/quotes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      const result = await res.json();
      success(`Quote ${newStatus}. ${result.job_created ? 'A job has been created and you can now view it in Jobs.' : ''}`);
      fetchQuote();
      
    } catch (err) {
      toastError(err.message);
    }
  };

  const recordPoReceived = async () => {
    if (!poData.po_number || !poData.po_amount) {
      toastError('PO Number and Amount are required');
      return;
    }
    
    try {
      const res = await fetch(`/api/quotes/${params.id}/po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          po_number: poData.po_number,
          po_amount: parseFloat(poData.po_amount),
          po_date: poData.po_date,
          po_document: poData.po_document
        })
      });
      
      if (res.ok) {
        success('PO recorded successfully');
        setShowPoModal(false);
        fetchQuote();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to record PO');
      }
    } catch (error) {
      toastError('Failed to record PO');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
        Loading quote...
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error || 'Quote not found'}</p>
        <Link href="/quotes">
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>← Back to Quotes</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/quotes" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Quotes</Link>
          <h1 style={{ margin: '0.25rem 0 0 0' }}>💰 Quote: {quote.quote_number}</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Version {quote.version} | Created: {new Date(quote.created_at).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!quote.po_received && quote.status === 'approved' && (
            <Button variant="success" size="sm" onClick={() => setShowPoModal(true)}>📄 Record PO Received</Button>
          )}
          {quote.status !== 'approved' && quote.status !== 'rejected' && quote.status !== 'po_received' && (
            <Button variant="success" size="sm" onClick={() => updateStatus('approved')}>✓ Approve Quote</Button>
          )}
          {quote.status !== 'rejected' && quote.status !== 'approved' && quote.status !== 'po_received' && (
            <Button variant="danger" size="sm" onClick={() => updateStatus('rejected')}>✗ Reject Quote</Button>
          )}
          {quote.job_id && (
            <Link href={`/jobs/${quote.job_id}`}>
              <Button variant="primary" size="sm">Go to Job →</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quote Details Card */}
      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {quote.po_received && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#d1fae5', borderRadius: '0.5rem' }}>
            <strong>✓ PO Received</strong><br />
            PO Number: {quote.po_number}<br />
            PO Amount: <CurrencyAmount amount={quote.po_amount} /><br />
            PO Date: {new Date(quote.po_date).toLocaleDateString()}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div><strong>Client:</strong> {quote.client_name || 'N/A'}</div>
          <div><strong>Site Name:</strong> {quote.site_name || '-'}</div>
          <div><strong>Contact Person:</strong> {quote.contact_person || '-'}</div>
          <div><strong>Quote Date:</strong> {new Date(quote.quote_date).toLocaleDateString()}</div>
          <div><strong>Prepared By:</strong> {quote.quote_prepared_by || '-'}</div>
          <div><strong>Status:</strong> <StatusBadge status={quote.status} /></div>
        </div>
        {quote.scope_subject && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <strong>Scope / Subject:</strong>
            <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{quote.scope_subject}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0 }}>Quote Items</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>#</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Unit</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>UoM</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Ex VAT</th>
              </tr>
            </thead>
            <tbody>
              {quote.items && quote.items.length > 0 ? (
                quote.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{item.item_number}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <strong>{item.description}</strong>
                      {item.additional_description && (
                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.additional_description}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{item.unit || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{item.unit_of_measure}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <CurrencyAmount amount={item.price_ex_vat} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <CurrencyAmount amount={item.quantity * item.price_ex_vat} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No items found for this quote.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot style={{ background: '#f9fafb' }}>
              <tr>
                <td colSpan="6" style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold' }}>Subtotal Ex VAT:</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold' }}>
                  <CurrencyAmount amount={quote.subtotal || 0} />
                </td>
              </tr>
              <tr>
                <td colSpan="6" style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>VAT (15%):</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <CurrencyAmount amount={quote.vat_amount || 0} />
                </td>
              </tr>
              <tr style={{ background: '#f0fdf4' }}>
                <td colSpan="6" style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}>Total:</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}>
                  <CurrencyAmount amount={quote.total_amount || 0} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* PO Receipt Modal */}
      <Modal isOpen={showPoModal} onClose={() => setShowPoModal(false)} title="Record Purchase Order Received">
        <div>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
            Recording a PO against this quote will lock the quote amount and create a job if not already created.
          </div>
          <FormInput 
            label="PO Number" 
            value={poData.po_number} 
            onChange={e => setPoData({...poData, po_number: e.target.value})} 
            required 
            placeholder="e.g., PO-2024-001"
          />
          <FormCurrencyInput 
            label="PO Amount" 
            value={poData.po_amount} 
            onChange={e => setPoData({...poData, po_amount: e.target.value})} 
            required 
          />
          <FormInput 
            label="PO Date" 
            type="date" 
            value={poData.po_date} 
            onChange={e => setPoData({...poData, po_date: e.target.value})} 
          />
          <FormTextarea 
            label="PO Document Reference" 
            value={poData.po_document} 
            onChange={e => setPoData({...poData, po_document: e.target.value})} 
            placeholder="Link or reference to PO document"
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button onClick={recordPoReceived}>Save PO</Button>
            <Button variant="secondary" onClick={() => setShowPoModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}