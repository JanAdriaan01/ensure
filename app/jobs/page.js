'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.ok ? res.json() : [])
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>📋 Jobs</h1>
        <Link href="/jobs/new" style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none' }}>+ New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {jobs.map(job => (
            <div key={job.id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{job.lc_number}</h3>
              <p style={{ margin: '0.25rem 0' }}>Status: {job.po_status} | Completion: {job.completion_status}</p>
              {job.po_amount && <p style={{ margin: '0.25rem 0' }}>Amount: R{job.po_amount}</p>}
              <Link href={`/jobs/${job.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>View Details →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}