'use client';

import StatusBadge from '@/app/components/common/StatusBadge';

export default function QuoteStatusBadge({ status, showLabel = true, size = 'sm' }) {
  const statusConfig = {
    pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7' },
    approved: { label: 'Approved', color: '#065f46', bg: '#d1fae5' },
    rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
    po_received: { label: 'PO Received', color: '#1e40af', bg: '#dbeafe' }
  };

  if (showLabel) {
    return <StatusBadge status={status} size={size} />;
  }

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span 
      className="quote-status-dot"
      style={{ backgroundColor: config.color }}
      title={config.label}
    />
  );
}