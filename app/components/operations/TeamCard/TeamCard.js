// components/operations/TeamCard/TeamCard.js
'use client';

import { useState } from 'react';

export default function TeamCard({ 
  team, 
  onViewDetails, 
  onEdit, 
  onAssign,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTeamIcon = (type) => {
    const icons = {
      'crew': '👥',
      'maintenance': '🔧',
      'installation': '🏗️',
      'repair': '🛠️',
      'inspection': '🔍',
      'safety': '🛡️'
    };
    return icons[type?.toLowerCase()] || '👥';
  };
  
  return (
    <div className={`team-card ${compact ? 'compact' : ''}`}>
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="team-info">
          <span className="team-icon">{getTeamIcon(team.type)}</span>
          <div>
            <h4 className="team-name">{team.name}</h4>
            <div className="team-meta">
              <span className="team-type">{team.type}</span>
              <span className="team-lead">Lead: {team.teamLead || 'Not assigned'}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="member-count">
            <span className="count">{team.members?.length || 0}</span>
            <span className="label">members</span>
          </div>
          <span className={`status-badge ${team.status === 'active' ? 'active' : 'inactive'}`}>
            {team.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
          </span>
          <button className="expand-btn">{isExpanded ? '▲' : '▼'}</button>
        </div>
      </div>
      
      {(isExpanded || compact) && (
        <div className="card-body">
          {!compact && (
            <>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{team.department || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Shift:</label>
                  <span>{team.shift || 'Day Shift'}</span>
                </div>
                <div className="detail-item">
                  <label>Location:</label>
                  <span>{team.location || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Certifications Required:</label>
                  <span>{team.certifications?.length || 0}</span>
                </div>
              </div>
              
              {team.description && (
                <div className="description">
                  <p>{team.description}</p>
                </div>
              )}
              
              <div className="members-section">
                <label>Team Members ({team.members?.length || 0})</label>
                <div className="members-list">
                  {team.members?.map((member, idx) => (
                    <div key={idx} className="member-item">
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">{member.role}</span>
                      <span className={`member-status ${member.status}`}>
                        {member.status === 'available' ? '🟢' : '🟡'}
                      </span>
                    </div>
                  ))}
                  {(!team.members || team.members.length === 0) && (
                    <div className="no-members">No members assigned</div>
                  )}
                </div>
              </div>
              
              {team.currentAssignments?.length > 0 && (
                <div className="assignments-section">
                  <label>Current Assignments</label>
                  <div className="assignments-list">
                    {team.currentAssignments.map((assignment, idx) => (
                      <div key={idx} className="assignment-item">
                        <span>{assignment.workOrder}</span>
                        <span className="assignment-status">{assignment.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="card-actions">
            {onAssign && (
              <button className="btn-assign" onClick={() => onAssign(team)}>
                👥 Assign Members
              </button>
            )}
            {onViewDetails && (
              <button className="btn-view" onClick={() => onViewDetails(team)}>
                View Details
              </button>
            )}
            {onEdit && (
              <button className="btn-edit" onClick={() => onEdit(team)}>
                Edit
              </button>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .team-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .team-card:hover {
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
        
        .team-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        
        .team-icon {
          font-size: 1.5rem;
        }
        
        .team-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .team-meta {
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
        
        .member-count {
          text-align: center;
        }
        
        .count {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
        }
        
        .label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 0.25rem;
        }
        
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.inactive {
          background: #f3f4f6;
          color: #374151;
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
        
        .description {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .members-section, .assignments-section {
          margin-bottom: 1rem;
        }
        
        .members-section label, .assignments-section label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        
        .members-list, .assignments-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .member-item, .assignment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .member-name {
          font-weight: 500;
          color: #111827;
        }
        
        .member-role {
          color: #6b7280;
          font-size: 0.75rem;
        }
        
        .assignment-status {
          padding: 0.25rem 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 0.375rem;
          font-size: 0.75rem;
        }
        
        .no-members {
          padding: 0.5rem;
          text-align: center;
          color: #9ca3af;
          font-size: 0.875rem;
        }
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-assign, .btn-view, .btn-edit {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-assign {
          background: #8b5cf6;
          color: white;
        }
        
        .btn-assign:hover {
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