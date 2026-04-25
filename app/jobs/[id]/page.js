'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Tabs from '@/app/components/ui/Tabs/Tabs';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import StatusBadge from '@/app/components/common/StatusBadge';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import EmptyState from '@/app/components/ui/EmptyState/EmptyState';
import Modal from '@/app/components/ui/Modal/Modal';
import { FormInput, FormSelect, FormTextarea, FormCurrencyInput } from '@/app/components/ui/Form';
import EmployeeSelect from '@/app/components/common/EmployeeSelect';

export default function JobDetailPage({ params }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: jobData, loading, refetch } = useFetch(`/api/jobs/${params.id}`);
  const [job, setJob] = useState(null);
  const [jobItems, setJobItems] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [summary, setSummary] = useState({ total_quoted: 0, total_actual: 0, completed_value: 0 });
  
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  
  const [newItem, setNewItem] = useState({ item_name: '', description: '', quoted_quantity: '', quoted_unit_price: '' });
  const [newAssignment, setNewAssignment] = useState({ employee_id: '', role: '', estimated_hours: '' });
  const [newAttendance, setNewAttendance] = useState({ date: '', hours: '', notes: '' });

  useEffect(() => {
    if (jobData) {
      setJob(jobData.job);
      fetchJobItems();
      fetchAssignments();
      fetchAttendanceLogs();
    }
  }, [jobData]);

  const fetchJobItems = async () => {
    const res = await fetch(`/api/jobs/${params.id}/items`);
    const data = await res.json();
    setJobItems(data.items || []);
    setSummary(data.summary || { total_quoted: 0, total_actual: 0, completed_value: 0 });
  };

  const fetchAssignments = async () => {
    const res = await fetch(`/api/jobs/${params.id}/assignments`);
    setAssignments(await res.json());
  };

  const fetchAttendanceLogs = async () => {
    const res = await fetch(`/api/jobs/${params.id}`);
    const data = await res.json();
    setAttendanceLogs(data.logs || []);
  };

  const createJobItem = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/jobs/${params.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_name: newItem.item_name,
        description: newItem.description,
        quoted_quantity: parseFloat(newItem.quoted_quantity),
        quoted_unit_price: parseFloat(newItem.quoted_unit_price)
      })
    });
    if (res.ok) {
      success('Item added');
      setShowAddItemModal(false);
      setNewItem({ item_name: '', description: '', quoted_quantity: '', quoted_unit_price: '' });
      fetchJobItems();
    } else {
      toastError('Failed to add item');
    }
  };

  const assignEmployee = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/jobs/${params.id}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment)
    });
    if (res.ok) {
      success('Employee assigned');
      setShowAssignModal(false);
      setNewAssignment({ employee_id: '', role: '', estimated_hours: '' });
      fetchAssignments();
    } else {
      toastError('Failed to assign employee');
    }
  };

  const addAttendance = async (e) => {
    e.preventDefault();
    if (!newAttendance.date || !newAttendance.hours) {
      toastError('Date and hours required');
      return;
    }
    const res = await fetch(`/api/jobs/${params.id}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log_date: newAttendance.date,
        hours_worked: parseFloat(newAttendance.hours),
        notes: newAttendance.notes
      })
    });
    if (res.ok) {
      success('Attendance logged');
      setShowAddAttendanceModal(false);
      setNewAttendance({ date: '', hours: '', notes: '' });
      fetchAttendanceLogs();
    } else {
      toastError('Failed to add attendance');
    }
  };

  const budgetUtilization = summary.total_quoted > 0 ? (summary.total_actual / summary.total_quoted * 100).toFixed(1) : 0;
  const isOverBudget = summary.total_actual > summary.total_quoted;

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (!job) return <EmptyState title="Job not found" message="The job you're looking for doesn't exist." />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'items', label: 'Job Items', icon: '📦' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '⏰' },
    { id: 'invoicing', label: 'Invoicing', icon: '💰' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title={`📋 ${job.lc_number}`}
        description={`Client: ${job.client_name || 'N/A'} | Created: ${new Date(job.created_at).toLocaleDateString()}`}
        action={<Link href="/jobs"><Button variant="secondary">← Back to Jobs</Button></Link>}
      />

      {/* Budget Overview Card */}
      <Card variant="stat" className={isOverBudget ? 'over-budget' : ''}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div><strong>💰 Budget Overview</strong></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>Quoted: <CurrencyAmount amount={summary.total_quoted} /></div>
            <div>Actual: <CurrencyAmount amount={summary.total_actual} /></div>
            <div>Utilization: {budgetUtilization}%</div>
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(budgetUtilization, 100)}%`, height: '100%', background: isOverBudget ? '#dc2626' : budgetUtilization > 80 ? '#f59e0b' : '#10b981' }} />
        </div>
        {isOverBudget && <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.75rem' }}>⚠️ OVER BUDGET! Actual costs exceed quoted amount.</div>}
      </Card>

      <Tabs tabs={tabs} defaultTab="overview">
        {/* Overview Tab */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <Card><h3>Job Information</h3><p><strong>LC Number:</strong> {job.lc_number}</p><p><strong>PO Status:</strong> <StatusBadge status={job.po_status} /></p><p><strong>Completion:</strong> <StatusBadge status={job.completion_status} /></p></Card>
            <Card><h3>Financial Summary</h3><p><strong>PO Amount:</strong> <CurrencyAmount amount={job.po_amount || 0} /></p><p><strong>Total Quoted:</strong> <CurrencyAmount amount={summary.total_quoted} /></p><p><strong>Total Actual:</strong> <CurrencyAmount amount={summary.total_actual} /></p></Card>
            <Card><h3>Team Summary</h3><p><strong>Assigned Employees:</strong> {assignments.length}</p><p><strong>Attendance Logs:</strong> {attendanceLogs.length}</p><p><strong>Total Hours Logged:</strong> {attendanceLogs.reduce((sum, a) => sum + a.hours_worked, 0)} hrs</p></Card>
          </div>
        </div>

        {/* Items Tab */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Quoted Items</h3>
            <Button onClick={() => setShowAddItemModal(true)}>+ Add Item</Button>
          </div>
          {jobItems.length === 0 ? <EmptyState message="No items added yet." /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Quoted Total</th><th>Actual Cost</th><th>Status</th></tr></thead>
              <tbody>
                {jobItems.map(item => (
                  <tr key={item.id} style={{ background: item.is_over_budget ? '#fee2e2' : 'transparent' }}>
                    <td><strong>{item.item_name}</strong><br/><small>{item.description}</small></td>
                    <td>{item.quoted_quantity}</td>
                    <td><CurrencyAmount amount={item.quoted_unit_price} /></td>
                    <td><CurrencyAmount amount={item.quoted_total} /></td>
                    <td><CurrencyAmount amount={item.actual_cost || 0} /></td>
                    <td><StatusBadge status={item.completion_status === 'completed' ? 'completed' : 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Team Tab */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Assigned Employees</h3>
            <Button onClick={() => setShowAssignModal(true)}>+ Assign Employee</Button>
          </div>
          {assignments.length === 0 ? <EmptyState message="No employees assigned yet." /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th>Employee</th><th>Role</th><th>Est. Hours</th></tr></thead>
              <tbody>
                {assignments.map(ass => (
                  <tr key={ass.employee_id}><td>{ass.name} {ass.surname}</td><td>{ass.role || '-'}</td><td>{ass.estimated_hours || 0} hrs</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Attendance Tab */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Attendance Logs</h3>
            <Button onClick={() => setShowAddAttendanceModal(true)}>+ Add Attendance</Button>
          </div>
          {attendanceLogs.length === 0 ? <EmptyState message="No attendance logs yet." /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th>Date</th><th>Hours</th><th>Notes</th></tr></thead>
              <tbody>
                {attendanceLogs.map(log => (
                  <tr key={log.id}><td>{new Date(log.log_date).toLocaleDateString()}</td><td>{log.hours_worked} hrs</td><td>{log.notes || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invoicing Tab - placeholder for now */}
        <div>
          <Card><h3>Invoicing Summary</h3><p>Completed Work Value: <CurrencyAmount amount={summary.completed_value} /></p><p>Available to Invoice: <CurrencyAmount amount={summary.completed_value} /></p><Button>Generate Invoice</Button></Card>
        </div>
      </Tabs>

      {/* Modals */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Add Job Item">
        <form onSubmit={createJobItem}>
          <FormInput label="Item Name" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required />
          <FormTextarea label="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
          <FormInput label="Quantity" type="number" step="0.01" value={newItem.quoted_quantity} onChange={e => setNewItem({...newItem, quoted_quantity: e.target.value})} required />
          <FormCurrencyInput label="Unit Price" value={newItem.quoted_unit_price} onChange={e => setNewItem({...newItem, quoted_unit_price: e.target.value})} required />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit">Add Item</Button>
            <Button variant="secondary" onClick={() => setShowAddItemModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Employee">
        <form onSubmit={assignEmployee}>
          <EmployeeSelect value={newAssignment.employee_id} onChange={e => setNewAssignment({...newAssignment, employee_id: e.target.value})} required />
          <FormInput label="Role" value={newAssignment.role} onChange={e => setNewAssignment({...newAssignment, role: e.target.value})} />
          <FormInput label="Estimated Hours" type="number" step="0.5" value={newAssignment.estimated_hours} onChange={e => setNewAssignment({...newAssignment, estimated_hours: e.target.value})} />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit">Assign</Button>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddAttendanceModal} onClose={() => setShowAddAttendanceModal(false)} title="Add Attendance">
        <form onSubmit={addAttendance}>
          <FormInput label="Date" type="date" value={newAttendance.date} onChange={e => setNewAttendance({...newAttendance, date: e.target.value})} required />
          <FormInput label="Hours Worked" type="number" step="0.5" value={newAttendance.hours} onChange={e => setNewAttendance({...newAttendance, hours: e.target.value})} required />
          <FormTextarea label="Notes" value={newAttendance.notes} onChange={e => setNewAttendance({...newAttendance, notes: e.target.value})} />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={() => setShowAddAttendanceModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}