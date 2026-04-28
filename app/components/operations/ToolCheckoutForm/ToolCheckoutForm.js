// components/operations/ToolCheckoutForm/ToolCheckoutForm.js
'use client';

import { useState } from 'react';
import FormSelect from '@/app/components/ui/Form/FormSelect';
import FormDatePicker from '@/app/components/ui/Form/FormDatePicker';
import FormInput from '@/app/components/ui/Form/FormInput';

export default function ToolCheckoutForm({ 
  tool, 
  onSubmit, 
  onCancel,
  employees = [],
  jobs = [],
  loading = false 
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    jobId: '',
    expectedReturnDate: '',
    notes: '',
    condition: 'good'
  });
  
  const [errors, setErrors] = useState({});
  
  const conditions = [
    { value: 'excellent', label: 'Excellent - Like new' },
    { value: 'good', label: 'Good - Normal wear' },
    { value: 'fair', label: 'Fair - Some wear' },
    { value: 'poor', label: 'Poor - Needs maintenance' }
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId) newErrors.employeeId = 'Please select an employee';
    if (!formData.expectedReturnDate) newErrors.expectedReturnDate = 'Expected return date is required';
    
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
  
  return (
    <form onSubmit={handleSubmit} className="tool-checkout-form">
      <div className="form-header">
        <h3>Check Out Tool: {tool?.name}</h3>
        <p className="tool-detail">Serial: {tool?.serialNumber} | Location: {tool?.location}</p>
      </div>
      
      <div className="form-row">
        <FormSelect
          label="Checking Out To"
          name="employeeId"
          value={formData.employeeId}
          onChange={(e) => handleChange('employeeId', e.target.value)}
          options={employees.map(emp => ({ 
            value: emp.id, 
            label: `${emp.firstName} ${emp.lastName} - ${emp.department}` 
          }))}
          error={errors.employeeId}
          required
        />
        
        <FormSelect
          label="Related Job (Optional)"
          name="jobId"
          value={formData.jobId}
          onChange={(e) => handleChange('jobId', e.target.value)}
          options={jobs.map(job => ({ 
            value: job.id, 
            label: `${job.jobNumber || job.id} - ${job.name || job.title}` 
          }))}
        />
      </div>
      
      <div className="form-row">
        <FormDatePicker
          label="Expected Return Date"
          name="expectedReturnDate"
          value={formData.expectedReturnDate}
          onChange={(e) => handleChange('expectedReturnDate', e.target.value)}
          error={errors.expectedReturnDate}
          required
        />
        
        <FormSelect
          label="Tool Condition"
          name="condition"
          value={formData.condition}
          onChange={(e) => handleChange('condition', e.target.value)}
          options={conditions}
        />
      </div>
      
      <FormInput
        label="Notes / Purpose"
        name="notes"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="What will the tool be used for?"
      />
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Checking Out...' : 'Confirm Checkout'}
        </button>
      </div>
      
      <style jsx>{`
        .tool-checkout-form {
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
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
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
          background: #f59e0b;
          color: white;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: #d97706;
        }
        
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </form>
  );
}