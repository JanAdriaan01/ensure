// components/operations/SafetyAlert/SafetyAlert.js
'use client';

import { useState } from 'react';

export default function SafetyAlert({ 
  alert, 
  onAcknowledge, 
  onDismiss,
  onViewDetails,
  autoDismiss = false,
  autoDismissTime = 5000 
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  
  const getSeverityConfig = () => {
    switch (alert.severity?.toLowerCase()) {
      case 'emergency':
        return { label: 'EMERGENCY', color: '#991b1b', bg: '#fee2e2', icon: '🚨', pulse: true };
      case 'critical':
        return { label: 'CRITICAL', color: '#dc2626', bg: '#fef2f2', icon: '⚠️', pulse: true };
      case 'warning':
        return { label: 'WARNING', color: '#f59e0b', bg: '#fed7aa', icon: '⚡', pulse: false };
      case 'info':
        return { label: 'INFO', color: '#3b82f6', bg: '#dbeafe', icon: 'ℹ️', pulse: false };
      default:
        return { label: 'ALERT', color: '#6b7280', bg: '#f3f4f6', icon: '📢', pulse: false };
    }
  };
  
  const config = getSeverityConfig();
  
  const formatDate = (date) => {
    if (!date) return 'Just now';
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return new Date(date).toLocaleDateString();
  };
  
  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    if (onAcknowledge) onAcknowledge(alert);
  };
  
  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss(alert);
  };
  
  if (isDismissed) return null;
  
  return (
    <div className={`safety-alert ${alert.severity?.toLowerCase()} ${config.pulse ? 'pulse' : ''}`}>
      <div className="alert-header">
        <div className="alert-icon" style={{ background: config.bg, color: config.color }}>
          {config.icon}
        </div>
        <div className="alert-content">
          <div className="alert-title">
            <span className="severity" style={{ color: config.color }}>
              {config.label}
            </span>
            <span className="alert-time">{formatDate(alert.timestamp)}</span>
          </div>
          <h4 className="alert-message">{alert.message}</h4>
          {alert.location && (
            <div className="alert-location">📍 {alert.location}</div>
          )}
          {alert.actionRequired && !isAcknowledged && (
            <div className="action-required">
              ⚡ Action Required: {alert.actionRequired}
            </div>
          )}
        </div>
        <div className="alert-actions">
          {alert.actionRequired && !isAcknowledged && (
            <button className="btn-acknowledge" onClick={handleAcknowledge}>
              Acknowledge
            </button>
          )}
          {onViewDetails && (
            <button className="btn-details" onClick={() => onViewDetails(alert)}>
              Details
            </button>
          )}
          <button className="btn-dismiss" onClick={handleDismiss}>
            ✕
          </button>
        </div>
      </div>
      
      {isAcknowledged && (
        <div className="acknowledgment">
          ✓ Acknowledged by {alert.acknowledgedBy || 'You'}
        </div>
      )}
      
      <style jsx>{`
        .safety-alert {
          margin-bottom: 1rem;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .safety-alert.pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
        
        .alert-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-left: 4px solid ${config.color};
        }
        
        .safety-alert.emergency .alert-header,
        .safety-alert.critical .alert-header {
          background: #fef2f2;
        }
        
        .safety-alert.warning .alert-header {
          background: #fffbeb;
        }
        
        .alert-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .alert-content {
          flex: 1;
        }
        
        .alert-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .severity {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .alert-time {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .alert-message {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #111827;
        }
        
        .alert-location {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        
        .action-required {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #fee2e2;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          color: #991b1b;
          font-weight: 500;
        }
        
        .alert-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        
        .btn-acknowledge, .btn-details, .btn-dismiss {
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-acknowledge {
          background: #ef4444;
          color: white;
        }
        
        .btn-acknowledge:hover {
          background: #dc2626;
        }
        
        .btn-details {
          background: #3b82f6;
          color: white;
        }
        
        .btn-details:hover {
          background: #2563eb;
        }
        
        .btn-dismiss {
          background: transparent;
          color: #6b7280;
          font-size: 1rem;
          padding: 0.375rem 0.5rem;
        }
        
        .btn-dismiss:hover {
          background: #f3f4f6;
        }
        
        .acknowledgment {
          padding: 0.5rem 1rem;
          background: #d1fae5;
          color: #065f46;
          font-size: 0.75rem;
          text-align: center;
          border-top: 1px solid #a7f3d0;
        }
        
        @media (max-width: 768px) {
          .alert-header {
            flex-direction: column;
          }
          
          .alert-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}