// components/operations/WorkOrderCard/WorkOrderCard.js
'use client';

import { useState } from 'react';
import WorkOrderStatusBadge from '../WorkOrderStatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function WorkOrderCard({ 
  workOrder, 
  onViewDetails, 
  onEdit, 
  onUpdateStatus,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { label: 'High', color: '#ef4444', bg: '#fee2e2' };
      case 'medium':
        return { label: 'Medium', color: '#f59e0b', bg: '#fed7aa' };
      case 'low':
        return { label: 'Low', color: '#10b981', bg: '#d1fae5' };
      default:
        return { label: 'Normal', color: '#6b7280', bg: '#f3f4f6' };
    }
  };
  
  const priority = getPriorityConfig(workOrder.priority);
  
  return (
    <div className={`workorder-card ${compact ? 'compact' : ''}`}>
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="order-info">
          <span className="order-icon">🔧</span>
          <div>
            <h4 className="order-title">
              #{workOrder.number} - {workOrder.title}
            </h4>
            <div className="order-meta">
              <span className="order-type">{workOrder.type}</span>
              <span className="order-location">{workOrder.location}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span className={`priority-badge`} style={{ background: priority.bg, color: priority.color }}>
            {priority.label} Priority
          </span>
          <WorkOrderStatusBadge status={workOrder.status} size="sm" />
          <button className="expand-btn">{isExpanded ? '▲' : '▼'}</button>
        </div>
      </div>
      
      {(isExpanded || compact) && (
        <div className="card-body">
          {!compact && (
            <>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Assigned To:</label>
                  <span>{workOrder.assignedTo || 'Unassigned'}</span>
                </div>
                <div className="detail-item">
                  <label>Start Date:</label>
                  <span>{formatDate(workOrder.startDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Due Date:</label>
                  <span className={new Date(workOrder.dueDate) < new Date() && workOrder.status !== 'completed' ? 'overdue' : ''}>
                    {formatDate(workOrder.dueDate)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Estimated Hours:</label>
                  <span>{workOrder.estimatedHours} hrs</span>
                </div>
                <div className="detail-item">
                  <label>Actual Hours:</label>
                  <span>{workOrder.actualHours || 0} hrs</span>
                </div>
                <div className="detail-item">
                  <label>Cost:</label>
                  <CurrencyAmount amount={workOrder.cost} />
                </div>
              </div>
              
              {workOrder.description && (
                <div className="description">
                  <label>Description:</label>
                  <p>{workOrder.description}</p>
                </div>
              )}
              
              {workOrder.materials?.length > 0 && (
                <div className="materials-section">
                  <label>Materials Required:</label>
                  <div className="materials-list">
                    {workOrder.materials.map((material, idx) => (
                      <div key={idx} className="material-item">
                        <span>{material.name}</span>
                        <span>{material.quantity} {material.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="card-actions">
            {onUpdateStatus && workOrder.status !== 'completed' && (
              <select 
                className="status-select"
                value={workOrder.status}
                onChange={(e) => onUpdateStatus(workOrder, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            )}
            {onViewDetails && (
              <button className="btn-view" onClick={() => onViewDetails(workOrder)}>
                View Details
              </button>
            )}
            {onEdit && (
              <button className="btn-edit" onClick={() => onEdit(workOrder)}>
                Edit
              </button>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .workorder-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .workorder-card:hover {
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
        
        .order-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        
        .order-icon {
          font-size: 1.5rem;
        }
        
        .order-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .order-meta {
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
        
        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
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
        
        .overdue {
          color: #ef4444;
          font-weight: 600;
        }
        
        .description, .materials-section {
          margin-bottom: 1rem;
        }
        
        .description label, .materials-section label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        
        .description p {
          margin: 0;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .materials-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .material-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: white;
          border-radius: 0.375rem;
        }
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .status-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }
        
        .btn-view, .btn-edit {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-view {
          background: #3b82f6;
          color: white;
        }
        
        .btn-view:hover {
          background: #2563eb;
        }
        
        .btn-edit {
          background: #6b7280;
          color: white;
        }
        
        .btn-edit:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}