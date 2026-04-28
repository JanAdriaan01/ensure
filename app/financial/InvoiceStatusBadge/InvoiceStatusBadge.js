'use client';

import StatusBadge from '@/app/components/common/StatusBadge/StatusBadge';

export default function InvoiceStatusBadge({ status, size = 'sm' }) {
  const statusMap = {
    draft: 'pending',
    sent: 'in_progress',
    paid: 'completed',
    overdue: 'rejected',
    cancelled: 'rejected'
  };

  const mappedStatus = statusMap[status] || status;

  return <StatusBadge status={mappedStatus} size={size} />;
}