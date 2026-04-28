'use client';

import StatusBadge from '@/app/components/common/StatusBadge/StatusBadge';

export default function JobStatusBadge({ status, showLabel = true, size = 'sm' }) {
  const statusConfig = {
    not_started: { label: 'Not Started', color: '#6b7280', bg: '#f3f4f6' },
    in_progress: { label: 'In Progress', color: '#1e40af', bg: '#dbeafe' },
    in_progress_paused: { label: 'Paused', color: '#92400e', bg: '#fef3c7' },
    completed: { label: 'Completed', color: '#065f46', bg: '#d1fae5' }
  };

  const config = statusConfig[status] || statusConfig.not_started;

  if (showLabel) {
    return <StatusBadge status={status} size={size} />;
  }

  return (
    <span 
      className="job-status-dot"
      style={{ backgroundColor: config.color }}
      title={config.label}
    />
  );
}

// Also export as StatusBadge for consistency
export { JobStatusBadge as StatusBadge };