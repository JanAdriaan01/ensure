'use client';

import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export default function OperationsContent() {
  const { data: tools, loading: toolsLoading } = useFetch('/api/tools');
  const { data: stock, loading: stockLoading } = useFetch('/api/stock');
  const { data: schedule, loading: scheduleLoading } = useFetch('/api/schedule?upcoming=true');
  
  if (toolsLoading || stockLoading || scheduleLoading) {
    return <LoadingSpinner text="Loading operations data..." />;
  }
  
  const lowStockItems = stock?.filter(s => s.quantity_on_hand <= s.reorder_level).length || 0;
  const toolsCheckedOut = tools?.filter(t => t.status === 'checked_out').length || 0;
  const upcomingJobs = schedule?.length || 0;
  
  const modules = [
    { 
      name: '🔧 Tools Management', 
      href: '/tools', 
      description: 'Track tools, checkouts, and maintenance',
      status: lowStock > 0 ? 'warning' : 'active',
      badge: `${toolsCheckedOut} checked out`
    },
    { 
      name: '📦 Inventory Management', 
      href: '/stock', 
      description: 'Manage stock levels and purchasing',
      status: lowStockItems > 0 ? 'warning' : 'active',
      badge: `${lowStockItems} low stock alerts`
    },
    { 
      name: '📅 Scheduling', 
      href: '/schedule', 
      description: 'Work orders and crew assignments',
      status: 'active',
      badge: `${upcomingJobs} upcoming jobs`
    },
    { 
      name: '🛡️ OHS Compliance', 
      href: '/ohs', 
      description: 'Safety incidents, training, and audits',
      status: 'active',
      badge: 'View reports'
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Operations Dashboard" 
        description="Tools, inventory, scheduling, and safety management"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Link href={module.href} key={module.name}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">{module.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  module.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {module.badge}
                </span>
              </div>
              <p className="text-gray-500 mt-2">{module.description}</p>
              <div className="mt-4 text-blue-600 text-sm">View Dashboard →</div>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <h3 className="text-sm text-gray-500">Active Tools</h3>
          <p className="text-2xl font-bold">{tools?.filter(t => t.status === 'available').length || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Stock Items</h3>
          <p className="text-2xl font-bold">{stock?.length || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">This Week's Jobs</h3>
          <p className="text-2xl font-bold">{upcomingJobs}</p>
        </Card>
      </div>
    </div>
  );
}