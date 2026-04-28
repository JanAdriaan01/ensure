// components/operations/ToolCard/ToolCard.js
'use client';

import { useState } from 'react';
import ToolStatusBadge from '../ToolStatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function ToolCard({ 
  tool, 
  onCheckout, 
  onReturn, 
  onEdit, 
  onDelete,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  const getDueStatus = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'due-soon';
    return null;
  };
  
  const dueStatus = getDueStatus(tool.expectedReturnDate);
  
  return (
    <div className={`tool-card ${compact ? 'compact' : ''}`}>
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="tool-info">
          <span className="tool-icon">🔧</span>
          <div>
            <h4 className="tool-name">{tool.name}</h4>
            <div className="tool-meta">
              <span className="tool-serial">SN: {tool.serialNumber || 'N/A'}</span>
              <span className="tool-category">{tool.category}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <ToolStatusBadge status={tool.status} size="sm" />
          {dueStatus && (
            <span className={`due-badge ${dueStatus}`}>
              {dueStatus === 'overdue' ? '⚠️ Overdue' : '⏰ Due Soon'}
            </span>
          )}
          <button className="expand-btn">{isExpanded ? '▲' : '▼'}</button>
        </div>
      </div>
      
      {(isExpanded || compact) && (
        <div className="card-body">
          {!compact && (
            <>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Model/Brand:</label>
                  <span>{tool.model || tool.brand || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Purchase Date:</label>
                  <span>{formatDate(tool.purchaseDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Purchase Price:</label>
                  <CurrencyAmount amount={tool.purchasePrice} />
                </div>
                <div className="detail-item">
                  <label>Location:</label>
                  <span>{tool.location || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Last Calibration:</label>
                  <span>{formatDate(tool.lastCalibration)}</span>
                </div>
                <div className="detail-item">
                  <label>Next Calibration:</label>
                  <span>{formatDate(tool.nextCalibration)}</span>
                </div>
              </div>
              
              {tool.description && (
                <div className="description">
                  <label>Description:</label>
                  <p>{tool.description}</p>
                </div>
              )}
              
              {tool.status === 'checked-out' && tool.checkedOutTo && (
                <div className="checkout-info">
                  <div className="info-row">
                    <label>Checked out to:</label>
                    <span>{tool.checkedOutTo.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Checked out on:</label>
                    <span>{formatDate(tool.checkedOutDate)}</span>
                  </div>
                  <div className="info-row">
                    <label>Expected return:</label>
                    <span className={dueStatus === 'overdue' ? 'overdue-text' : ''}>
                      {formatDate(tool.expectedReturnDate)}
                    </span>
                  </div>
                  {tool.jobReference && (
                    <div className="info-row">
                      <label>Job Reference:</label>
                      <span>{tool.jobReference}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          <div className="card-actions">
            {tool.status === 'available' && onCheckout && (
              <button className="btn-checkout" onClick={() => onCheckout(tool)}>
                🔄 Check Out
              </button>
            )}
            {tool.status === 'checked-out' && onReturn && (
              <button className="btn-return" onClick={() => onReturn(tool)}>
                ↩️ Check In
              </button>
            )}
            {onEdit && (
              <button className="btn-edit" onClick={() => onEdit(tool)}>
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button className="btn-delete" onClick={() => onDelete(tool)}>
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .tool-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .tool-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .tool-card.compact {
          margin-bottom: 0.5rem;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .card-header:hover {
          background: #f9fafb;
        }
        
        .tool-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        
        .tool-icon {
          font-size: 1.5rem;
        }
        
        .tool-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .tool-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .due-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .due-badge.overdue {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .due-badge.due-soon {
          background: #fed7aa;
          color: #92400e;
        }
        
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 0.75rem;
          padding: 0.25rem;
        }
        
        .card-body {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        
        .detail-item label {
          font-weight: 500;
          color: #6b7280;
        }
        
        .detail-item span {
          color: #111827;
        }
        
        .description {
          margin-bottom: 1rem;
        }
        
        .description label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .description p {
          margin: 0;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .checkout-info {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 0.5rem;
          border-left: 3px solid #f59e0b;
        }
        
        .info-row {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        
        .info-row label {
          font-weight: 500;
          color: #6b7280;
          min-width: 120px;
        }
        
        .overdue-text {
          color: #ef4444;
          font-weight: 600;
        }
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-checkout, .btn-return, .btn-edit, .btn-delete {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-checkout {
          background: #f59e0b;
          color: white;
        }
        
        .btn-checkout:hover {
          background: #d97706;
        }
        
        .btn-return {
          background: #10b981;
          color: white;
        }
        
        .btn-return:hover {
          background: #059669;
        }
        
        .btn-edit {
          background: #3b82f6;
          color: white;
        }
        
        .btn-edit:hover {
          background: #2563eb;
        }
        
        .btn-delete {
          background: #ef4444;
          color: white;
        }
        
        .btn-delete:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}