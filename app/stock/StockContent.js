'use client';

import { useState } from 'react';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import Button from '@/app/components/ui/Button/Button';

export default function StockContent() {
  const [search, setSearch] = useState('');
  const { data: stock, loading, error } = useFetch('/api/stock');
  
  if (loading) return <LoadingSpinner text="Loading stock data..." />;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;
  
  const totalValue = stock?.reduce((sum, item) => sum + ((item.quantity_on_hand || 0) * (item.unit_cost || 0)), 0) || 0;
  const lowStockItems = stock?.filter(item => item.quantity_on_hand <= (item.reorder_level || 5)).length || 0;
  const outOfStock = stock?.filter(item => item.quantity_on_hand === 0).length || 0;
  
  const filteredStock = stock?.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.sku?.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Stock Management" 
        description="Inventory tracking and purchasing"
        actions={
          <div className="flex gap-2">
            <Link href="/stock/movements">
              <Button variant="outline">View Movements</Button>
            </Link>
            <Link href="/stock/purchasing">
              <Button>Purchase Stock</Button>
            </Link>
          </div>
        }
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <h3 className="text-sm text-gray-500">Stock Items</h3>
          <p className="text-2xl font-bold">{stock?.length || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold"><CurrencyAmount amount={totalValue} /></p>
        </Card>
        <Card className={lowStockItems > 0 ? 'border-yellow-400 bg-yellow-50' : ''}>
          <h3 className="text-sm text-gray-500">Low Stock Alerts</h3>
          <p className="text-2xl font-bold text-yellow-700">{lowStockItems}</p>
        </Card>
        <Card className={outOfStock > 0 ? 'border-red-400 bg-red-50' : ''}>
          <h3 className="text-sm text-gray-500">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-700">{outOfStock}</p>
        </Card>
      </div>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md px-4 py-2"
        />
      </div>
      
      {/* Stock Table */}
      <Card title="Current Stock">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Item Name</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Unit Cost</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Total Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.sku || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.quantity_on_hand}</td>
                  <td className="px-4 py-3 text-sm text-right"><CurrencyAmount amount={item.unit_cost || 0} /></td>
                  <td className="px-4 py-3 text-sm text-right">
                    <CurrencyAmount amount={(item.quantity_on_hand || 0) * (item.unit_cost || 0)} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      item.quantity_on_hand === 0 ? 'bg-red-100 text-red-800' :
                      item.quantity_on_hand <= (item.reorder_level || 5) ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity_on_hand === 0 ? 'Out of Stock' :
                       item.quantity_on_hand <= (item.reorder_level || 5) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <Link href={`/stock/${item.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStock.length === 0 && (
            <div className="text-center py-8 text-gray-500">No stock items found</div>
          )}
        </div>
      </Card>
    </div>
  );
}