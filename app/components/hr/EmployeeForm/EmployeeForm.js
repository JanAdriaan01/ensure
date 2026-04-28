// components/hr/EmployeeForm/EmployeeForm.js
'use client';

import { useState } from 'react';
import FormInput from '@/app/components/ui/Form/FormInput';
import FormSelect from '@/app/components/ui/Form/FormSelect';
import FormDatePicker from '@/app/components/ui/Form/FormDatePicker';
import FormPhoneInput from '@/app/components/ui/Form/FormPhoneInput';
import SkillSelect from '../SkillSelect';

export default function EmployeeForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    employeeId: initialData.employeeId || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    department: initialData.department || '',
    role: initialData.role || '',
    position: initialData.position || '',
    employmentType: initialData.employmentType || 'full-time',
    status: initialData.status || 'active',
    startDate: initialData.startDate || '',
    manager: initialData.manager || '',
    location: initialData.location || '',
    skills: initialData.skills || []
  });
  
  const [errors, setErrors] = useState({});
  
  const employmentTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
    { value: 'temporary', label: 'Temporary' }
  ];
  
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'probation', label: 'Probation' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'remote', label: 'Remote' }
  ];
  
  const departments = [
    { value: 'operations', label: 'Operations' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'it', label: 'IT' },
    { value: 'management', label: 'Management' }
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    
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
    <form className="employee-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="section-title">Basic Information</h3>
        <div className="form-grid">
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />
          <FormInput
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            error={errors.employeeId}
            required
          />
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
          />
          <FormPhoneInput
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3 className="section-title">Employment Details</h3>
        <div className="form-grid">
          <FormSelect
            label="Department"
            name="department"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            options={departments}
            error={errors.department}
            required
          />
          <FormInput
            label="Role/Position"
            name="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            error={errors.role}
            required
          />
          <FormSelect
            label="Employment Type"
            name="employmentType"
            value={formData.employmentType}
            onChange={(e) => handleChange('employmentType', e.target.value)}
            options={employmentTypes}
          />
          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
          />
          <FormDatePicker
            label="Start Date"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
            required
          />
          <FormInput
            label="Manager/Supervisor"
            name="manager"
            value={formData.manager}
            onChange={(e) => handleChange('manager', e.target.value)}
          />
          <FormInput
            label="Work Location"
            name="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3 className="section-title">Skills & Qualifications</h3>
        <SkillSelect
          label="Skills"
          selectedSkills={formData.skills}
          onChange={(skills) => handleChange('skills', skills)}
          availableSkills={[
            { id: 1, name: 'JavaScript', category: 'Technical' },
            { id: 2, name: 'Python', category: 'Technical' },
            { id: 3, name: 'Project Management', category: 'Soft Skills' },
            { id: 4, name: 'Leadership', category: 'Soft Skills' },
            { id: 5, name: 'Data Analysis', category: 'Technical' },
            { id: 6, name: 'Communication', category: 'Soft Skills' }
          ]}
          maxSkills={10}
        />
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData.id ? 'Update Employee' : 'Create Employee')}
        </button>
      </div>
      
      <style jsx>{`
        .employee-form {
          max-width: 900px;
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
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
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