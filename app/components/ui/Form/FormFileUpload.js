// app/components/ui/Form/FormFileUpload.js
'use client';

import { useState, useRef } from 'react';

export default function FormFileUpload({
  label,
  name,
  onChange,
  onBlur,
  error,
  required = false,
  accept = 'image/*,.pdf,.doc,.docx',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  helperText = '',
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  
  const handleFileChange = (selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];
    
    fileList.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds size limit`);
      } else {
        validFiles.push(file);
      }
    });
    
    const newFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(newFiles);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newFiles,
          errors: errors
        }
      });
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFileChange(droppedFiles);
  };
  
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newFiles
        }
      });
    }
  };
  
  const showError = error && (touched || props.validateOnChange);
  
  return (
    <div className={`form-file-upload ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''} ${showError ? 'error' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileChange(e.target.files)}
          onBlur={(e) => {
            setTouched(true);
            if (onBlur) onBlur(e);
          }}
          style={{ display: 'none' }}
          {...props}
        />
        
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          Drag & drop files here or click to browse
        </div>
        <div className="upload-hint">
          Supported formats: {accept.split(',').join(', ')}
          <br />
          Max size: {maxSize / (1024 * 1024)}MB
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                className="remove-file"
                onClick={() => removeFile(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      {helperText && !showError && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {showError && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .form-file-upload {
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
        
        .drop-zone {
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f9fafb;
        }
        
        .drop-zone:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .drop-zone.drag-active {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: scale(1.02);
        }
        
        .drop-zone.error {
          border-color: #ef4444;
        }
        
        .upload-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .upload-text {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        
        .upload-hint {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .file-list {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: #f3f4f6;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .file-name {
          flex: 1;
          color: #374151;
        }
        
        .file-size {
          color: #6b7280;
          font-size: 0.75rem;
          margin: 0 0.75rem;
        }
        
        .remove-file {
          background: none;
          border: none;
          cursor: pointer;
          color: #ef4444;
          font-size: 0.875rem;
          padding: 0.25rem;
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