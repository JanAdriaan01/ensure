// app/jobs/[id]/page.js
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import JobFlowVisualization from '@/app/components/JobFlowVisualization';
import JobManagement from '@/app/components/JobManagement';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;
  const { data: job, loading, refetch } = useFetch(`/api/jobs/${jobId}`);
  
  if (loading) return <LoadingSpinner />;
  if (!job) return <div>Job not found</div>;
  
  return (
    <div className="job-detail-page">
      <div className="page-header">
        <h1>Job: {job.lc_number}</h1>
        <div className="job-status-badge">{job.po_status} | {job.completion_status}</div>
      </div>
      
      {/* Flow Visualization - Always visible */}
      <JobFlowVisualization 
        jobId={jobId} 
        onStageChange={refetch}
      />
      
      {/* Job Management - Only enabled when PO is received */}
      <JobManagement 
        jobId={jobId} 
        onUpdate={refetch}
      />
      
      <style jsx>{`
        .job-detail-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .page-header h1 {
          margin: 0;
        }
        
        .job-status-badge {
          padding: 0.25rem 0.75rem;
          background: #e9ecef;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}