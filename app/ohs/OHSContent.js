'use client';

import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';

export default function OHSContent() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="OHS Compliance" 
        description="Occupational Health and Safety management"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Report Incident</Button>
            <Button>Schedule Audit</Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <h3 className="text-sm text-gray-500">Days Since Last Incident</h3>
          <p className="text-2xl font-bold text-green-600">127</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Open Incidents</h3>
          <p className="text-2xl font-bold">0</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Training Completed</h3>
          <p className="text-2xl font-bold">42</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Audits Due</h3>
          <p className="text-2xl font-bold text-yellow-600">3</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Recent Incidents">
          <div className="text-center py-8 text-gray-500">
            <p>No recent incidents reported</p>
            <Button variant="outline" size="sm" className="mt-2">Report Incident</Button>
          </div>
        </Card>
        
        <Card title="Upcoming Audits">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <div>
                <p className="font-medium">Site Safety Inspection</p>
                <p className="text-sm text-gray-500">Due: May 15, 2026</p>
              </div>
              <Button size="sm" variant="outline">Schedule</Button>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <div>
                <p className="font-medium">Equipment Certification Review</p>
                <p className="text-sm text-gray-500">Due: May 20, 2026</p>
              </div>
              <Button size="sm" variant="outline">Schedule</Button>
            </div>
          </div>
        </Card>
      </div>
      
      <Card title="Compliance Documents" className="mt-6">
        <div className="text-center py-8 text-gray-500">
          <p>OHS policies, risk assessments, and certificates will appear here</p>
        </div>
      </Card>
    </div>
  );
}