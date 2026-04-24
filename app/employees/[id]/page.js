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

  if (loading) return <div className="loading">Loading employee details...</div>;
  if (!employee) return <div className="loading">Employee not found</div>;

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/employees" className="back-link">← Back to Employees</Link>
          <h1>{employee.name} {employee.surname}</h1>
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
            <>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" />
              <input value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} placeholder="Surname" />
              <input value={formData.nationality || ''} onChange={e => setFormData({...formData, nationality: e.target.value})} placeholder="Nationality" />
              <input value={formData.passport_number || ''} onChange={e => setFormData({...formData, passport_number: e.target.value})} placeholder="Passport Number" />
              <input value={formData.work_permit || ''} onChange={e => setFormData({...formData, work_permit: e.target.value})} placeholder="Work Permit" />
              <button onClick={updateEmployee} className="btn-primary" style={{marginTop: '10px'}}>Save Changes</button>
            </>
          ) : (
            <>
              <p><strong>📅 DOB:</strong> {new Date(employee.date_of_birth).toLocaleDateString()} (Age: {employee.age} yrs)</p>
              <p><strong>🌍 Nationality:</strong> {employee.nationality || '-'}</p>
              <p><strong>📄 Passport:</strong> {employee.passport_number || '-'}</p>
              <p><strong>🪪 Work Permit:</strong> {employee.work_permit || '-'}</p>
            </>
          )}
        </div>

        <div className="info-card">
          <h3>Employment Information</h3>
          <p><strong>📅 Start Date:</strong> {new Date(employee.company_start_date).toLocaleDateString()}</p>
          <p><strong>⭐ Years Worked:</strong> {Math.round(employee.years_worked || 0)} years</p>
          <p><strong>🕐 Total Hours:</strong> {timeEntries.reduce((sum, t) => sum + t.hours_worked, 0)} hrs</p>
          <p><strong>📆 Days Worked:</strong> {timeEntries.length} days</p>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="section">
        <h2>📜 Certifications & Training</h2>
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
        <h2>⚡ Skills</h2>
        <div className="skills-list">
          {skills.map(skill => (
            <span key={skill.skill_name} className="skill-tag">
              {skill.skill_name} <small>({skill.years_experience || 0} yrs)</small>
            </span>
          ))}
          {skills.length === 0 && <p className="no-data">No skills added yet.</p>}
        </div>
      </div>

      {/* Time Entries History */}
      <div className="section">
        <h2>📆 Time Entry History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Hours</th>
              <th>Site</th>
              <th>Job #</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.map(entry => (
              <tr key={entry.id}>
                <td>{new Date(entry.work_date).toLocaleDateString()}</td>
                <td>{entry.hours_worked}</td>
                <td>{entry.site_name || '-'}</td>
                <td>{entry.job_number || '-'}</td>
                <td>{entry.description || '-'}</td>
              </tr>
            ))}
            {timeEntries.length === 0 && (
              <tr><td colSpan="5" className="no-data">No time entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .back-link {
          color: #6b7280;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
        }
        .back-link:hover {
          color: #2563eb;
        }
        h1 {
          margin: 0.5rem 0 0.25rem 0;
        }
        .employee-badge {
          background: #e5e7eb;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          display: inline-block;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .info-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .info-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #6b7280;
        }
        .info-card p {
          margin: 0.5rem 0;
        }
        .section {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }
        .section h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }
        .cert-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          background: #f9fafb;
        }
        .cert-checkbox:hover {
          background: #f3f4f6;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .skill-tag {
          background: #dbeafe;
          color: #1e40af;
          padding: 0.375rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.875rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f9fafb;
          font-weight: 600;
        }
        .btn-danger {
          background: #dc2626;
        }
        .btn-danger:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
}