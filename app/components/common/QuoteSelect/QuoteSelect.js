// app/components/common/QuoteSelect/QuoteSelect.js
'use client';

import { useState, useEffect } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function QuoteSelect({ 
  value, 
  onChange, 
  onQuoteSelect,
  quotes = [],
  loading: externalLoading = false,
  required = false,
  disabled = false,
  placeholder = 'Select a quote...',
  error = '',
  helperText = '',
  className = '',
  fetchQuotes = null,
  filterByStatus = null,
  filterByJobId = null
}) {
  const [internalQuotes, setInternalQuotes] = useState(quotes);
  const [loading, setLoading] = useState(externalLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  
  useEffect(() => {
    if (quotes.length > 0) {
      setInternalQuotes(quotes);
    } else if (fetchQuotes) {
      loadQuotes();
    }
  }, [quotes, fetchQuotes]);
  
  useEffect(() => {
    if (value && internalQuotes.length > 0) {
      const found = internalQuotes.find(q => q.id === value || q.quote_number === value);
      setSelectedQuote(found);
    }
  }, [value, internalQuotes]);
  
  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await fetchQuotes();
      setInternalQuotes(data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredQuotes = internalQuotes
    .filter(quote => !filterByStatus || quote.status === filterByStatus)
    .filter(quote => !filterByJobId || quote.job_id === filterByJobId)
    .filter(quote =>
      (quote.quote_number || quote.id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const handleSelect = (quote) => {
    setSelectedQuote(quote);
    setIsOpen(false);
    setSearchTerm('');
    
    if (onChange) {
      onChange({
        target: {
          name: 'quoteId',
          value: quote.id || quote.quote_number
        }
      });
    }
    
    if (onQuoteSelect) {
      onQuoteSelect(quote);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusColors = {
      'draft': { bg: '#f3f4f6', color: '#374151', text: 'Draft' },
      'sent': { bg: '#dbeafe', color: '#1e40af', text: 'Sent' },
      'approved': { bg: '#d1fae5', color: '#065f46', text: 'Approved' },
      'rejected': { bg: '#fee2e2', color: '#991b1b', text: 'Rejected' },
      'expired': { bg: '#fed7aa', color: '#92400e', text: 'Expired' }
    };
    const config = statusColors[status?.toLowerCase()] || { bg: '#f3f4f6', color: '#374151', text: status || 'Unknown' };
    return <span style={{ background: config.bg, color: config.color, padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontSize: '0.7rem' }}>{config.text}</span>;
  };
  
  return (
    <div className={`quote-select ${className}`}>
      <div className="select-wrapper">
        <div 
          className={`select-trigger ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedQuote ? (
            <div className="selected-value">
              <span className="quote-number">#{selectedQuote.quote_number || selectedQuote.id}</span>
              <span className="quote-title">{selectedQuote.title}</span>
              <CurrencyAmount amount={selectedQuote.total} className="quote-amount" />
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
          <span className="arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="select-dropdown">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search by quote #, title, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="options-list">
              {loading ? (
                <div className="loading-state">Loading quotes...</div>
              ) : filteredQuotes.length === 0 ? (
                <div className="empty-state">No quotes found</div>
              ) : (
                filteredQuotes.map(quote => (
                  <div
                    key={quote.id || quote.quote_number}
                    className={`option-item ${selectedQuote?.id === quote.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(quote)}
                  >
                    <div className="option-header">
                      <span className="option-number">#{quote.quote_number || quote.id}</span>
                      <span className="option-title">{quote.title}</span>
                      {getStatusBadge(quote.status)}
                    </div>
                    <div className="option-details">
                      {quote.client_name && (
                        <span className="option-client">{quote.client_name}</span>
                      )}
                      {quote.total && (
                        <CurrencyAmount amount={quote.total} className="option-amount" />
                      )}
                    </div>
                    {quote.validUntil && (
                      <div className="option-valid">
                        Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {error && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .quote-select {
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .select-wrapper {
          position: relative;
        }
        
        .select-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 42px;
        }
        
        .select-trigger:hover:not(.disabled) {
          border-color: #9ca3af;
        }
        
        .select-trigger.error {
          border-color: #ef4444;
        }
        
        .select-trigger.disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .selected-value {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: baseline;
        }
        
        .quote-number {
          font-weight: 600;
          font-size: 0.875rem;
          color: #3b82f6;
        }
        
        .quote-title {
          font-size: 0.875rem;
          color: #111827;
        }
        
        .quote-amount {
          font-size: 0.875rem;
          font-weight: 500;
          color: #059669;
        }
        
        .placeholder {
          color: #9ca3af;
          font-size: 0.875rem;
        }
        
        .arrow {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 50;
          max-height: 400px;
          overflow: hidden;
        }
        
        .search-input-wrapper {
          padding: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .search-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .options-list {
          max-height: 350px;
          overflow-y: auto;
        }
        
        .loading-state, .empty-state {
          padding: 1rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .option-item {
          padding: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .option-item:hover {
          background: #f3f4f6;
        }
        
        .option-item.selected {
          background: #dbeafe;
        }
        
        .option-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }
        
        .option-number {
          font-weight: 600;
          font-size: 0.875rem;
          color: #3b82f6;
        }
        
        .option-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
        }
        
        .option-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        
        .option-client {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .option-amount {
          font-size: 0.75rem;
          font-weight: 500;
          color: #059669;
        }
        
        .option-valid {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        
        .helper-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .error-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}