// components/hr/SkillTag/SkillTag.js
'use client';

export default function SkillTag({ 
  skill, 
  level, 
  onRemove, 
  onClick, 
  size = 'md',
  showLevel = true 
}) {
  const getLevelColor = () => {
    switch (level?.toLowerCase()) {
      case 'expert':
        return 'expert';
      case 'advanced':
        return 'advanced';
      case 'intermediate':
        return 'intermediate';
      case 'beginner':
        return 'beginner';
      default:
        return 'default';
    }
  };
  
  const getLevelLabel = () => {
    switch (level?.toLowerCase()) {
      case 'expert': return '⭐ Expert';
      case 'advanced': return '🚀 Advanced';
      case 'intermediate': return '📘 Intermediate';
      case 'beginner': return '🌱 Beginner';
      default: return level || '';
    }
  };
  
  const levelColor = getLevelColor();
  const levelLabel = getLevelLabel();
  
  const sizeClasses = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.875rem', gap: '0.375rem' },
    lg: { padding: '0.375rem 1rem', fontSize: '1rem', gap: '0.5rem' }
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div 
      className={`skill-tag ${levelColor} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <span className="skill-name">{skill}</span>
      {showLevel && level && (
        <span className="skill-level">{levelLabel}</span>
      )}
      {onRemove && (
        <button 
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ✕
        </button>
      )}
      
      <style jsx>{`
        .skill-tag {
          display: inline-flex;
          align-items: center;
          gap: ${sizeClass.gap};
          padding: ${sizeClass.padding};
          border-radius: 0.5rem;
          font-size: ${sizeClass.fontSize};
          font-weight: 500;
          background: #f3f4f6;
          color: #374151;
          transition: all 0.2s;
        }
        
        .skill-tag.clickable {
          cursor: pointer;
        }
        
        .skill-tag.clickable:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .skill-tag.expert {
          background: #fef3c7;
          color: #92400e;
        }
        
        .skill-tag.advanced {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .skill-tag.intermediate {
          background: #d1fae5;
          color: #065f46;
        }
        
        .skill-tag.beginner {
          background: #f3e8ff;
          color: #6b21a5;
        }
        
        .skill-name {
          font-weight: 600;
        }
        
        .skill-level {
          font-size: 0.75em;
          opacity: 0.8;
        }
        
        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          font-size: 1em;
          padding: 0;
          margin-left: 0.25rem;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        
        .remove-btn:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}