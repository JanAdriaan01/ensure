// components/hr/LeaveRequestCard/LeaveRequestCard.js
'use client';

import { useState } from 'react';

export default function LeaveRequestCard({ 
  request, 
  onApprove, 
  onReject, 
  onCancel,
  isManager = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusConfig = () => {
    switch (request.status?.toLowerCase()) {
      case 'approved':
        return { label: 'Approved', color: '#10b981', bg: '#d1fae5', icon: '✓' };
      case 'pending':
        return { label: 'Pending', color: '#f59e0b', bg: '#fed7aa', icon: '⏳' };
      case 'rejected':
        return { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: '❌' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#6b7280', bg: '#f3f4f6', icon: '✗' };
      default:
        return { label: 'Pending', color: '#f59e0b', bg: '#fed7aa', icon: '⏳' };
    }
  };
  
  const status = getStatusConfig();
  
  const getLeaveTypeIcon = (type) => {
    const icons = {
      'Annual Leave': '🌴',
      'Sick Leave': '🤒',
      'Personal Leave': '🏠',
      'Maternity Leave': '👶',
      'Paternity Leave': '👶',
      'Bereavement': '💔',
      'Unpaid Leave': '💰'
    };
    return icons[type] || '📅';
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };
  
  return (
    <div className="leave-request-card">
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <span className="leave-icon">{getLeaveTypeIcon(request.leaveType)}</span>
          <div className="leave-info">
            <h4 className="leave-title">{request.leaveType}</h4>
            <div className="leave-dates">
              {formatDate(request.startDate)} - {formatDate(request.endDate)}
            </div>
          </div>
        </div>
        <div className="header-right">
          <span className="duration">{calculateDuration(request.startDate, request.endDate)}</span>
          <span className="status-badge" style={{ background: status.bg, color: status.color }}>
            {status.icon} {status.label}
          </span>
          <button className="expand-btn">{isExpanded ? '▲' : '▼'}</button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="card-body">
          <div className="details-grid">
            <div className="detail-item">
              <label>Employee:</label>
              <span>{request.employeeName}</span>
            </div>
            <div className="detail-item">
              <label>Department:</label>
              <span>{request.department}</span>
            </div>
            <div className="detail-item">
              <label>Submitted:</label>
              <span>{formatDate(request.submittedDate)}</span>
            </div>
            <div className="detail-item">
              <label>Reason:</label>
              <span className="reason-text">{request.reason || 'Not specified'}</span>
            </div>
          </div>
          
          {request.attachment && (
            <div className="attachment">
              <a href={request.attachment.url} target="_blank" rel="noopener noreferrer">
                📎 {request.attachment.name}
              </a>
            </div>
          )}
          
          {request.approvedBy && (
            <div className="approval-info">
              <div className="approval-item">
                <label>Approved by:</label>
                <span>{request.approvedBy}</span>
              </div>
              <div className="approval-item">
                <label>Approved on:</label>
                <span>{formatDate(request.approvedDate)}</span>
              </div>
              {request.comments && (
                <div className="approval-item">
                  <label>Comments:</label>
                  <span>{request.comments}</span>
                </div>
              )}
            </div>
          )}
          
          {request.status === 'pending' && (
            <div className="action-buttons">
              {isManager ? (
                <>
                  <button className="btn-approve" onClick={() => onApprove(request)}>
                    ✓ Approve
                  </button>
                  <button className="btn-reject" onClick={() => onReject(request)}>
                    ✗ Reject
                  </button>
                </>
              ) : (
                <button className="btn-cancel" onClick={() => onCancel(request)}>
                  Cancel Request
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .leave-request-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .leave-request-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .leave-icon {
          font-size: 1.5rem;
        }
        
        .leave-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .leave-dates {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .duration {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
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
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .detail-item label {
          font-weight: 500;
          color: #6b7280;
          min-width: 80px;
        }
        
        .detail-item span {
          color: #111827;
        }
        
        .reason-text {
          flex: 1;
        }
        
        .attachment {
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: white;
          border-radius: 0.375rem;
        }
        
        .attachment a {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.875rem;
        }
        
        .attachment a:hover {
          text-decoration: underline;
        }
        
        .approval-info {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 0.375rem;
          border-left: 3px solid #10b981;
        }
        
        .approval-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        
        .approval-item label {
          font-weight: 500;
          color: #6b7280;
          min-width: 100px;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-approve, .btn-reject, .btn-cancel {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-approve {
          background: #10b981;
          color: white;
        }
        
        .btn-approve:hover {
          background: #059669;
        }
        
        .btn-reject {
          background: #ef4444;
          color: white;
        }
        
        .btn-reject:hover {
          background: #dc2626;
        }
        
        .btn-cancel {
          background: #6b7280;
          color: white;
        }
        
        .btn-cancel:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}