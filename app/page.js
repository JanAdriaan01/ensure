'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ jobs: 0, quotes: 0, employees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, quotesRes, employeesRes] = await Promise.all([
          fetch('/api/jobs').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/quotes').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/employees').catch(() => ({ ok: false, json: () => [] }))
        ]);
        
        const jobs = jobsRes.ok ? await jobsRes.json() : [];
        const quotes = quotesRes.ok ? await quotesRes.json() : [];
        const employees = employeesRes.ok ? await employeesRes.json() : [];
        
        setStats({
          jobs: Array.isArray(jobs) ? jobs.length : 0,
          quotes: Array.isArray(quotes) ? quotes.length : 0,
          employees: Array.isArray(employees) ? employees.length : 0
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem' }}>Loading ENSURE System...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>🔧 ENSURE System</h1>
        <p style={{ color: '#6b7280' }}>Complete Business Management Platform</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.jobs}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Active Jobs</div>
        </div>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.quotes}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pending Quotes</div>
        </div>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.employees}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Employees</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <a href="/jobs" style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', textDecoration: 'none', color: 'inherit', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💰</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Financial</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Jobs, Quotes, Invoicing</div>
        </a>
        <a href="/employees" style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', textDecoration: 'none', color: 'inherit', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Human Resources</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Employees, Payroll, Skills</div>
        </a>
        <a href="/tools" style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', textDecoration: 'none', color: 'inherit', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚙️</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Operations</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Tools, Stock, Schedule</div>
        </a>
      </div>
    </div>
  );
}