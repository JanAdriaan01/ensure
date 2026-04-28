'use client';

import { useState } from 'react';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function PurchasingContent() {
  const [activeTab, setActiveTab] = useState('requisitions');
  const { data: stock, loading: stockLoading } = useFetch('/api/stock');
  const { data: purchaseOrders, loading: poLoading } = useFetch('/api/stock/purchasing/orders');
  
  if (stockLoading || poLoading) return <LoadingSpinner text="Loading purchasing data..." />;
  
  const lowStockItems = stock?.filter(item => item.quantity_on_hand <= (item.reorder_level || 5)) || [];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Stock Purchasing" 
        description="Create purchase orders and manage procurement"
        actions={
          <Link href="/stock">
            <Button variant="outline">← Back to Stock</Button>
          </Link>
        }
      />
      
      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('requisitions')}
            className={`pb-2 px-1 ${activeTab === 'requisitions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Create Requisition
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-1 ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-2 px-1 ${activeTab === 'suppliers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Suppliers
          </button>
        </div>
      </div>
      
      {/* Requisition Form */}
      {activeTab === 'requisitions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="New Purchase Requisition">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Supplier</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>— Select Supplier —</option>
                    <option>Builders Warehouse</option>
                    <option>Chamberlain's</option>
                    <option>Local Hardware</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Add Items</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select className="flex-1 border rounded-md px-3 py-2">
                        <option>Select stock item</option>
                        {stock?.map(item => (
                          <option key={item.id}>{item.name} (Stock: {item.quantity_on_hand})</option>
                        ))}
                      </select>
                      <input type="number" placeholder="Qty" className="w-24 border rounded-md px-3 py-2" />
                      <Button size="sm">Add</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Save as Draft</Button>
                    <Button>Submit for Approval</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <Card title="Low Stock Items">
              {lowStockItems.length === 0 ? (
                <p className="text-gray-500">No low stock items</p>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Stock: {item.quantity_on_hand}</p>
                      </div>
                      <Button size="sm" variant="outline">Add</Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
      
      {/* Purchase Orders List */}
      {activeTab === 'orders' && (
        <Card title="Purchase Orders">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left">PO #</th>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No purchase orders yet. Create your first requisition above.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      {/* Suppliers List */}
      {activeTab === 'suppliers' && (
        <Card title="Suppliers">
          <div className="text-center py-8 text-gray-500">
            <p>Supplier management coming soon</p>
            <Button variant="outline" className="mt-2">Add Supplier</Button>
          </div>
        </Card>
      )}
    </div>
  );
}