// components/operations/OHSIncidentCard/OHSIncidentCard.js
'use client';

import { useState } from 'react';

export default function OHSIncidentCard({ 
  incident, 
  onViewDetails, 
  onEdit, 
  onGenerateReport,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getSeverityConfig = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return { label: 'Critical', color: '#991b1b', bg: '#fee2e2', icon: '🔴' };
      case 'major':
        return { label: 'Major', color: '#dc2626', bg: '#fef2f2', icon: '🟠' };
      case 'moderate':
        return { label: 'Moderate', color: '#f59e0b', bg: '#fed7aa', icon: '🟡' };
      case 'minor':
        return { label: 'Minor', color: '#10b981', bg: '#d1fae5', icon: '🟢' };
      default:
        return { label: 'Unknown', color: '#6b7280', bg: '#f3f4f6', icon: '⚪' };
    }
  };
  
  const getTypeIcon = (type) => {
    const icons = {
      'injury': '🤕',
      'near-miss': '⚠️',
      'property-damage': '🏗️',
      'environmental': '🌍',
      'vehicle': '🚗',
      'fire': '🔥',
      'chemical': '🧪'
    };
    return icons[type?.toLowerCase()] || '📋';
  };
  
  const severity = getSeverityConfig(incident.severity);
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className={`incident-card ${severity.label.toLowerCase()}`}>
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="incident-info">
          <span className="incident-icon">{getTypeIcon(incident.type)}</span>
          <div>
            <h4 className="incident-title">
              {incident.type}: {incident.title}
            </h4>
            <div className="incident-meta">
              <span className="incident-id">#{incident.number}</span>
              <span className="incident-date">{formatDate(incident.date)}</span>
              <span className="incident-location">{incident.location}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span className="severity-badge" style={{ background: severity.bg, color: severity.color }}>
            {severity.icon} {severity.label}
          </span>
          {!incident.resolved && (
            <span className="open-badge">Open</span>
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
                  <label>Reported By:</label>
                  <span>{incident.reportedBy}</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{incident.department}</span>
                </div>
                <div className="detail-item">
                  <label>Investigator:</label>
                  <span>{incident.investigator || 'Not assigned'}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span>{incident.resolved ? 'Resolved' : 'Under Investigation'}</span>
                </div>
              </div>
              
              {incident.description && (
                <div className="description">
                  <label>Description:</label>
                  <p>{incident.description}</p>
                </div>
              )}
              
              {incident.cause && (
                <div className="cause-section">
                  <label>Root Cause:</label>
                  <p>{incident.cause}</p>
                </div>
              )}
              
              {incident.actionTaken && (
                <div className="actions-section">
                  <label>Actions Taken:</label>
                  <p>{incident.actionTaken}</p>
                </div>
              )}
              
              {incident.injuredPersons?.length > 0 && (
                <div className="injured-section">
                  <label>Injured Persons ({incident.injuredPersons.length})</label>
                  <div className="injured-list">
                    {incident.injuredPersons.map((person, idx) => (
                      <div key={idx} className="injured-item">
                        <span>{person.name}</span>
                        <span>{person.injury}</span>
                        <span>{person.treatment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {incident.resolvedDate && (
                <div className="resolution-section">
                  <label>Resolution Date:</label>
                  <span>{formatDate(incident.resolvedDate)}</span>
                </div>
              )}
            </>
          )}
          
          <div className="card-actions">
            {onGenerateReport && (
              <button className="btn-report" onClick={() => onGenerateReport(incident)}>
                📄 Generate Report
              </button>
            )}
            {onViewDetails && (
              <button className="btn-view" onClick={() => onViewDetails(incident)}>
                View Details
              </button>
            )}
            {onEdit && (
              <button className="btn-edit" onClick={() => onEdit(incident)}>
                Edit
              </button>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .incident-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .incident-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .incident-card.critical {
          border-left: 3px solid #991b1b;
        }
        
        .incident-card.major {
          border-left: 3px solid #dc2626;
        }
        
        .incident-card.moderate {
          border-left: 3px solid #f59e0b;
        }
        
        .incident-card.minor {
          border-left: 3px solid #10b981;
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
        
        .incident-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        
        .incident-icon {
          font-size: 1.5rem;
        }
        
        .incident-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .incident-meta {
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
        
        .severity-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .open-badge {
          padding: 0.25rem 0.5rem;
          background: #fee2e2;
          color: #991b1b;
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
        
        .description, .cause-section, .actions-section, .injured-section, .resolution-section {
          margin-bottom: 1rem;
        }
        
        .description label, .cause-section label, .actions-section label, .injured-section label, .resolution-section label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        
        .description p, .cause-section p, .actions-section p {
          margin: 0;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .injured-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .injured-item {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
          padding: 0.5rem;
          background: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-report, .btn-view, .btn-edit {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-report {
          background: #8b5cf6;
          color: white;
        }
        
        .btn-report:hover {
          background: #7c3aed;
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