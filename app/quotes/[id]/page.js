// app/quotes/[id]/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [quote, setQuote] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef(null);

  const quoteId = params.id;

  useEffect(() => {
    if (isAuthenticated && token && quoteId) {
      fetchQuote();
      fetchCompanySettings();
    }
  }, [isAuthenticated, token, quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/${quoteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 404) {
        setError('Quote not found');
        return;
      }
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch('/api/settings/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setCompany(result.data);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quote ${quote?.quote_number}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.5;
              color: #1e293b;
              margin: 0;
              padding: 0;
            }
            .print-container {
              max-width: 100%;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 2px solid #3b82f6;
            }
            .company-info h1 {
              margin: 0 0 0.25rem 0;
              font-size: 1.5rem;
              color: #1e293b;
            }
            .company-info p {
              margin: 0;
              font-size: 0.75rem;
              color: #64748b;
            }
            .company-logo {
              max-height: 60px;
              max-width: 200px;
              margin-bottom: 0.5rem;
              object-fit: contain;
            }
            .quote-title {
              text-align: right;
            }
            .quote-title h2 {
              margin: 0;
              font-size: 1.25rem;
              color: #3b82f6;
            }
            .quote-title p {
              margin: 0.25rem 0 0;
              font-size: 0.75rem;
              color: #64748b;
            }
            .client-section, .quote-details-section {
              margin-bottom: 1.5rem;
            }
            .section-title {
              font-size: 1rem;
              font-weight: 600;
              margin-bottom: 0.75rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid #e2e8f0;
              color: #1e293b;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.75rem;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-size: 0.7rem;
              color: #64748b;
              text-transform: uppercase;
            }
            .info-value {
              font-size: 0.875rem;
              font-weight: 500;
              color: #1e293b;
            }
            .scope-section {
              margin-bottom: 1.5rem;
            }
            .scope-text {
              background: #f8fafc;
              padding: 1rem;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              white-space: pre-wrap;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1.5rem;
            }
            th, td {
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            th {
              background: #f8fafc;
              font-weight: 600;
              font-size: 0.75rem;
              color: #64748b;
            }
            .amount-column {
              text-align: right;
            }
            .totals {
              max-width: 300px;
              margin-left: auto;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 0.5rem 0;
              font-size: 0.875rem;
            }
            .grand-total {
              font-weight: 700;
              font-size: 1rem;
              border-top: 1px solid #e2e8f0;
              margin-top: 0.5rem;
              padding-top: 0.75rem;
              color: #1e293b;
            }
            .notes-section {
              margin-top: 1.5rem;
              padding: 1rem;
              background: #f8fafc;
              border-radius: 0.5rem;
              font-size: 0.875rem;
            }
            .footer {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 0.7rem;
              color: #94a3b8;
            }
            @media print {
              body {
                background: white;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 2 
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'po_received': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'sent': return 'status-sent';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quote...</p>
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

  if (error || !quote) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Quote Not Found</h1>
          <p>The quote you're looking for doesn't exist or has been removed.</p>
        </div>
        <Link href="/quotes" className="btn-primary">Back to Quotes</Link>
      </div>
    );
  }

  return (
    <div className="quote-detail-container">
      <div className="page-header">
        <div>
          <Link href="/quotes" className="back-link">← Back to Quotes</Link>
          <h1>Quote {quote.quote_number}</h1>
          <p>Created on {formatDate(quote.created_at)}</p>
        </div>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn-print">
            🖨️ Print / PDF
          </button>
          <span className={`status-badge ${getStatusClass(quote.status)}`}>
            {quote.status?.toUpperCase() || 'DRAFT'}
          </span>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="printable-content">
        {/* Header with Company and Quote Info */}
        <div className="print-header">
          <div className="company-info">
            {/* FIXED: Use logo_data instead of logo_url */}
            {company?.logo_data && (
              <img 
                src={company.logo_data} 
                alt="Company Logo" 
                className="company-logo"
                style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain' }}
              />
            )}
            <h1>{company?.company_name || 'ENSURE System'}</h1>
            <p>{company?.address_line1 || ''}</p>
            {company?.address_line2 && <p>{company.address_line2}</p>}
            <p>{[company?.city, company?.postal_code].filter(Boolean).join(', ')}</p>
            {company?.country && <p>{company.country}</p>}
            <p>Tel: {company?.phone || ''}</p>
            <p>Email: {company?.email || ''}</p>
            <p>VAT: {company?.vat_number || ''}</p>
            <p>Reg: {company?.registration_number || ''}</p>
          </div>
          <div className="quote-title">
            <h2>QUOTATION</h2>
            <p>Quote #: {quote.quote_number}</p>
            <p>Date: {formatDate(quote.quote_date || quote.created_at)}</p>
            <p>Status: {quote.status?.toUpperCase() || 'DRAFT'}</p>
            {quote.po_number && <p>PO #: {quote.po_number}</p>}
          </div>
        </div>

        {/* Client Information */}
        <div className="client-section">
          <h3 className="section-title">Bill To</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Client Name</span>
              <span className="info-value">{quote.client_name || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Site Name</span>
              <span className="info-value">{quote.site_name || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Contact Person</span>
              <span className="info-value">{quote.contact_person || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Prepared By</span>
              <span className="info-value">{quote.quote_prepared_by || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        {quote.scope_subject && (
          <div className="scope-section">
            <h3 className="section-title">Scope of Work</h3>
            <div className="scope-text">{quote.scope_subject}</div>
          </div>
        )}

        {/* Quote Items Table */}
        {quote.items && quote.items.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="amount-column">Quantity</th>
                <th className="amount-column">Unit Price</th>
                <th className="amount-column">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td className="amount-column">{item.quantity || 1}</td>
                  <td className="amount-column">{formatCurrency(item.unit_price)}</td>
                  <td className="amount-column">{formatCurrency((item.quantity || 1) * (item.unit_price || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Totals */}
        <div className="totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>VAT ({quote.vat_rate || 15}%):</span>
            <span>{formatCurrency(quote.vat_amount)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total:</span>
            <span>{formatCurrency(quote.total_amount)}</span>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="notes-section">
            <strong>Notes:</strong>
            <p>{quote.notes}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="notes-section">
          <strong>Terms & Conditions:</strong>
          <p>Payment is due within 30 days of invoice date.</p>
          <p>All prices include VAT where applicable.</p>
          <p>This quotation is valid for 30 days from the date of issue.</p>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your business!</p>
          <p>{company?.company_name || 'ENSURE System'} - {company?.email || ''}</p>
        </div>
      </div>

      <style jsx>{`
        .quote-detail-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .back-link {
          color: #64748b;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .back-link:hover {
          color: #3b82f6;
        }

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .page-header p {
          color: #64748b;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn-print {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-print:hover {
          background: #2563eb;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-rejected {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-sent {
          background: #dbeafe;
          color: #1e40af;
        }

        /* Printable Content Styles */
        .printable-content {
          background: white;
          border-radius: 0.75rem;
          padding: 2rem;
          margin-top: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #3b82f6;
        }

        .company-info {
          flex: 1;
        }

        .company-info h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          color: #1e293b;
        }

        .company-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .company-logo {
          max-height: 60px;
          max-width: 200px;
          margin-bottom: 0.5rem;
          object-fit: contain;
        }

        .quote-title {
          text-align: right;
        }

        .quote-title h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #3b82f6;
        }

        .quote-title p {
          margin: 0.25rem 0 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .client-section, .scope-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        .scope-text {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          white-space: pre-wrap;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }

        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          color: #64748b;
        }

        .amount-column {
          text-align: right;
        }

        .totals {
          max-width: 300px;
          margin-left: auto;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
        }

        .grand-total {
          font-weight: 700;
          font-size: 1rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          color: #1e293b;
        }

        .notes-section {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 0.7rem;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .quote-detail-container {
            padding: 1rem;
          }
          .print-header {
            flex-direction: column;
            gap: 1rem;
          }
          .quote-title {
            text-align: left;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}