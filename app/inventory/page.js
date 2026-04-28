'use client';

import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function InventoryPage() {
  const { data: stock, loading } = useFetch('/api/stock');

  if (loading) return <LoadingSpinner text="Loading inventory..." />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="📦 Inventory Management" 
        description="Manage stock, purchasing, and materials"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/stock/purchasing">
              <button className="btn">➕ Purchasing</button>
            </Link>
            <Link href="/stock/issued">
              <button className="btn btn-outline">📤 Issued to Jobs</button>
            </Link>
          </div>
        }
      />

      <div className="stats-grid">
        <Card><div className="stat-value">{stock?.length || 0}</div><div className="stat-label">Total Items</div></Card>
        <Card><div className="stat-value">{stock?.filter(s => (s.quantity_on_hand || 0) < (s.min_stock_level || 5)).length || 0}</div><div className="stat-label">Low Stock Alert</div></Card>
      </div>

      <div className="stock-grid">
        {stock?.map(item => (
          <Card key={item.id} className={item.quantity_on_hand < item.min_stock_level ? 'low-stock' : ''}>
            <div><strong>{item.item_code}</strong> - {item.item_name}</div>
            <div>On Hand: {item.quantity_on_hand} {item.unit_of_measure || 'units'}</div>
            <div>Cost: <CurrencyAmount amount={item.unit_cost} /></div>
          </Card>
        ))}
      </div>

      <style jsx>{`
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .stat-value { font-size: 1.5rem; font-weight: bold; }
        .stat-label { font-size: 0.75rem; color: #6b7280; }
        .stock-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .low-stock { border-left: 3px solid #f59e0b; background: #fffbeb; }
        .btn { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn-outline { background: transparent; border: 1px solid #2563eb; color: #2563eb; }
        .btn-outline:hover { background: #eff6ff; }
      `}</style>
    </div>
  );
}