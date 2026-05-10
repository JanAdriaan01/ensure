// app/employees/new/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewEmployeePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_number: '',
    name: '',           // Changed from first_name
    surname: '',        // Changed from last_name
    date_of_birth: '',
    nationality: '',
    passport_number: '',
    work_permit: '',
    company_start_date: '',
    hourly_rate: ''
  });

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="form-container">
        <div className="page-header">
          <h1>Authentication Required</h1>
          <p>Please log in to create employees.</p>
          <Link href="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/employees');
      } else {
        alert(data.error || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="form-container">
      <div className="page-header">
        <h1>Add New Employee</h1>
        <Link href="/employees" className="btn-secondary">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
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
              placeholder="First name"
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
              placeholder="Last name"
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
              max={today}
            />
          </div>
          
          <div className="form-group">
            <label>Hourly Rate (R)</label>
            <input
              type="number"
              name="hourly_rate"
              value={formData.hourly_rate}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label>Nationality</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="South African"
            />
          </div>
          
          <div className="form-group">
            <label>Passport Number</label>
            <input
              type="text"
              name="passport_number"
              value={formData.passport_number}
              onChange={handleChange}
              placeholder="Passport number"
            />
          </div>
          
          <div className="form-group">
            <label>Work Permit</label>
            <input
              type="text"
              name="work_permit"
              value={formData.work_permit}
              onChange={handleChange}
              placeholder="Critical Skills, General, etc."
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
        .form-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .form-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 2rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .form-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-group input::placeholder {
          color: var(--text-muted);
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-light);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--secondary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
          display: inline-block;
        }
        .btn-secondary:hover {
          background: var(--secondary-dark);
        }
        @media (max-width: 768px) {
          .form-container {
            padding: 1rem;
          }
          .form-card {
            padding: 1.5rem;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-actions {
            flex-direction: column-reverse;
          }
          .form-actions button,
          .form-actions a {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}