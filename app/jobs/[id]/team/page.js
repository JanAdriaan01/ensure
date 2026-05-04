// app/jobs/[id]/team/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function JobTeamPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [team, setTeam] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [jobRes, teamRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/jobs/${params.id}/team`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const jobData = await jobRes.json();
      const teamData = await teamRes.json();
      
      setJob(jobData);
      setTeam(teamData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const totalEstimatedCost = team.reduce((sum, member) => sum + ((parseFloat(member.hourly_rate) || 0) * (parseFloat(member.estimated_hours) || 0)), 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="header">
        <Link href={`/jobs/${params.id}`} className="back-link">← Back to Job</Link>
        <h1>Team Members - {job?.job_number}</h1>
        <p className="subtitle">View all team members assigned to this job</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Team Members</div>
          <div className="stat-value">{team.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Estimated Cost</div>
          <div className="stat-value">{formatCurrency(totalEstimatedCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Members</div>
          <div className="stat-value">{team.filter(m => m.status === 'assigned').length}</div>
        </div>
      </div>

      <div className="team-list">
        {team.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No team members assigned to this job yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Role</th>
                <th>Hourly Rate</th>
                <th>Est. Hours</th>
                <th>Est. Cost</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {team.map(member => (
                <tr key={member.id}>
                  <td className="member-name">{member.user_name || 'Unknown'}</td>
                  <td className="role">{member.role || '-'}</td>
                  <td className="rate">{formatCurrency(member.hourly_rate)}</td>
                  <td className="hours">{member.estimated_hours || 0}</td>
                  <td className="cost">{formatCurrency((member.hourly_rate || 0) * (member.estimated_hours || 0))}</td>
                  <td>{member.start_date ? new Date(member.start_date).toLocaleDateString() : '-'}</td>
                  <td>{member.end_date ? new Date(member.end_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status ${member.status}`}>
                      {member.status === 'assigned' ? 'Active' : member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #1e293b;
        }

        .subtitle {
          color: #64748b;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
        }

        .member-name {
          font-weight: 500;
          color: #1e293b;
        }

        .role {
          color: #64748b;
        }

        .rate, .hours, .cost {
          font-family: monospace;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status.assigned {
          background: #d1fae5;
          color: #065f46;
        }

        .status.completed {
          background: #dbeafe;
          color: #1e40af;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}