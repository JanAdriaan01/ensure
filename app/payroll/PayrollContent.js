'use client';

import { useState } from 'react';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import { useFetch } from '@/app/hooks/useFetch';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import Button from '@/app/components/ui/Button/Button';

export default function PayrollContent() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data: employees, loading, error } = useFetch('/api/employees');
  
  // Calculate estimated payroll for current month
  const calculatePayroll = () => {
    if (!employees) return 0;
    return employees.reduce((total, employee) => {
      const hoursWorked = employee.monthly_hours?.[selectedMonth] || employee.total_hours_worked || 0;
      const rate = employee.hourly_rate || 0;
      return total + (hoursWorked * rate);
    }, 0);
  };

  const calculateTotalHours = () => {
    if (!employees) return 0;
    return employees.reduce((total, employee) => {
      return total + (employee.monthly_hours?.[selectedMonth] || employee.total_hours_worked || 0);
    }, 0);
  };

  const pendingApprovals = employees?.filter(e => e.pending_payroll_approval).length || 0;

  if (loading) return <LoadingSpinner text="Loading employee data..." />;
  if (error) return <div className="p-6 text-red-600">Error loading payroll data: {error.message}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Payroll Dashboard" 
        description="Employee compensation and payroll management"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/payroll/history'}>
              View History
            </Button>
            <Button onClick={() => window.location.href = '/payroll/run'}>
              Run Payroll
            </Button>
          </div>
        }
      />
      
      {/* Month Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded-md px-3 py-2"
        />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <h3 className="text-sm text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold">{employees?.length || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Total Hours (Month)</h3>
          <p className="text-2xl font-bold">{calculateTotalHours().toLocaleString()}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Estimated Payroll</h3>
          <p className="text-2xl font-bold">
            <CurrencyAmount amount={calculatePayroll()} />
          </p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-500">Pending Approvals</h3>
          <p className="text-2xl font-bold">{pendingApprovals}</p>
          {pendingApprovals > 0 && (
            <Button size="sm" variant="outline" className="mt-2">
              Review → 
            </Button>
          )}
        </Card>
      </div>
      
      {/* Recent Time Entries Table */}
      <Card title="Recent Time Entries">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Job</th>
                <th className="px-4 py-2 text-right">Hours</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through recent time entries */}
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Time entries will appear here
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}