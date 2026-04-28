'use client';

export default function StatusBadge({ status, size = 'sm', showLabel = true }) {
  const statusConfig = {
    // Job statuses
    not_started: { label: 'Not Started', color: '#6b7280', bg: '#f3f4f6' },
    in_progress: { label: 'In Progress', color: '#1e40af', bg: '#dbeafe' },
    in_progress_paused: { label: 'Paused', color: '#92400e', bg: '#fef3c7' },
    completed: { label: 'Completed', color: '#065f46', bg: '#d1fae5' },
    
    // Quote statuses
    pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7' },
    approved: { label: 'Approved', color: '#065f46', bg: '#d1fae5' },
    rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
    po_received: { label: 'PO Received', color: '#1e40af', bg: '#dbeafe' },
    
    // Invoice statuses
    draft: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
    sent: { label: 'Sent', color: '#1e40af', bg: '#dbeafe' },
    paid: { label: 'Paid', color: '#065f46', bg: '#d1fae5' },
    overdue: { label: 'Overdue', color: '#991b1b', bg: '#fee2e2' },
    
    // Tool statuses
    available: { label: 'Available', color: '#065f46', bg: '#d1fae5' },
    checked_out: { label: 'Checked Out', color: '#92400e', bg: '#fef3c7' },
    low_stock: { label: 'Low Stock', color: '#991b1b', bg: '#fee2e2' },
    
    // Schedule statuses
    scheduled: { label: 'Scheduled', color: '#1e40af', bg: '#dbeafe' },
    cancelled: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' },
    
    // OHS statuses
    reported: { label: 'Reported', color: '#92400e', bg: '#fef3c7' },
    investigating: { label: 'Investigating', color: '#1e40af', bg: '#dbeafe' },
    closed: { label: 'Closed', color: '#065f46', bg: '#d1fae5' },
  };

  const config = statusConfig[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  const sizeStyles = size === 'sm' 
    ? { padding: '0.125rem 0.5rem', fontSize: '0.625rem' }
    : { padding: '0.25rem 0.75rem', fontSize: '0.7rem' };

  if (!showLabel) {
    return (
      <span 
        className="status-dot"
        style={{ backgroundColor: config.color }}
        title={config.label}
      />
    );
  }

  return (
    <span 
      className="status-badge"
      style={{
        background: config.bg,
        color: config.color,
        ...sizeStyles,
      }}
    >
      {config.label}
      <style jsx>{`
        .status-badge {
          display: inline-block;
          border-radius: 9999px;
          font-weight: 500;
          line-height: 1;
          white-space: nowrap;
        }
        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
      `}</style>
    </span>
  );
}