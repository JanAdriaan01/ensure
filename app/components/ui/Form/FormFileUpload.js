'use client';

import { useState, useRef } from 'react';

export default function FormFileUpload({ 
  label, 
  name, 
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  multiple = false,
  onFileSelect,
  error = '',
  required = false,
  disabled = false,
  maxSize = 5 * 1024 * 1024 // 5MB
}) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndSetFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndSetFiles(droppedFiles);
  };

  const validateAndSetFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];

    for (const file of newFiles) {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds ${maxSize / 1024 / 1024}MB`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);
    onFileSelect(multiple ? updatedFiles : updatedFiles[0]);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileSelect(multiple ? newFiles : newFiles[0]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="form-file-upload">
      {label && (
        <label className="file-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          Drag & drop files here or <span className="browse-link">browse</span>
        </div>
        <div className="upload-hint">
          Supported files: Images, PDF, Word, Excel (Max {maxSize / 1024 / 1024}MB)
        </div>
      </div>
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-icon">📄</span>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              <button type="button" className="remove-file" onClick={() => removeFile(index)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <style jsx>{`
        .form-file-upload {
          margin-bottom: 1rem;
        }
        .file-label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
        .required {
          color: #dc2626;
        }
        .drop-zone {
          border: 2px dashed #d1d5db;
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f9fafb;
        }
        .drop-zone:hover, .drag-active {
          border-color: #2563eb;
          background: #eff6ff;
        }
        .drop-zone.error {
          border-color: #dc2626;
        }
        .upload-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .upload-text {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .browse-link {
          color: #2563eb;
          cursor: pointer;
        }
        .upload-hint {
          font-size: 0.7rem;
          color: #9ca3af;
          margin-top: 0.5rem;
        }
        .file-list {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .file-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }
        .file-icon {
          font-size: 1.25rem;
        }
        .file-info {
          flex: 1;
        }
        .file-name {
          font-size: 0.75rem;
          font-weight: 500;
        }
        .file-size {
          font-size: 0.65rem;
          color: #6b7280;
        }
        .remove-file {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #9ca3af;
        }
        .error-message {
          font-size: 0.7rem;
          color: #dc2626;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}