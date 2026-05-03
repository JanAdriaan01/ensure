'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmployeeDetailPage({ params }) {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [availableCertifications, setAvailableCertifications] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchEmployeeData();
    fetchAvailableData();
  }, [params.id]);

  const fetchEmployeeData = async () => {
    const res = await fetch(`/api/employees/${params.id}`);
    const data = await res.json();
    setEmployee(data.employee);
    setCertifications(data.certifications || []);
    setSkills(data.skills || []);
    setTimeEntries(data.time_entries || []);
    setFormData(data.employee);
    setLoading(false);
  };

  const fetchAvailableData = async () => {
    const certsRes = await fetch('/api/employees/certifications');
    const certsData = await certsRes.json();
    setAvailableCertifications(certsData);
    
    const skillsRes = await fetch('/api/employees/skills');
    const skillsData = await skillsRes.json();
    setAvailableSkills(skillsData);
  };

  const updateEmployee = async () => {
    const res = await fetch(`/api/employees/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setEditing(false);
      fetchEmployeeData();
    } else {
      alert('Failed to update employee');
    }
  };

  const updateCertifications = async (selectedCerts) => {
    await fetch(`/api/employees/${params.id}/certifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certifications: selectedCerts })
    });
    fetchEmployeeData();
  };

  const deleteEmployee = async () => {
    if (confirm('Delete this employee? All time entries will be deleted.')) {
      await fetch(`/api/employees/${params.id}`, { method: 'DELETE' });
      router.push('/employees');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container">
        <div className="empty-state">Employee not found</div>
        <Link href="/employees" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Employees</Link>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const totalHours = timeEntries.reduce((sum, t) => sum + (t.hours_worked || 0), 0);

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/employees" className="back-link">← Back to Employees</Link>
          <h1>{employee.first_name} {employee.last_name}</h1>
          <div className="employee-badge">{employee.employee_number}</div>
        </div>
        <div className="header-actions">
          <button onClick={() => setEditing(!editing)} className="btn-secondary">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={deleteEmployee} className="btn-danger">Delete</button>
        </div>
      </div>

      {/* Employee Info Cards */}
      <div className="info-grid">
        <div className="info-card">
          <h3>Personal Information</h3>
          {editing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text"
                  value={formData.first_name || ''} 
                  onChange={e => setFormData({...formData, first_name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text"
                  value={formData.last_name || ''} 
                  onChange={e => setFormData({...formData, last_name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input 
                  type="text"
                  value={formData.nationality || ''} 
                  onChange={e => setFormData({...formData, nationality: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Passport Number</label>
                <input 
                  type="text"
                  value={formData.passport_number || ''} 
                  onChange={e => setFormData({...formData, passport_number: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Work Permit</label>
                <input 
                  type="text"
                  value={formData.work_permit || ''} 
                  onChange={e => setFormData({...formData, work_permit: e.target.value})} 
                />
              </div>
              <button onClick={updateEmployee} className="btn-primary">Save Changes</button>
            </div>
          ) : (
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">{formatDate(employee.date_of_birth)} (Age: {employee.age} yrs)</span>
              </div>
              <div className="info-row">
                <span className="info-label">Nationality</span>
                <span className="info-value">{employee.nationality || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Passport Number</span>
                <span className="info-value">{employee.passport_number || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Work Permit</span>
                <span className="info-value">{employee.work_permit || '-'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>Employment Information</h3>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Start Date</span>
              <span className="info-value">{formatDate(employee.company_start_date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Years Worked</span>
              <span className="info-value">{Math.round(employee.years_worked || 0)} years</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Hours</span>
              <span className="info-value">{totalHours} hrs</span>
            </div>
            <div className="info-row">
              <span className="info-label">Days Worked</span>
              <span className="info-value">{timeEntries.length} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="section">
        <div className="section-header">
          <h2>Certifications & Training</h2>
        </div>
        <div className="cert-grid">
          {availableCertifications.map(cert => {
            const hasCert = certifications.some(c => c.certification_name === cert.certification_name);
            return (
              <label key={cert.id} className="cert-checkbox">
                <input
                  type="checkbox"
                  checked={hasCert}
                  onChange={() => {
                    const newCerts = hasCert
                      ? certifications.filter(c => c.certification_name !== cert.certification_name).map(c => c.certification_name)
                      : [...certifications.map(c => c.certification_name), cert.certification_name];
                    updateCertifications(newCerts);
                  }}
                />
                <span>{cert.certification_name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Skills Section */}
      <div className="section">
        <div className="section-header">
          <h2>Skills</h2>
        </div>
        <div className="skills-list">
          {skills.map(skill => (
            <span key={skill.skill_name} className="skill-tag">
              {skill.skill_name}
              {skill.years_experience ? ` (${skill.years_experience} yrs)` : ''}
            </span>
          ))}
          {skills.length === 0 && <p className="no-data">No skills added yet.</p>}
        </div>
      </div>

      {/* Time Entries History */}
      <div className="section">
        <div className="section-header">
          <h2>Time Entry History</h2>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Hours</th>
                <th>Site</th>
                <th>Job Number</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.work_date)}</td>
                  <td>{entry.hours_worked}</td>
                  <td>{entry.site_name || '-'}</td>
                  <td>{entry.job_number || '-'}</td>
                  <td>{entry.description || '-'}</td>
                </tr>
              ))}
              {timeEntries.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">No time entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .back-link {
          color: var(--text-tertiary);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        .back-link:hover {
          color: var(--primary);
        }
        h1 {
          margin: 0.5rem 0 0.25rem 0;
          color: var(--text-primary);
        }
        .employee-badge {
          background: var(--bg-tertiary);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          display: inline-block;
          color: var(--text-secondary);
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .info-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          padding: 1.5rem;
          border-radius: 0.75rem;
        }
        .info-card h3 {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
        }
        .info-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .info-label {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }
        .info-value {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .form-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .form-group input {
          padding: 0.5rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.375rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .section {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .section-header {
          margin-bottom: 1rem;
        }
        .section-header h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.5rem;
        }
        .cert-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          background: var(--bg-tertiary);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .cert-checkbox:hover {
          background: var(--bg-quaternary);
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .skill-tag {
          background: var(--primary-bg);
          color: var(--primary-dark);
          padding: 0.375rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th,
        .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--border-light);
        }
        .data-table th {
          background: var(--bg-tertiary);
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .data-table td {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .no-data {
          text-align: center;
          padding: 2rem;
          color: var(--text-tertiary);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .btn-secondary {
          background: var(--secondary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .btn-secondary:hover {
          background: var(--secondary-dark);
        }
        .btn-danger {
          background: var(--danger);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .btn-danger:hover {
          background: var(--danger-dark);
        }
        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          .cert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}