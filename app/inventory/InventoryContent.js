'use client';

import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function InventoryContent() {
  const { data: stock, loading } = useFetch('/api/stock');

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Inventory Dashboard" description="Stock management overview" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3>Stock Items</h3><p className="text-2xl font-bold">{stock?.length || 0}</p></Card>
        <Link href="/stock/purchasing"><Card>Purchase Stock →</Card></Link>
      </div>
    </div>
  );
}