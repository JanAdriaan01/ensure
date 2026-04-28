// components/hr/SkillSelect/SkillSelect.js
'use client';

import { useState, useRef, useEffect } from 'react';
import SkillTag from '../SkillTag';

export default function SkillSelect({
  label,
  selectedSkills = [],
  onChange,
  availableSkills = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Search or add skills...',
  helperText = '',
  maxSkills,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.some(s => s.id === skill.id)
  );
  
  const handleAddSkill = (skill) => {
    if (maxSkills && selectedSkills.length >= maxSkills) return;
    
    const newSkills = [...selectedSkills, skill];
    onChange(newSkills);
    setSearchTerm('');
    setShowDropdown(false);
  };
  
  const handleRemoveSkill = (skillId) => {
    const newSkills = selectedSkills.filter(s => s.id !== skillId);
    onChange(newSkills);
  };
  
  const handleCreateSkill = () => {
    if (!searchTerm.trim()) return;
    if (maxSkills && selectedSkills.length >= maxSkills) return;
    
    const newSkill = {
      id: `new-${Date.now()}`,
      name: searchTerm.trim(),
      isNew: true
    };
    
    const newSkills = [...selectedSkills, newSkill];
    onChange(newSkills);
    setSearchTerm('');
    setShowDropdown(false);
  };
  
  const showError = error && touched;
  
  return (
    <div className={`skill-select ${className}`} ref={wrapperRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <div 
        className={`selected-skills ${showError ? 'error' : ''}`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {selectedSkills.map(skill => (
          <SkillTag
            key={skill.id}
            skill={skill.name}
            level={skill.level}
            size="sm"
            onRemove={() => handleRemoveSkill(skill.id)}
          />
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setTouched(true);
            setShowDropdown(true);
          }}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          placeholder={selectedSkills.length === 0 ? placeholder : ''}
          className="skill-input"
        />
      </div>
      
      {maxSkills && (
        <div className="counter">
          {selectedSkills.length} / {maxSkills} skills
        </div>
      )}
      
      {showDropdown && searchTerm && (
        <div className="dropdown">
          {filteredSkills.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-title">Existing Skills</div>
              {filteredSkills.map(skill => (
                <div
                  key={skill.id}
                  className="dropdown-item"
                  onClick={() => handleAddSkill(skill)}
                >
                  <span className="skill-name">{skill.name}</span>
                  {skill.category && (
                    <span className="skill-category">{skill.category}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {searchTerm.trim() && (
            <div 
              className="dropdown-item create-item"
              onClick={handleCreateSkill}
            >
              <span className="create-icon">➕</span>
              <span>Create "{searchTerm}"</span>
            </div>
          )}
          
          {filteredSkills.length === 0 && !searchTerm.trim() && (
            <div className="dropdown-empty">
              Type to search or create skills
            </div>
          )}
        </div>
      )}
      
      {helperText && !showError && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {showError && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .skill-select {
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .required-star {
          color: #ef4444;
          margin-left: 0.25rem;
        }
        
        .selected-skills {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          min-height: 42px;
          cursor: text;
          transition: all 0.2s;
        }
        
        .selected-skills:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .selected-skills.error {
          border-color: #ef4444;
        }
        
        .skill-input {
          flex: 1;
          min-width: 120px;
          padding: 0.25rem;
          border: none;
          outline: none;
          font-size: 0.875rem;
          background: transparent;
        }
        
        .skill-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        
        .counter {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .dropdown {
          position: absolute;
          z-index: 10;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-height: 250px;
          overflow-y: auto;
          width: 100%;
        }
        
        .dropdown-section {
          padding: 0.5rem 0;
        }
        
        .dropdown-title {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          background: #f9fafb;
        }
        
        .dropdown-item {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }
        
        .dropdown-item:hover {
          background: #f3f4f6;
        }
        
        .skill-name {
          font-size: 0.875rem;
          color: #374151;
        }
        
        .skill-category {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .create-item {
          border-top: 1px solid #e5e7eb;
          color: #3b82f6;
        }
        
        .create-icon {
          margin-right: 0.5rem;
        }
        
        .dropdown-empty {
          padding: 1rem;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .helper-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .error-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}