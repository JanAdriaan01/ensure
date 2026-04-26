'use client';

import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import StatusBadge from '@/app/components/common/StatusBadge';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import Link from 'next/link';

export default function SchedulePage() {
  const { data: jobs, loading } = useFetch('/api/jobs');

  if (loading) return <LoadingSpinner text="Loading schedule..." />;

  const activeJobs = jobs?.filter(j => j.completion_status === 'in_progress') || [];
  const pendingJobs = jobs?.filter(j => j.completion_status === 'not_started') || [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="📅 Work Orders" description="Schedule and manage work orders" />

      <div className="sections">
        <div className="section">
          <h2>🔄 In Progress Jobs</h2>
          {activeJobs.length === 0 ? (
            <div className="empty">No active jobs</div>
          ) : (
            activeJobs.map(job => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="job-card">
                <div><strong>{job.lc_number}</strong><br/>{job.client_name}</div>
                <StatusBadge status="in_progress" />
              </Link>
            ))
          )}
        </div>

        <div className="section">
          <h2>⏳ Pending Jobs</h2>
          {pendingJobs.length === 0 ? (
            <div className="empty">No pending jobs</div>
          ) : (
            pendingJobs.map(job => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="job-card">
                <div><strong>{job.lc_number}</strong><br/>{job.client_name}</div>
                <StatusBadge status="pending" />
              </Link>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
        .section { background: white; border-radius: 0.75rem; padding: 1rem; }
        .section h2 { margin: 0 0 1rem 0; font-size: 1rem; }
        .job-card { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-decoration: none; color: inherit; }
        .empty { text-align: center; padding: 2rem; color: #6b7280; }
      `}</style>
    </div>
  );
}