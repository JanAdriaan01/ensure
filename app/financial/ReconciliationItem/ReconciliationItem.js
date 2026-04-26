// components/financial/ReconciliationItem/ReconciliationItem.js
'use client';

import { useState } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function ReconciliationItem({ 
  item,
  onMatch,
  onSkip,
  onAdjust,
  showActions = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [matchingItem, setMatchingItem] = useState(null);
  
  const getStatusIcon = () => {
    switch (item.status) {
      case 'matched': return '✅';
      case 'pending': return '⏳';
      case 'discrepancy': return '⚠️';
      case 'skipped': return '⏭️';
      default: return '📄';
    }
  };
  
  const getStatusColor = () => {
    switch (item.status) {
      case 'matched': return 'success';
      case 'pending': return 'warning';
      case 'discrepancy': return 'danger';
      case 'skipped': return 'secondary';
      default: return 'info';
    }
  };
  
  const handleMatch = () => {
    if (onMatch && matchingItem) {
      onMatch(item.id, matchingItem);
    }
  };
  
  const handleAdjust = () => {
    if (onAdjust && adjustmentAmount) {
      onAdjust(item.id, parseFloat(adjustmentAmount));
      setAdjustmentAmount('');
      setIsExpanded(false);
    }
  };
  
  return (
    <div className={`reconciliation-item ${getStatusColor()}`}>
      <div className="item-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="item-info">
          <span className="status-icon">{getStatusIcon()}</span>
          <div className="item-details">
            <span className="item-reference">{item.reference || `Transaction #${item.id}`}</span>
            <span className="item-date">{item.date}</span>
          </div>
        </div>
        <div className="item-amounts">
          <CurrencyAmount amount={item.amount} className="item-amount" />
          {item.systemAmount && item.systemAmount !== item.amount && (
            <span className="system-amount">
              (Sys: <CurrencyAmount amount={item.systemAmount} />)
            </span>
          )}
          <button className="expand-btn">{isExpanded ? '▼' : '▶'}</button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="item-expanded">
          <div className="details-grid">
            <div className="detail-field">
              <label>Description</label>
              <p>{item.description || 'No description'}</p>
            </div>
            <div className="detail-field">
              <label>Category</label>
              <p>{item.category || 'Uncategorized'}</p>
            </div>
            <div className="detail-field">
              <label>Payment Method</label>
              <p>{item.paymentMethod || 'Not specified'}</p>
            </div>
            <div className="detail-field">
              <label>Status</label>
              <p className={`status-text ${getStatusColor()}`}>
                {item.status || 'Pending'}
              </p>
            </div>
          </div>
          
          {item.discrepancy && (
            <div className="discrepancy-alert">
              <strong>Discrepancy:</strong> {item.discrepancy}
            </div>
          )}
          
          {showActions && item.status !== 'matched' && (
            <div className="action-buttons">
              {item.status === 'discrepancy' && (
                <div className="adjust-section">
                  <input
                    type="number"
                    className="adjust-input"
                    placeholder="Adjustment amount"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                  />
                  <button className="btn-adjust" onClick={handleAdjust}>
                    Adjust
                  </button>
                </div>
              )}
              
              <div className="match-section">
                <select
                  className="match-select"
                  value={matchingItem || ''}
                  onChange={(e) => setMatchingItem(e.target.value)}
                >
                  <option value="">Select matching transaction...</option>
                  {item.possibleMatches?.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.reference} - <CurrencyAmount amount={match.amount} />
                    </option>
                  ))}
                </select>
                <button 
                  className="btn-match" 
                  onClick={handleMatch}
                  disabled={!matchingItem}
                >
                  Match
                </button>
              </div>
              
              <button className="btn-skip" onClick={() => onSkip && onSkip(item.id)}>
                Skip
              </button>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .reconciliation-item {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
          background: white;
          transition: all 0.2s;
        }
        
        .reconciliation-item:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .reconciliation-item.success {
          border-left: 3px solid #10b981;
        }
        
        .reconciliation-item.warning {
          border-left: 3px solid #f59e0b;
        }
        
        .reconciliation-item.danger {
          border-left: 3px solid #ef4444;
        }
        
        .reconciliation-item.info {
          border-left: 3px solid #3b82f6;
        }
        
        .reconciliation-item.secondary {
          border-left: 3px solid #9ca3af;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          user-select: none;
        }
        
        .item-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        
        .status-icon {
          font-size: 1.25rem;
        }
        
        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .item-reference {
          font-weight: 500;
          color: #111827;
        }
        
        .item-date {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .item-amounts {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .item-amount {
          font-weight: 600;
          color: #111827;
        }
        
        .system-amount {
          font-size: 0.75rem;
          color: #ef4444;
        }
        
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 0.75rem;
          padding: 0.25rem;
        }
        
        .item-expanded {
          border-top: 1px solid #e5e7eb;
          padding: 1rem;
          background: #f9fafb;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .detail-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
        }
        
        .detail-field p {
          margin: 0;
          font-size: 0.875rem;
          color: #111827;
        }
        
        .status-text {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-text.success { background: #d1fae5; color: #065f46; }
        .status-text.warning { background: #fed7aa; color: #92400e; }
        .status-text.danger { background: #fee2e2; color: #991b1b; }
        .status-text.info { background: #dbeafe; color: #1e40af; }
        
        .discrepancy-alert {
          background: #fee2e2;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #991b1b;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .adjust-section, .match-section {
          display: flex;
          gap: 0.5rem;
          flex: 1;
        }
        
        .adjust-input, .match-select {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .btn-adjust, .btn-match, .btn-skip {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-adjust {
          background: #f59e0b;
          color: white;
        }
        
        .btn-adjust:hover {
          background: #d97706;
        }
        
        .btn-match {
          background: #10b981;
          color: white;
        }
        
        .btn-match:hover:not(:disabled) {
          background: #059669;
        }
        
        .btn-match:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-skip {
          background: #6b7280;
          color: white;
        }
        
        .btn-skip:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}