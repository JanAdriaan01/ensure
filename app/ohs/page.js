'use client'

'use client';

import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';

export default function OHSPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="🛡️ OHS Compliance" description="Occupational Health and Safety Management" />
      
      <div className="grid">
        <Card>
          <h3>📋 Safety Policies</h3>
          <p>Company safety policies and procedures</p>
          <button className="btn">View Policies</button>
        </Card>
        <Card>
          <h3>⚠️ Incident Reporting</h3>
          <p>Report and track safety incidents</p>
          <button className="btn">Report Incident</button>
        </Card>
        <Card>
          <h3>📊 Compliance Calendar</h3>
          <p>Track safety training and certification renewals</p>
          <button className="btn">View Calendar</button>
        </Card>
        <Card>
          <h3>📝 Risk Assessments</h3>
          <p>Job-specific risk assessments</p>
          <button className="btn">Manage Assessments</button>
        </Card>
      </div>

      <style jsx>{`
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .btn { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; margin-top: 0.5rem; }
      `}</style>
    </div>
  );
}
