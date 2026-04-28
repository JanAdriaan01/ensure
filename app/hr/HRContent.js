'use client';

import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function HRContent() {
  const { data: employees, loading } = useFetch('/api/employees');

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="HR Dashboard" description="Employee management overview" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3>Total Employees</h3><p className="text-2xl font-bold">{employees?.length || 0}</p></Card>
        <Link href="/employees"><Card>View Employees →</Card></Link>
        <Link href="/employees/new"><Card>Add Employee →</Card></Link>
      </div>
    </div>
  );
}