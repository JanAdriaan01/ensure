'use client';

import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import StatusBadge from '@/app/components/common/StatusBadge/StatusBadge';
import ProgressBar from '@/app/components/ui/ProgressBar/ProgressBar';

export default function JobCard({ job, onClick, compact = false }) {
  const progress = job.total_quoted > 0 
    ? (job.completed_value / job.total_quoted) * 100 
    : 0;

  if (compact) {
    return (
      <Link href={`/jobs/${job.id}`} className="job-card compact">
        <div className="job-header">
          <span className="job-number">{job.lc_number}</span>
          <StatusBadge status={job.completion_status} size="sm" />
        </div>
        <div className="job-details">
          <div className="job-client">{job.client_name || 'No client'}</div>
          <div className="job-amount">
            <CurrencyAmount amount={job.po_amount || 0} />
          </div>
        </div>
        <style jsx>{`
          .job-card {
            display: block;
            background: white;
            border-radius: 0.5rem;
            padding: 0.75rem;
            text-decoration: none;
            color: inherit;
            border: 1px solid #e5e7eb;
            transition: all 0.2s;
          }
          .job-card:hover {
            border-color: #2563eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .job-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .job-number {
            font-weight: 600;
            font-size: 0.875rem;
          }
          .job-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: #6b7280;
          }
        `}</style>
      </Link>
    );
  }

  return (
    <Link href={`/jobs/${job.id}`} className="job-card">
      <div className="job-header">
        <div>
          <div className="job-number">{job.lc_number}</div>
          <div className="job-client">{job.client_name || 'No client'}</div>
        </div>
        <StatusBadge status={job.completion_status} />
      </div>
      
      <div className="job-stats">
        <div className="stat">
          <span className="stat-label">PO Amount</span>
          <span className="stat-value"><CurrencyAmount amount={job.po_amount || 0} /></span>
        </div>
        <div className="stat">
          <span className="stat-label">Invoiced</span>
          <span className="stat-value"><CurrencyAmount amount={job.total_invoiced || 0} /></span>
        </div>
        <div className="stat">
          <span className="stat-label">Hours</span>
          <span className="stat-value">{Math.round(job.total_hours || 0)} hrs</span>
        </div>
      </div>
      
      <div className="job-progress">
        <ProgressBar value={progress} max={100} size="sm" />
        <span className="progress-text">{progress.toFixed(0)}%</span>
      </div>
      
      <style jsx>{`
        .job-card {
          display: block;
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          text-decoration: none;
          color: inherit;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        .job-card:hover {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .job-number {
          font-weight: 600;
          font-size: 1rem;
        }
        .job-client {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .job-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-top: 1px solid #f3f4f6;
          border-bottom: 1px solid #f3f4f6;
        }
        .stat {
          text-align: center;
        }
        .stat-label {
          display: block;
          font-size: 0.65rem;
          color: #9ca3af;
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 0.875rem;
          font-weight: 500;
        }
        .job-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .progress-text {
          font-size: 0.7rem;
          color: #6b7280;
          white-space: nowrap;
        }
      `}</style>
    </Link>
  );
}