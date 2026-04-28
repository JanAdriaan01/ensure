'use client';

import { useState } from 'react';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function ScheduleContent() {
  const [view, setView] = useState('week');
  const { data: assignments, loading } = useFetch('/api/schedule/assignments');
  
  if (loading) return <LoadingSpinner text="Loading schedule..." />;
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Work Schedule" 
        description="Manage work orders, crew assignments, and job scheduling"
        actions={
          <div className="flex gap-2">
            <Button variant={view === 'week' ? 'primary' : 'outline'} onClick={() => setView('week')}>
              Week
            </Button>
            <Button variant={view === 'month' ? 'primary' : 'outline'} onClick={() => setView('month')}>
              Month
            </Button>
            <Button>+ New Assignment</Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card title={`${view.charAt(0).toUpperCase() + view.slice(1)} View`}>
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Calendar coming soon</p>
              <p className="text-sm mt-2">Interactive schedule calendar will be available in the next update</p>
            </div>
          </Card>
        </div>
        
        {/* Upcoming Assignments */}
        <div>
          <Card title="Upcoming Assignments">
            <div className="space-y-3">
              {assignments?.slice(0, 5).map((assignment) => (
                <Link href={`/schedule/${assignment.id}`} key={assignment.id}>
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <p className="font-medium">{assignment.job_title || 'Untitled Job'}</p>
                    <p className="text-sm text-gray-500">
                      {assignment.date} • {assignment.crew_count || 0} crew members
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      assignment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.status || 'Pending'}
                    </span>
                  </div>
                </Link>
              ))}
              {(!assignments || assignments.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  No upcoming assignments
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t">
              <Link href="/schedule/assignments" className="text-blue-600 text-sm">
                View all assignments →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}