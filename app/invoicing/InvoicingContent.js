'use client';

import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function InvoicingContent() {
  const { data: jobs, loading } = useFetch('/api/jobs');
  const totalInvoiced = jobs?.reduce((s,j) => s + (j.total_invoiced || 0), 0) || 0;

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Invoicing Dashboard" description="Track invoices and payments" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3>Total Invoiced</h3><p className="text-2xl font-bold"><CurrencyAmount amount={totalInvoiced} /></p></Card>
        <Link href="/jobs"><Card>View Jobs →</Card></Link>
      </div>
    </div>
  );
}