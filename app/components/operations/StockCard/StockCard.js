// components/operations/StockCard/StockCard.js
'use client';

import { useState } from 'react';
import StockStatusBadge from '../StockStatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function StockCard({ 
  item, 
  onReorder, 
  onEdit, 
  onDelete,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStockLevelClass = () => {
    const percentage = (item.quantity / item.reorderPoint) * 100;
    if (item.quantity === 0) return 'critical';
    if (item.quantity <= item.reorderPoint) return 'low';
    if (item.quantity <= item.reorderPoint * 2) return 'medium';
    return 'good';
  };
  
  const stockLevelClass = getStockLevelClass();
  
  return (
    <div className={`stock-card ${compact ? 'compact' : ''}`}>
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="item-info">
          <span className="item-icon">📦</span>
          <div>
            <h4 className="item-name">{item.name}</h4>
            <div className="item-meta">
              <span className="item-sku">SKU: {item.sku || 'N/A'}</span>
              <span className="item-category">{item.category}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="quantity-display">
            <span className="quantity">{item.quantity}</span>
            <span className="unit">{item.unit || 'units'}</span>
          </div>
          <StockStatusBadge status={item.status} size="sm" />
          <button className="expand-btn">{isExpanded ? '▲' : '▼'}</button>
        </div>
      </div>
      
      {(isExpanded || compact) && (
        <div className="card-body">
          {!compact && (
            <>
              <div className="stock-indicator">
                <div className="stock-bar">
                  <div 
                    className={`stock-fill ${stockLevelClass}`}
                    style={{ width: `${Math.min((item.quantity / item.reorderPoint) * 100, 100)}%` }}
                  />
                </div>
                <div className="stock-levels">
                  <span>Current: {item.quantity}</span>
                  <span>Reorder at: {item.reorderPoint}</span>
                  <span>Max: {item.maxStock || 'N/A'}</span>
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <label>Location:</label>
                  <span>{item.location || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Unit Cost:</label>
                  <CurrencyAmount amount={item.unitCost} />
                </div>
                <div className="detail-item">
                  <label>Total Value:</label>
                  <CurrencyAmount amount={(item.unitCost || 0) * (item.quantity || 0)} />
                </div>
                <div className="detail-item">
                  <label>Supplier:</label>
                  <span>{item.supplier || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Last Ordered:</label>
                  <span>{item.lastOrdered ? new Date(item.lastOrdered).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              
              {item.description && (
                <div className="description">
                  <p>{item.description}</p>
                </div>
              )}
            </>
          )}
          
          <div className="card-actions">
            {item.quantity <= item.reorderPoint && onReorder && (
              <button className="btn-reorder" onClick={() => onReorder(item)}>
                📦 Reorder
              </button>
            )}
            {onEdit && (
              <button className="btn-edit" onClick={() => onEdit(item)}>
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button className="btn-delete" onClick={() => onDelete(item)}>
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .stock-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .stock-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
        
        .item-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        
        .item-icon {
          font-size: 1.5rem;
        }
        
        .item-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .item-meta {
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
        
        .quantity-display {
          text-align: center;
        }
        
        .quantity {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
        }
        
        .unit {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 0.25rem;
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
        
        .stock-indicator {
          margin-bottom: 1rem;
        }
        
        .stock-bar {
          background: #e5e7eb;
          border-radius: 0.25rem;
          height: 0.5rem;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .stock-fill {
          height: 100%;
          transition: width 0.3s;
        }
        
        .stock-fill.good { background: #10b981; }
        .stock-fill.medium { background: #f59e0b; }
        .stock-fill.low { background: #ef4444; }
        .stock-fill.critical { background: #991b1b; }
        
        .stock-levels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
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
        
        .description {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-reorder, .btn-edit, .btn-delete {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-reorder {
          background: #3b82f6;
          color: white;
        }
        
        .btn-reorder:hover {
          background: #2563eb;
        }
        
        .btn-edit {
          background: #6b7280;
          color: white;
        }
        
        .btn-edit:hover {
          background: #4b5563;
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