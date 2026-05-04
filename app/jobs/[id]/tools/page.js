// app/jobs/[id]/tools/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function JobToolsPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [tools, setTools] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [jobRes, toolsRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/jobs/${params.id}/tools`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const jobData = await jobRes.json();
      const toolsData = await toolsRes.json();
      
      setJob(jobData);
      setTools(toolsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="header">
        <Link href={`/jobs/${params.id}`} className="back-link">← Back to Job</Link>
        <h1>Tools - {job?.job_number}</h1>
      </div>

      <div className="tools-list">
        {tools.length === 0 ? (
          <div className="empty-state">
            <p>No tools assigned to this job yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tool Name</th>
                <th>Code</th>
                <th>Quantity</th>
                <th>Issued Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tools.map(tool => (
                <tr key={tool.id}>
                  <td>{tool.tool_name}</td>
                  <td>{tool.tool_code}</td>
                  <td>{tool.quantity}</td>
                  <td>{new Date(tool.issued_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${tool.status}`}>
                      {tool.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .page-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { margin-bottom: 2rem; }
        .back-link { color: #3b82f6; text-decoration: none; display: inline-block; margin-bottom: 1rem; }
        h1 { font-size: 1.5rem; font-weight: 600; margin: 0; }
        .empty-state { text-align: center; padding: 4rem; background: #f8fafc; border-radius: 0.75rem; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .data-table th { background: #f8fafc; font-weight: 600; }
        .status { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; }
        .status.issued { background: #fef3c7; color: #92400e; }
        .status.returned { background: #d1fae5; color: #065f46; }
      `}</style>
    </div>
  );
}