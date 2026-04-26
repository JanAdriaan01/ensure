// components/financial/BudgetProgress/BudgetProgress.js
'use client';

import { useState } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function BudgetProgress({ 
  budgeted = 0, 
  actual = 0, 
  committed = 0,
  showDetails = true,
  variant = 'primary',
  onViewDetails 
}) {
  const [expanded, setExpanded] = useState(false);
  
  const totalSpent = actual + committed;
  const percentageUsed = budgeted > 0 ? (totalSpent / budgeted) * 100 : 0;
  const remaining = budgeted - totalSpent;
  const isOverBudget = remaining < 0;
  
  const getVariantColor = () => {
    if (isOverBudget) return 'danger';
    if (percentageUsed >= 90) return 'warning';
    if (percentageUsed >= 70) return 'info';
    return variant;
  };
  
  const variantColor = getVariantColor();
  
  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget';
    if (percentageUsed >= 90) return 'Near Limit';
    if (percentageUsed >= 70) return 'On Track';
    return 'Healthy';
  };
  
  return (
    <div className={`budget-progress ${variantColor}`}>
      <div className="progress-header">
        <h3 className="progress-title">Budget Progress</h3>
        <span className={`status-badge ${variantColor}`}>
          {getStatusText()} ({percentageUsed.toFixed(1)}%)
        </span>
      </div>
      
      <div className="progress-section">
        <div className="progress-bar-container">
          <div 
            className={`progress-fill ${variantColor}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>
      
      {(showDetails || expanded) && (
        <div className="details-section">
          <div className="detail-row">
            <span className="detail-label">Budgeted:</span>
            <CurrencyAmount amount={budgeted} className="detail-value" />
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Actual Spent:</span>
            <CurrencyAmount amount={actual} className="detail-value" />
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Committed (POs):</span>
            <CurrencyAmount amount={committed} className="detail-value" />
          </div>
          
          <div className="detail-row total-row">
            <span className="detail-label">Total Used:</span>
            <CurrencyAmount 
              amount={totalSpent} 
              className={`detail-value ${isOverBudget ? 'over-budget' : ''}`}
            />
          </div>
          
          <div className="detail-row remaining-row">
            <span className="detail-label">Remaining:</span>
            <CurrencyAmount 
              amount={Math.abs(remaining)} 
              className={`detail-value ${isOverBudget ? 'negative' : 'positive'}`}
            />
            {isOverBudget && <span className="negative-sign">(Exceeded)</span>}
          </div>
        </div>
      )}
      
      {onViewDetails && (
        <button 
          className="details-toggle"
          onClick={() => {
            setExpanded(!expanded);
            if (onViewDetails) onViewDetails();
          }}
        >
          {expanded ? 'Show Less' : 'View Details'}
        </button>
      )}
      
      {isOverBudget && (
        <div className="alert-banner alert-danger">
          ⚠️ Budget exceeded by {<CurrencyAmount amount={Math.abs(remaining)} />}
        </div>
      )}
      
      {percentageUsed >= 90 && !isOverBudget && (
        <div className="alert-banner alert-warning">
          ⚠️ Approaching budget limit ({percentageUsed.toFixed(1)}% used)
        </div>
      )}
      
      <style jsx>{`
        .budget-progress {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
          transition: all 0.2s;
        }
        
        .budget-progress:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .progress-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge.primary { background: #dbeafe; color: #1e40af; }
        .status-badge.success { background: #d1fae5; color: #065f46; }
        .status-badge.warning { background: #fed7aa; color: #92400e; }
        .status-badge.danger { background: #fee2e2; color: #991b1b; }
        .status-badge.info { background: #cffafe; color: #155e75; }
        
        .progress-section {
          margin-bottom: 1rem;
        }
        
        .progress-bar-container {
          background: #e5e7eb;
          border-radius: 9999px;
          height: 0.5rem;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 9999px;
        }
        
        .progress-fill.primary { background: #3b82f6; }
        .progress-fill.success { background: #10b981; }
        .progress-fill.warning { background: #f59e0b; }
        .progress-fill.danger { background: #ef4444; }
        .progress-fill.info { background: #06b6d4; }
        
        .details-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
          margin-top: 1rem;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .detail-label {
          color: #6b7280;
        }
        
        .detail-value {
          font-weight: 500;
          color: #111827;
        }
        
        .total-row {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px dashed #e5e7eb;
          font-weight: 600;
        }
        
        .remaining-row {
          margin-top: 0.5rem;
          font-weight: 600;
        }
        
        .positive {
          color: #059669;
        }
        
        .negative {
          color: #dc2626;
        }
        
        .negative-sign {
          margin-left: 0.5rem;
          font-size: 0.75rem;
          color: #dc2626;
        }
        
        .over-budget {
          color: #dc2626;
        }
        
        .details-toggle {
          margin-top: 1rem;
          padding: 0;
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: underline;
        }
        
        .details-toggle:hover {
          color: #2563eb;
        }
        
        .alert-banner {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        
        .alert-danger {
          background: #fee2e2;
          color: #991b1b;
          border-left: 3px solid #dc2626;
        }
        
        .alert-warning {
          background: #fed7aa;
          color: #92400e;
          border-left: 3px solid #f59e0b;
        }
      `}</style>
    </div>
  );
}