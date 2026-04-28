'use client';

import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function FinancialContent() {
  const { data: jobs, loading } = useFetch('/api/jobs');

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Financial Dashboard" description="Overview of financial metrics" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3>Active Jobs</h3><p className="text-2xl font-bold">{jobs?.length || 0}</p></Card>
        <Card><h3>Total Value</h3><p className="text-2xl font-bold">R {(jobs?.reduce((s,j)=>s+(j.po_amount||0),0)).toLocaleString()}</p></Card>
        <Link href="/jobs"><Card>View Jobs →</Card></Link>
      </div>
    </div>
  );
}