'use client';

import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';

export default function ReconciliationContent() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Reconciliation" 
        description="Match invoices with payments and reconcile accounts"
        actions={
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Unreconciled Invoices">
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No unreconciled invoices</p>
            <p className="text-sm mt-2">Invoice reconciliation will be available in the next update</p>
          </div>
        </Card>
        
        <Card title="Unmatched Payments">
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No unmatched payments</p>
            <p className="text-sm mt-2">Payment reconciliation is coming soon</p>
          </div>
        </Card>
      </div>
      
      <Card title="Reconciliation History" className="mt-6">
        <div className="text-center py-8 text-gray-500">
          <p>Previous reconciliations will appear here</p>
        </div>
      </Card>
    </div>
  );
}