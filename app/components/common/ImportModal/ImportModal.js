// components/common/ImportModal/ImportModal.js
'use client';

import { useState, useRef } from 'react';
import Modal from '@/app/components/ui/Modal/Modal';

export default function ImportModal({ 
  isOpen, 
  onClose, 
  onImport,
  title = 'Import Data',
  acceptedFormats = ['.csv', '.xlsx', '.xls'],
  templateUrl,
  validateRow,
  mappingFields = [],
  sampleData = []
}) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const [fieldMapping, setFieldMapping] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    previewFile(selectedFile);
  };
  
  const previewFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      // Parse CSV (simplified - for production use PapaParse)
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      const data = [];
      
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',');
          const row = {};
          headers.forEach((header, idx) => {
            row[header.trim()] = values[idx]?.trim() || '';
          });
          data.push(row);
        }
      }
      
      setPreviewData(data);
      setStep(2);
    };
    
    reader.readAsText(file);
  };
  
  const validateData = () => {
    const validationErrors = [];
    
    previewData.forEach((row, idx) => {
      if (validateRow) {
        const rowErrors = validateRow(row);
        if (rowErrors) {
          validationErrors.push({ row: idx + 2, errors: rowErrors });
        }
      }
    });
    
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setStep(3);
    }
  };
  
  const handleImport = async () => {
    setIsImporting(true);
    try {
      await onImport(previewData, fieldMapping);
      onClose();
      resetForm();
    } catch (error) {
      setErrors([{ row: 0, errors: [error.message] }]);
    } finally {
      setIsImporting(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setStep(1);
    setFieldMapping({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <div className="upload-area">
              <div className="upload-icon">📁</div>
              <h4>Upload your file</h4>
              <p>Supported formats: {acceptedFormats.join(', ')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                className="file-input"
              />
              {templateUrl && (
                <a href={templateUrl} className="template-link" download>
                  📥 Download template
                </a>
              )}
            </div>
            
            {sampleData.length > 0 && (
              <div className="sample-data">
                <h5>Sample Data Format</h5>
                <div className="sample-table">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(sampleData[0] || {}).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.slice(0, 3).map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((value, i) => (
                            <td key={i}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <div className="file-info">
              <strong>File:</strong> {file?.name}
              <button className="change-file" onClick={() => setStep(1)}>Change</button>
            </div>
            
            {mappingFields.length > 0 && (
              <div className="mapping-section">
                <h5>Map Columns</h5>
                <div className="mapping-grid">
                  {mappingFields.map(field => (
                    <div key={field.key} className="mapping-item">
                      <label>{field.label}</label>
                      <select
                        value={fieldMapping[field.key] || ''}
                        onChange={(e) => setFieldMapping({
                          ...fieldMapping,
                          [field.key]: e.target.value
                        })}
                      >
                        <option value="">Select column...</option>
                        {Object.keys(previewData[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                      {field.required && <span className="required">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="preview-section">
              <h5>Preview Data</h5>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(previewData[0] || {}).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length === 5 && (
                <p className="preview-note">Showing first 5 rows</p>
              )}
            </div>
            
            {errors.length > 0 && (
              <div className="errors-section">
                <h5>Validation Errors</h5>
                {errors.map((err, idx) => (
                  <div key={idx} className="error-item">
                    Row {err.row}: {err.errors.join(', ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <div className="confirmation">
              <div className="success-icon">✓</div>
              <h4>Ready to Import</h4>
              <p>You are about to import {previewData.length} records</p>
              <div className="summary">
                <div className="summary-item">
                  <span>File:</span>
                  <strong>{file?.name}</strong>
                </div>
                <div className="summary-item">
                  <span>Records:</span>
                  <strong>{previewData.length}</strong>
                </div>
                {Object.keys(fieldMapping).length > 0 && (
                  <div className="summary-item">
                    <span>Mapped Fields:</span>
                    <strong>{Object.keys(fieldMapping).length}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="import-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span>Upload</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span>Preview & Map</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span>Confirm</span>
          </div>
        </div>
        
        {renderStep()}
        
        <div className="modal-footer">
          {step === 2 && (
            <button className="btn-back" onClick={() => setStep(1)}>
              Back
            </button>
          )}
          {step === 2 && (
            <button className="btn-next" onClick={validateData}>
              Validate & Continue
            </button>
          )}
          {step === 3 && (
            <>
              <button className="btn-back" onClick={() => setStep(2)}>
                Back
              </button>
              <button 
                className="btn-import" 
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Confirm Import'}
              </button>
            </>
          )}
          {step === 1 && file && (
            <button className="btn-next" onClick={() => setStep(2)}>
              Next
            </button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .import-modal {
          background: white;
          border-radius: 0.75rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #111827;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #6b7280;
        }
        
        .steps-indicator {
          display: flex;
          justify-content: space-between;
          padding: 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
        }
        
        .step.active {
          color: #3b82f6;
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e5e7eb;
          font-weight: 600;
        }
        
        .step.active .step-number {
          background: #3b82f6;
          color: white;
        }
        
        .step-content {
          padding: 1.5rem;
          min-height: 400px;
        }
        
        .upload-area {
          text-align: center;
          padding: 2rem;
          border: 2px dashed #d1d5db;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .file-input {
          margin: 1rem 0;
        }
        
        .template-link {
          display: inline-block;
          margin-top: 1rem;
          color: #3b82f6;
          text-decoration: none;
        }
        
        .sample-data {
          margin-top: 1.5rem;
        }
        
        .sample-data h5, .preview-section h5, .mapping-section h5, .errors-section h5 {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .sample-table, .preview-table {
          overflow-x: auto;
        }
        
        .sample-table table, .preview-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        
        .sample-table th, .preview-table th,
        .sample-table td, .preview-table td {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          text-align: left;
        }
        
        .sample-table th, .preview-table th {
          background: #f9fafb;
          font-weight: 600;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .change-file {
          padding: 0.25rem 0.5rem;
          background: #e5e7eb;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        
        .mapping-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .mapping-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .mapping-item label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .mapping-item select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
        }
        
        .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }
        
        .preview-note {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
        }
        
        .errors-section {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fee2e2;
          border-radius: 0.5rem;
        }
        
        .error-item {
          padding: 0.25rem;
          font-size: 0.875rem;
          color: #991b1b;
        }
        
        .confirmation {
          text-align: center;
          padding: 2rem;
        }
        
        .success-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          background: #d1fae5;
          color: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }
        
        .summary {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          text-align: left;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-item:last-child {
          border-bottom: none;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-back, .btn-next, .btn-import {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .btn-back {
          background: #f3f4f6;
          color: #374151;
        }
        
        .btn-next, .btn-import {
          background: #3b82f6;
          color: white;
        }
        
        .btn-next:hover, .btn-import:hover {
          background: #2563eb;
        }
        
        .btn-import:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </Modal>
  );
}