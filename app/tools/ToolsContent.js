'use client';

import { useState } from 'react';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';

export default function ToolsContent() {
  const [search, setSearch] = useState('');
  const { data: tools, loading, error } = useFetch('/api/tools');
  
  if (loading) return <LoadingSpinner text="Loading tools data..." />;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;
  
  const totalTools = tools?.length || 0;
  const availableTools = tools?.filter(t => t.status === 'available').length || 0;
  const checkedOutTools = tools?.filter(t => t.status === 'checked_out').length || 0;
  const maintenanceTools = tools?.filter(t => t.status === 'maintenance').length || 0;
  const overdueTools = tools?.filter(t => t.status === 'checked_out' && new Date(t.expected_return) < new Date()).length || 0;
  
  const filteredTools = tools?.filter(tool => 
    tool.name?.toLowerCase().includes(search.toLowerCase()) ||
    tool.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
    tool.category?.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Tools Management" 
        description="Track tools, equipment, and checkouts"
        actions={
          <div className="flex gap-2">
            <Link href="/tools/checkout">
              <Button>Checkout Tool</Button>
            </Link>
            <Link href="/tools/new">
              <Button variant="outline">+ Add Tool</Button>
            </Link>
          </div>
        }
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <h3 className="text-sm text-gray-500">Total Tools</h3>
          <p className="text-2xl font-bold">{totalTools}</p>
        </Card>
        <Card className="bg-green-50">
          <h3 className="text-sm text-gray-500">Available</h3>
          <p className="text-2xl font-bold text-green-700">{availableTools}</p>
        </Card>
        <Card className="bg-blue-50">
          <h3 className="text-sm text-gray-500">Checked Out</h3>
          <p className="text-2xl font-bold text-blue-700">{checkedOutTools}</p>
        </Card>
        <Card className="bg-yellow-50">
          <h3 className="text-sm text-gray-500">Maintenance</h3>
          <p className="text-2xl font-bold text-yellow-700">{maintenanceTools}</p>
        </Card>
        {overdueTools > 0 && (
          <Card className="bg-red-50">
            <h3 className="text-sm text-gray-500">Overdue</h3>
            <p className="text-2xl font-bold text-red-700">{overdueTools}</p>
          </Card>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name, serial number, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-md px-4 py-2"
        />
        <Link href="/tools/checkout/history">
          <Button variant="outline">Checkout History</Button>
        </Link>
      </div>
      
      {/* Tools Table */}
      <Card title="Tool Inventory">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium">Tool Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Serial #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Checked Out By</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Expected Return</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{tool.name}</td>
                  <td className="px-4 py-3 text-sm">{tool.category || '—'}</td>
                  <td className="px-4 py-3 text-sm">{tool.serial_number || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      tool.status === 'available' ? 'bg-green-100 text-green-800' :
                      tool.status === 'checked_out' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tool.status === 'checked_out' ? 'Checked Out' : 
                       tool.status === 'maintenance' ? 'Maintenance' : 'Available'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{tool.checked_out_by_name || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {tool.expected_return ? new Date(tool.expected_return).toLocaleDateString() : '—'}
                    {tool.expected_return && new Date(tool.expected_return) < new Date() && tool.status === 'checked_out' && (
                      <span className="ml-2 text-red-600 text-xs">(Overdue)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {tool.status === 'available' ? (
                      <Link href={`/tools/checkout?tool=${tool.id}`} className="text-blue-600 hover:underline">
                        Checkout
                      </Link>
                    ) : tool.status === 'checked_out' ? (
                      <Link href={`/tools/return?tool=${tool.id}`} className="text-green-600 hover:underline">
                        Return
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
          {filteredTools.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search ? 'No tools match your search' : 'No tools found. Add your first tool.'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}