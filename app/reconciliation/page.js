'use client'

'use client';

import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';

export default function ReconciliationPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="🔄 Reconciliation" description="Match invoices with payments and bank statements" />
      <Card>
        <p>Reconciliation module coming soon.</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          This will allow you to match PO amounts with invoiced amounts and track financial discrepancies.
        </p>
      </Card>
    </div>
  );
}
