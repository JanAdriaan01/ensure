'use client';

import { useState } from 'react';
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
import EmptyState from '@/app/components/ui/EmptyState/EmptyState';

export default function QuoteDetailPage({ params }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: quote, loading, refetch } = useFetch(`/api/quotes/${params.id}`);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState([]);

  const fetchVersions = async () => {
    const res = await fetch(`/api/quotes/${params.id}/versions`);
    setVersions(await res.json());
    setShowVersionHistory(true);
  };

  const updatePoStatus = async (status) => {
    const res = await fetch(`/api/quotes/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ po_status: status })
    });
    if (res.ok) {
      success('PO Status updated');
      refetch();
    } else {
      toastError('Failed to update status');
    }
  };

  const createNewVersion = async () => {
    // Redirect to edit page with copy of current quote
    router.push(`/quotes/${params.id}/edit`);
  };

  if (loading) return <LoadingSpinner text="Loading quote..." />;
  if (!quote) return <EmptyState title="Quote not found" />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title={`💰 Quote: ${quote.quote_number}`}
        description={`Version ${quote.version} | Created: ${new Date(quote.quote_date).toLocaleDateString()}`}
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={createNewVersion} variant="secondary">✏️ Create New Version</Button>
            <Button onClick={fetchVersions} variant="outline">📋 Version History</Button>
            <Link href="/quotes"><Button variant="secondary">← Back</Button></Link>
          </div>
        }
      />

      {/* Quote Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <Card>
          <h3>Quote Information</h3>
          <p><strong>Client:</strong> {quote.client_name}</p>
          <p><strong>Site:</strong> {quote.site_name || '-'}</p>
          <p><strong>Contact Person:</strong> {quote.contact_person || '-'}</p>
          <p><strong>Prepared By:</strong> {quote.quote_prepared_by || '-'}</p>
          <p><strong>Status:</strong> <StatusBadge status={quote.status} /></p>
        </Card>
        <Card>
          <h3>Financial Summary</h3>
          <p><strong>Subtotal Ex VAT:</strong> <CurrencyAmount amount={quote.subtotal || 0} /></p>
          <p><strong>VAT (15%):</strong> <CurrencyAmount amount={quote.vat_amount || 0} /></p>
          <p><strong>Total:</strong> <strong><CurrencyAmount amount={quote.total_amount || 0} /></strong></p>
        </Card>
        <Card>
          <h3>Job Status</h3>
          <p><strong>PO Status:</strong> 
            <select value={quote.po_status} onChange={(e) => updatePoStatus(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.25rem' }}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </p>
          <p><strong>Invoice Status:</strong> <StatusBadge status={quote.invoice_status} /></p>
          {quote.job_id && <p><strong>Linked Job:</strong> <Link href={`/jobs/${quote.job_id}`}>{quote.job_lc_number}</Link></p>}
        </Card>
      </div>

      {/* Scope */}
      {quote.scope_subject && (
        <Card style={{ marginBottom: '1rem' }}>
          <h3>Scope of Work</h3>
          <p>{quote.scope_subject}</p>
        </Card>
      )}

      {/* Items Table */}
      <Card>
        <h3>Quote Items</h3>
        {quote.items?.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>UoM</th><th>Unit Price</th><th>Total Ex VAT</th>
              </tr>
            </thead>
            <tbody>
              {quote.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.item_number}</td>
                  <td>
                    <strong>{item.description}</strong>
                    {item.additional_description && <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.additional_description}</div>}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.unit || '-'}</td>
                  <td>{item.unit_of_measure}</td>
                  <td><CurrencyAmount amount={item.price_ex_vat} /></td>
                  <td style={{ textAlign: 'right' }}><CurrencyAmount amount={item.quantity * item.price_ex_vat} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan="6" style={{ textAlign: 'right' }}>Subtotal:</td><td style={{ textAlign: 'right' }}><CurrencyAmount amount={quote.subtotal} /></td></tr>
              <tr><td colSpan="6" style={{ textAlign: 'right' }}>VAT (15%):</td><td style={{ textAlign: 'right' }}><CurrencyAmount amount={quote.vat_amount} /></td></tr>
              <tr><td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}><CurrencyAmount amount={quote.total_amount} /></td></tr>
            </tfoot>
          </table>
        )}
      </Card>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="modal-overlay" onClick={() => setShowVersionHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>Version History</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th>Version</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {versions.map(v => (
                  <tr key={v.id}>
                    <td>v{v.version}</td>
                    <td>{new Date(v.created_at).toLocaleDateString()}</td>
                    <td><CurrencyAmount amount={v.total_amount} /></td>
                    <td><StatusBadge status={v.status} /></td>
                    <td><Link href={`/quotes/${v.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button onClick={() => setShowVersionHistory(false)} style={{ marginTop: '1rem' }}>Close</Button>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.5rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}