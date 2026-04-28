// components/hr/TimeEntryForm/TimeEntryForm.js
'use client';

import { useState } from 'react';
import FormSelect from '@/app/components/ui/Form/FormSelect';
import FormDatePicker from '@/app/components/ui/Form/FormDatePicker';
import FormInput from '@/app/components/ui/Form/FormInput';
import EmployeeSearch from '../EmployeeSearch';

export default function TimeEntryForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  employees = [],
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    employeeId: initialData.employeeId || '',
    employeeName: initialData.employeeName || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    startTime: initialData.startTime || '09:00',
    endTime: initialData.endTime || '17:00',
    breakDuration: initialData.breakDuration || 60,
    project: initialData.project || '',
    task: initialData.task || '',
    description: initialData.description || '',
    isOvertime: initialData.isOvertime || false,
    isHoliday: initialData.isHoliday || false
  });
  
  const [errors, setErrors] = useState({});
  
  const calculateHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const diff = (end - start) / (1000 * 60 * 60);
    const hours = diff - (formData.breakDuration / 60);
    return hours > 0 ? hours : 0;
  };
  
  const totalHours = calculateHours();
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (totalHours <= 0) newErrors.hours = 'Invalid time range';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        hoursWorked: totalHours
      });
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  return (
    <form className="time-entry-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="section-title">Employee Information</h3>
        <EmployeeSearch
          employees={employees}
          onSelect={(employee) => {
            handleChange('employeeId', employee.id);
            handleChange('employeeName', employee.name);
          }}
          placeholder="Search for employee..."
        />
        {errors.employeeId && <div className="error-text">{errors.employeeId}</div>}
      </div>
      
      <div className="form-section">
        <h3 className="section-title">Time Details</h3>
        <div className="form-grid">
          <FormDatePicker
            label="Date"
            name="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={errors.date}
            required
          />
          <FormInput
            label="Start Time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            error={errors.startTime}
            required
          />
          <FormInput
            label="End Time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            error={errors.endTime}
            required
          />
          <FormInput
            label="Break Duration (minutes)"
            name="breakDuration"
            type="number"
            value={formData.breakDuration}
            onChange={(e) => handleChange('breakDuration', parseInt(e.target.value))}
          />
        </div>
        
        <div className="hours-summary">
          <span>Total Hours Worked:</span>
          <strong>{totalHours.toFixed(2)} hrs</strong>
        </div>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isOvertime}
              onChange={(e) => handleChange('isOvertime', e.target.checked)}
            />
            <span>Overtime Hours</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isHoliday}
              onChange={(e) => handleChange('isHoliday', e.target.checked)}
            />
            <span>Holiday Hours</span>
          </label>
        </div>
      </div>
      
      <div className="form-section">
        <h3 className="section-title">Work Details</h3>
        <div className="form-grid">
          <FormInput
            label="Project/Job Number"
            name="project"
            value={formData.project}
            onChange={(e) => handleChange('project', e.target.value)}
          />
          <FormInput
            label="Task/Activity"
            name="task"
            value={formData.task}
            onChange={(e) => handleChange('task', e.target.value)}
          />
        </div>
        <FormInput
          label="Description"
          name="description"
          type="textarea"
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the work performed..."
        />
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData.id ? 'Update Entry' : 'Save Entry')}
        </button>
      </div>
      
      <style jsx>{`
        .time-entry-form {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .form-section:last-of-type {
          border-bottom: none;
        }
        
        .section-title {
          margin: 0 0 1.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .hours-summary {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .checkbox-group {
          margin-top: 1rem;
          display: flex;
          gap: 1.5rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .error-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #ef4444;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
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
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </form>
  );
}