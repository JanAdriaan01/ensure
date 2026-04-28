'use client';

export default function StatusBadge({ status, size = 'sm' }) {
  const getStatusConfig = () => {
    const config = {
      pending: { label: 'Pending', className: 'status-pending' },
      approved: { label: 'Approved', className: 'status-approved' },
      rejected: { label: 'Rejected', className: 'status-rejected' },
      not_started: { label: 'Not Started', className: 'status-not_started' },
      in_progress: { label: 'In Progress', className: 'status-in_progress' },
      completed: { label: 'Completed', className: 'status-completed' },
      active: { label: 'Active', className: 'status-approved' },
      invoiced: { label: 'Invoiced', className: 'status-in_progress' },
      training: { label: 'Training', className: 'status-training' },
      office: { label: 'Office', className: 'status-office' },
      leave: { label: 'Leave', className: 'status-leave' },
      productive: { label: 'Productive', className: 'status-productive' },
      unproductive: { label: 'Unproductive', className: 'status-unproductive' }
    };
    return config[status] || { label: status, className: 'status-pending' };
  };

  const { label, className } = getStatusConfig();
  const sizeClass = size === 'sm' ? 'badge-sm' : 'badge-md';

  return (
    <span className={`status-badge ${className} ${sizeClass}`}>
      {label}
      <style jsx>{`
        .status-badge {
          display: inline-block;
          border-radius: 9999px;
          font-weight: 500;
          line-height: 1;
        }
        .badge-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.7rem;
        }
        .badge-md {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-training { background: #fef3c7; color: #92400e; }
        .status-office { background: #e0e7ff; color: #3730a3; }
        .status-leave { background: #fce7f3; color: #9d174d; }
        .status-productive { background: #d1fae5; color: #065f46; }
        .status-unproductive { background: #fef3c7; color: #92400e; }
      `}</style>
    </span>
  );
}