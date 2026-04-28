// components/operations/ToolReturnForm/ToolReturnForm.js
'use client';

import { useState } from 'react';
import FormSelect from '@/app/components/ui/Form/FormSelect';
import FormInput from '@/app/components/ui/Form/FormInput';

export default function ToolReturnForm({ 
  tool, 
  checkoutRecord, 
  onSubmit, 
  onCancel,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    condition: checkoutRecord?.conditionOut || 'good',
    damageNotes: '',
    maintenanceNeeded: false,
    restockLocation: tool?.location || ''
  });
  
  const [errors, setErrors] = useState({});
  
  const conditions = [
    { value: 'excellent', label: 'Excellent - Like new' },
    { value: 'good', label: 'Good - Normal wear' },
    { value: 'fair', label: 'Fair - Some wear' },
    { value: 'poor', label: 'Poor - Needs maintenance' },
    { value: 'damaged', label: 'Damaged - Report required' }
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.condition) newErrors.condition = 'Please select condition';
    if (formData.condition === 'damaged' && !formData.damageNotes) {
      newErrors.damageNotes = 'Please describe the damage';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  const isOverdue = checkoutRecord?.expectedReturnDate && 
    new Date(checkoutRecord.expectedReturnDate) < new Date();
  
  return (
    <form onSubmit={handleSubmit} className="tool-return-form">
      <div className="form-header">
        <h3>Return Tool: {tool?.name}</h3>
        <p className="tool-detail">Serial: {tool?.serialNumber}</p>
      </div>
      
      {checkoutRecord && (
        <div className="checkout-info">
          <div className="info-row">
            <label>Checked out to:</label>
            <span>{checkoutRecord.employeeName}</span>
          </div>
          <div className="info-row">
            <label>Checked out on:</label>
            <span>{formatDate(checkoutRecord.checkoutDate)}</span>
          </div>
          <div className="info-row">
            <label>Expected return:</label>
            <span className={isOverdue ? 'overdue' : ''}>
              {formatDate(checkoutRecord.expectedReturnDate)}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
          <div className="info-row">
            <label>Condition when checked out:</label>
            <span>{checkoutRecord.conditionOut}</span>
          </div>
        </div>
      )}
      
      <FormSelect
        label="Tool Condition on Return"
        name="condition"
        value={formData.condition}
        onChange={(e) => handleChange('condition', e.target.value)}
        options={conditions}
        error={errors.condition}
        required
      />
      
      {formData.condition === 'damaged' && (
        <FormInput
          label="Damage Description"
          name="damageNotes"
          value={formData.damageNotes}
          onChange={(e) => handleChange('damageNotes', e.target.value)}
          placeholder="Please describe the damage in detail..."
          error={errors.damageNotes}
          required
        />
      )}
      
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.maintenanceNeeded}
            onChange={(e) => handleChange('maintenanceNeeded', e.target.checked)}
          />
          <span>Maintenance/Calibration needed before next use</span>
        </label>
      </div>
      
      <FormInput
        label="Restock Location"
        name="restockLocation"
        value={formData.restockLocation}
        onChange={(e) => handleChange('restockLocation', e.target.value)}
        placeholder="Where to store the tool"
      />
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Processing...' : 'Confirm Return'}
        </button>
      </div>
      
      <style jsx>{`
        .tool-return-form {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .form-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .form-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          color: #111827;
        }
        
        .tool-detail {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .checkout-info {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }
        
        .info-row {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        
        .info-row label {
          font-weight: 500;
          color: #6b7280;
          min-width: 140px;
        }
        
        .info-row .overdue {
          color: #ef4444;
          font-weight: 600;
        }
        
        .checkbox-group {
          margin: 1rem 0;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .checkbox-label input {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-cancel, .btn-submit {
          padding: 0.625rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }
        
        .btn-cancel:hover {
          background: #e5e7eb;
        }
        
        .btn-submit {
          background: #10b981;
          color: white;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: #059669;
        }
        
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}