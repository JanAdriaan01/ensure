'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_number: '',
    name: '',
    surname: '',
    date_of_birth: '',
    nationality: '',
    passport_number: '',
    work_permit: '',
    company_start_date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      router.push('/employees');
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to create employee');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>➕ Add New Employee</h1>
        <Link href="/employees" className="btn-secondary">← Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Employee Number *</label>
            <input
              type="text"
              name="employee_number"
              value={formData.employee_number}
              onChange={handleChange}
              required
              placeholder="EMP-001"
            />
          </div>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Surname *</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nationality</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="e.g., South African"
            />
          </div>
          
          <div className="form-group">
            <label>Passport Number</label>
            <input
              type="text"
              name="passport_number"
              value={formData.passport_number}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Work Permit</label>
            <input
              type="text"
              name="work_permit"
              value={formData.work_permit}
              onChange={handleChange}
              placeholder="e.g., Critical Skills, General"
            />
          </div>
          
          <div className="form-group">
            <label>Company Start Date *</label>
            <input
              type="date"
              name="company_start_date"
              value={formData.company_start_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
          <Link href="/employees" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h1 {
          margin: 0;
        }
        .employee-form {
          background: white;
          padding: 2rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .btn-secondary:hover {
          background: #4b5563;
        }
        select, input {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}