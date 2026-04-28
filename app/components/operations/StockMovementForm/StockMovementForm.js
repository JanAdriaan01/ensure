// components/operations/StockMovementForm/StockMovementForm.js
'use client';

import { useState } from 'react';
import FormSelect from '@/app/components/ui/Form/FormSelect';
import FormInput from '@/app/components/ui/Form/FormInput';

export default function StockMovementForm({ 
  item, 
  onSubmit, 
  onCancel,
  projects = [],
  loading = false 
}) {
  const [formData, setFormData] = useState({
    type: 'issue',
    quantity: '',
    projectId: '',
    reference: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const movementTypes = [
    { value: 'receive', label: '📥 Receive Stock - Add to inventory' },
    { value: 'issue', label: '📤 Issue Stock - Remove from inventory' },
    { value: 'return', label: '🔄 Return Stock - Return from project' },
    { value: 'adjust', label: '⚖️ Adjust Stock - Count adjustment' },
    { value: 'transfer', label: '🚚 Transfer Stock - Move to another location' }
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    else if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    
    if (formData.type === 'issue' && (!formData.projectId && !formData.reference)) {
      newErrors.projectId = 'Please select a project or provide a reference';
    }
    
    if (formData.type === 'issue' && formData.quantity > (item?.quantity || 0)) {
      newErrors.quantity = `Insufficient stock. Only ${item?.quantity} available`;
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
  
  const getNewQuantity = () => {
    const currentQty = item?.quantity || 0;
    const qty = parseFloat(formData.quantity) || 0;
    
    switch (formData.type) {
      case 'receive':
      case 'return':
        return currentQty + qty;
      case 'issue':
      case 'transfer':
        return currentQty - qty;
      case 'adjust':
        return qty;
      default:
        return currentQty;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="stock-movement-form">
      <div className="form-header">
        <h3>Stock Movement: {item?.name}</h3>
        <p className="item-detail">SKU: {item?.sku} | Current Stock: {item?.quantity} {item?.unit}</p>
      </div>
      
      <FormSelect
        label="Movement Type"
        name="type"
        value={formData.type}
        onChange={(e) => handleChange('type', e.target.value)}
        options={movementTypes}
        required
      />
      
      <FormInput
        label="Quantity"
        name="quantity"
        type="number"
        step={item?.unit === 'kg' || item?.unit === 'l' ? '0.01' : '1'}
        value={formData.quantity}
        onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
        error={errors.quantity}
        required
        helperText={`Current: ${item?.quantity} ${item?.unit} → New: ${getNewQuantity()} ${item?.unit}`}
      />
      
      {formData.type === 'issue' && (
        <FormSelect
          label="Project / Work Order"
          name="projectId"
          value={formData.projectId}
          onChange={(e) => handleChange('projectId', e.target.value)}
          options={projects.map(proj => ({ 
            value: proj.id, 
            label: `${proj.number || proj.id} - ${proj.name}` 
          }))}
          error={errors.projectId}
          helperText="Select the project using these materials"
        />
      )}
      
      <FormInput
        label="Reference Number"
        name="reference"
        value={formData.reference}
        onChange={(e) => handleChange('reference', e.target.value)}
        placeholder="PO number, WO number, or invoice reference"
      />
      
      <FormInput
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="Additional information about this movement"
      />
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Processing...' : 'Record Movement'}
        </button>
      </div>
      
      <style jsx>{`
        .stock-movement-form {
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
        
        .item-detail {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
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
          background: #3b82f6;
          color: white;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}