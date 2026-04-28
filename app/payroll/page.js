'use client'

'use client';

import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function PayrollPage() {
  const { data: employees, loading } = useFetch('/api/employees');

  if (loading) return <LoadingSpinner text="Loading payroll..." />;

  const totalPayroll = employees?.reduce((sum, e) => sum + ((e.hourly_rate || 0) * (e.total_hours_worked || 0)), 0) || 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader title="💰 Payroll" description="Employee compensation management" />
      
      <div className="stats-grid">
        <Card><div className="stat-value">{employees?.length || 0}</div><div className="stat-label">Employees</div></Card>
        <Card><div className="stat-value"><CurrencyAmount amount={totalPayroll} /></div><div className="stat-label">Estimated Monthly Payroll</div></Card>
      </div>

      <div className="payroll-table">
        <table>
          <thead><tr><th>Employee</th><th>Hourly Rate</th><th>Hours Worked</th><th>Total</th></tr></thead>
          <tbody>
            {employees?.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name} {emp.surname}</td>
                <td><CurrencyAmount amount={emp.hourly_rate || 0} />/hr</td>
                <td>{Math.round(emp.total_hours_worked || 0)} hrs</td>
                <td><CurrencyAmount amount={(emp.hourly_rate || 0) * (emp.total_hours_worked || 0)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .stat-value { font-size: 1.5rem; font-weight: bold; }
        .stat-label { font-size: 0.75rem; color: #6b7280; }
        .payroll-table { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
      `}</style>
    </div>
  );
}
