// components/hr/CertificationCard/CertificationCard.js
'use client';

import { useState } from 'react';
import CertificationBadge from '../CertificationBadge';

export default function CertificationCard({ 
  certification, 
  onEdit, 
  onDelete, 
  onRenew,
  showActions = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  return (
    <div className="certification-card">
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <CertificationBadge 
          certification={certification} 
          size="lg"
          showDetails={false}
        />
        <button className="expand-btn">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="card-body">
          <div className="details-grid">
            <div className="detail-group">
              <label>Description</label>
              <p>{certification.description || 'No description provided'}</p>
            </div>
            
            <div className="detail-group">
              <label>Skills Covered</label>
              <div className="skills-list">
                {certification.skills?.map((skill, idx) => (
                  <span key={idx} className="skill-pill">{skill}</span>
                )) || <span className="no-data">No skills listed</span>}
              </div>
            </div>
            
            {certification.attachments?.length > 0 && (
              <div className="detail-group">
                <label>Attachments</label>
                <div className="attachments-list">
                  {certification.attachments.map((file, idx) => (
                    <a key={idx} href={file.url} className="attachment-link">
                      📎 {file.name} ({formatFileSize(file.size)})
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="detail-group">
              <label>Additional Info</label>
              <div className="info-row">
                <span className="info-label">Grade/Score:</span>
                <span>{certification.grade || 'Not specified'}</span>
              </div>
              {certification.verificationUrl && (
                <div className="info-row">
                  <span className="info-label">Verification:</span>
                  <a href={certification.verificationUrl} target="_blank" rel="noopener noreferrer">
                    Verify Online →
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="card-actions">
              {onRenew && certification.expiryDate && (
                <button className="btn-renew" onClick={() => onRenew(certification)}>
                  🔄 Renew Certification
                </button>
              )}
              {onEdit && (
                <button className="btn-edit" onClick={() => onEdit(certification)}>
                  ✏️ Edit
                </button>
              )}
              {onDelete && (
                <button className="btn-delete" onClick={() => onDelete(certification)}>
                  🗑️ Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .certification-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .certification-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          background: #f9fafb;
        }
        
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
        }
        
        .card-body {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .details-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .detail-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        
        .detail-group p {
          margin: 0;
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.5;
        }
        
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .skill-pill {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: #374151;
        }
        
        .attachments-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .attachment-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #3b82f6;
          text-decoration: none;
        }
        
        .attachment-link:hover {
          text-decoration: underline;
        }
        
        .info-row {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        
        .info-label {
          color: #6b7280;
          min-width: 100px;
        }
        
        .no-data {
          font-size: 0.875rem;
          color: #9ca3af;
          font-style: italic;
        }
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-renew, .btn-edit, .btn-delete {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-renew {
          background: #f59e0b;
          color: white;
        }
        
        .btn-renew:hover {
          background: #d97706;
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