// components/hr/EmployeeCard/EmployeeCard.js
'use client';

import { useState } from 'react';
import EmployeeStatusBadge from '../EmployeeStatusBadge';
import SkillTag from '../SkillTag';

export default function EmployeeCard({ 
  employee, 
  onViewDetails, 
  onEdit, 
  onDelete,
  showActions = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  const calculateTenure = (startDate) => {
    if (!startDate) return 'N/A';
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    
    if (years > 0) return `${years} yr${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    return 'Just started';
  };
  
  return (
    <div className="employee-card">
      <div className="card-header">
        <div className="employee-info">
          <div className="employee-avatar">
            {employee.avatar ? (
              <img src={employee.avatar} alt={employee.name} />
            ) : (
              <div className="avatar-placeholder">
                {employee.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="employee-details">
            <h4 className="employee-name">{employee.name}</h4>
            <div className="employee-meta">
              <span className="employee-role">{employee.role || employee.position}</span>
              <span className="employee-id">ID: {employee.employeeId || employee.id}</span>
            </div>
          </div>
        </div>
        <div className="card-actions-header">
          <EmployeeStatusBadge status={employee.status} size="sm" />
          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">Department</span>
          <span className="stat-value">{employee.department || 'Unassigned'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Tenure</span>
          <span className="stat-value">{calculateTenure(employee.startDate)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Email</span>
          <span className="stat-value email">{employee.email}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Phone</span>
          <span className="stat-value">{employee.phone || 'N/A'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="card-expanded">
          <div className="details-section">
            <div className="detail-row">
              <span className="detail-label">Start Date:</span>
              <span>{formatDate(employee.startDate)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Employment Type:</span>
              <span>{employee.employmentType || 'Full-time'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Work Location:</span>
              <span>{employee.location || 'On-site'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reports To:</span>
              <span>{employee.manager || 'N/A'}</span>
            </div>
          </div>
          
          {employee.skills?.length > 0 && (
            <div className="skills-section">
              <label>Skills</label>
              <div className="skills-list">
                {employee.skills.map((skill, idx) => (
                  <SkillTag key={idx} skill={skill.name} level={skill.level} size="sm" />
                ))}
              </div>
            </div>
          )}
          
          {showActions && (
            <div className="action-buttons">
              <button className="btn-view" onClick={() => onViewDetails?.(employee)}>
                View Profile
              </button>
              <button className="btn-edit" onClick={() => onEdit?.(employee)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => onDelete?.(employee)}>
                Delete
              </button>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .employee-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .employee-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .employee-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .employee-avatar {
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          overflow: hidden;
          background: #e5e7eb;
        }
        
        .employee-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3b82f6;
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .employee-name {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .employee-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .employee-role {
          font-weight: 500;
          color: #374151;
        }
        
        .card-actions-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 0.75rem;
          padding: 0.25rem;
        }
        
        .card-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 1rem;
          background: white;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .stat-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
        }
        
        .stat-value.email {
          font-size: 0.75rem;
          font-family: monospace;
        }
        
        .card-expanded {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .details-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .detail-row {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .detail-label {
          color: #6b7280;
          min-width: 110px;
        }
        
        .skills-section {
          margin-bottom: 1rem;
        }
        
        .skills-section label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-view, .btn-edit, .btn-delete {
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
          background: #f59e0b;
          color: white;
        }
        
        .btn-edit:hover {
          background: #d97706;
        }
        
        .btn-delete {
          background: #ef4444;
          color: white;
        }
        
        .btn-delete:hover {
          background: #dc2626;
        }
        
        @media (max-width: 768px) {
          .card-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .details-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}