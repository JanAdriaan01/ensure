'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JobDetailPage({ params }) {
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [jobItems, setJobItems] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [summary, setSummary] = useState({ total_quoted: 0, total_actual: 0, completed_value: 0, over_budget_count: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', description: '', quoted_quantity: '', quoted_unit_price: '' });
  const [newAssignment, setNewAssignment] = useState({ employee_id: '', role: '', estimated_hours: '' });
  const [newAttendance, setNewAttendance] = useState({ date: '', hours: '', notes: '' });

  useEffect(() => {
    fetchAllData();
  }, [params.id]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchJobDetails(),
      fetchJobItems(),
      fetchAssignments(),
      fetchEmployees(),
      fetchClients(),
      fetchAttendanceLogs()
    ]);
    setLoading(false);
  };

  const fetchJobDetails = async () => {
    const res = await fetch(`/api/jobs/${params.id}`);
    const data = await res.json();
    setJob(data.job);
  };

  const fetchJobItems = async () => {
    const res = await fetch(`/api/jobs/${params.id}/items`);
    const data = await res.json();
    setJobItems(data.items || []);
    setSummary(data.summary || { total_quoted: 0, total_actual: 0, completed_value: 0, over_budget_count: 0 });
  };

  const fetchAssignments = async () => {
    const res = await fetch(`/api/jobs/${params.id}/assignments`);
    setAssignments(await res.json());
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    setEmployees(await res.json());
  };

  const fetchClients = async () => {
    const res = await fetch('/api/clients');
    setClients(await res.json());
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
      setShowAddItemModal(false);
      setNewItem({ item_name: '', description: '', quoted_quantity: '', quoted_unit_price: '' });
      fetchJobItems();
    } else {
      alert('Failed to add item');
    }
  };

  const completeItem = async (itemId, actual_quantity, actual_cost) => {
    const completedBy = prompt('Enter your employee ID:');
    if (!completedBy) return;
    
    const res = await fetch(`/api/jobs/${params.id}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, actual_quantity: parseFloat(actual_quantity), actual_cost: parseFloat(actual_cost), completed_by: parseInt(completedBy) })
    });
    const result = await res.json();
    if (res.ok) {
      if (result.is_over_budget) {
        alert('⚠️ WARNING: This item is OVER BUDGET! Please review.');
      }
      fetchJobItems();
    } else {
      alert('Failed to complete item');
    }
  };

  const assignEmployee = async (e) => {
    e.preventDefault();
    await fetch(`/api/jobs/${params.id}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment)
    });
    setShowAssignModal(false);
    setNewAssignment({ employee_id: '', role: '', estimated_hours: '' });
    fetchAssignments();
  };

  const addAttendance = async (e) => {
    e.preventDefault();
    if (!newAttendance.date || !newAttendance.hours) {
      alert('Date and hours are required');
      return;
    }
    
    await fetch(`/api/jobs/${params.id}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log_date: newAttendance.date,
        hours_worked: parseFloat(newAttendance.hours),
        notes: newAttendance.notes
      })
    });
    
    setShowAddAttendanceModal(false);
    setNewAttendance({ date: '', hours: '', notes: '' });
    fetchAttendanceLogs();
  };

  const budgetUtilization = summary.total_quoted > 0 
    ? (summary.total_actual / summary.total_quoted * 100).toFixed(1)
    : 0;
  const isOverBudget = summary.total_actual > summary.total_quoted;
  const client = clients.find(c => c.id === job?.client_id);

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="loading">Job not found</div>;

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <Link href="/jobs" className="back-link">← Back to Jobs</Link>
        <div className="header-title">
          <h1>📋 {job.lc_number}</h1>
          {client && <p className="client-name">Client: {client.client_name}</p>}
        </div>
      </div>

      {/* Budget Overview Card */}
      <div className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
        <h3>💰 Budget Overview</h3>
        <div className="budget-stats">
          <div className="budget-stat">
            <span className="label">Total Quoted:</span>
            <span className="value">${summary.total_quoted?.toLocaleString() || 0}</span>
          </div>
          <div className="budget-stat">
            <span className="label">Total Actual:</span>
            <span className={`value ${isOverBudget ? 'text-danger' : ''}`}>${summary.total_actual?.toLocaleString() || 0}</span>
          </div>
          <div className="budget-stat">
            <span className="label">Utilization:</span>
            <span className={`value ${budgetUtilization > 100 ? 'text-danger' : budgetUtilization > 80 ? 'text-warning' : ''}`}>
              {budgetUtilization}%
            </span>
          </div>
          <div className="budget-stat">
            <span className="label">Over Budget Items:</span>
            <span className="value text-danger">{summary.over_budget_count || 0}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(budgetUtilization, 100)}%`, background: budgetUtilization > 100 ? '#dc2626' : budgetUtilization > 80 ? '#f59e0b' : '#10b981' }}></div>
        </div>
        {isOverBudget && <div className="alert alert-danger">⚠️ OVER BUDGET! Total actual costs exceed quoted amount.</div>}
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>📦 Job Items</button>
        <button className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>👥 Team</button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>⏰ Attendance</button>
        <button className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveTab('invoice')}>📄 Invoice</button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="info-grid">
            <div className="info-card">
              <h3>Job Information</h3>
              <p><strong>LC Number:</strong> {job.lc_number}</p>
              <p><strong>PO Status:</strong> <span className={`status-badge status-${job.po_status}`}>{job.po_status}</span></p>
              <p><strong>Completion Status:</strong> <span className={`status-badge status-${job.completion_status?.replace('_', '-')}`}>{job.completion_status}</span></p>
              <p><strong>Created:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
            </div>
            <div className="info-card">
              <h3>Financial Summary</h3>
              <p><strong>Total Budget:</strong> ${job.total_budget?.toLocaleString() || 'Not set'}</p>
              <p><strong>Total Quoted:</strong> ${summary.total_quoted?.toLocaleString() || 0}</p>
              <p><strong>Total Actual:</strong> ${summary.total_actual?.toLocaleString() || 0}</p>
              <p><strong>Completed Value:</strong> ${summary.completed_value?.toLocaleString() || 0}</p>
            </div>
            <div className="info-card">
              <h3>Team Summary</h3>
              <p><strong>Assigned Employees:</strong> {assignments.length}</p>
              <p><strong>Total Estimated Hours:</strong> {assignments.reduce((sum, a) => sum + (a.estimated_hours || 0), 0)} hrs</p>
              <p><strong>Attendance Logs:</strong> {attendanceLogs.length}</p>
              <p><strong>Total Hours Logged:</strong> {attendanceLogs.reduce((sum, a) => sum + a.hours_worked, 0)} hrs</p>
            </div>
          </div>
        </div>
      )}

      {/* Job Items Tab */}
      {activeTab === 'items' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Quoted Items</h2>
            <button className="btn-primary-small" onClick={() => setShowAddItemModal(true)}>+ Add Item</button>
          </div>
          
          {jobItems.length === 0 ? (
            <div className="no-data">No items added yet. Add quoted items to track budget.</div>
          ) : (
            <table className="items-table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total Quoted</th><th>Actual Cost</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {jobItems.map(item => (
                  <tr key={item.id} className={item.is_over_budget ? 'over-budget-row' : ''}>
                    <td><strong>{item.item_name}</strong><br/><small>{item.description}</small></td>
                    <td>{item.quoted_quantity}</td>
                    <td>${item.quoted_unit_price}</td>
                    <td>${item.quoted_total}</td>
                    <td>${item.actual_cost || 0}</td>
                    <td>{item.completion_status === 'completed' ? '✅ Completed' : '🔄 Pending'}</td>
                    <td>{item.completion_status !== 'completed' && (
                      <button onClick={() => {
                        const qty = prompt('Enter actual quantity completed:', item.quoted_quantity);
                        const cost = prompt('Enter actual cost:', item.quoted_total);
                        if (qty && cost) completeItem(item.id, qty, cost);
                      }} className="btn-small">Complete</button>
                    )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Assigned Employees</h2>
            <button className="btn-primary-small" onClick={() => setShowAssignModal(true)}>+ Assign Employee</button>
          </div>
          
          {assignments.length === 0 ? (
            <div className="no-data">No employees assigned yet.</div>
          ) : (
            <table className="items-table">
              <thead><tr><th>Employee</th><th>Role</th><th>Est. Hours</th><th>Daily Capacity</th></tr></thead>
              <tbody>
                {assignments.map(ass => (
                  <tr key={ass.employee_id}>
                    <td><strong>{ass.name} {ass.surname}</strong><br/><small>{ass.employee_number}</small></td>
                    <td>{ass.role || '-'}</td>
                    <td>{ass.estimated_hours || 0} hrs</td>
                    <td>{ass.daily_capacity_hours} hrs/day</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Attendance Logs</h2>
            <button className="btn-primary-small" onClick={() => setShowAddAttendanceModal(true)}>+ Add Attendance</button>
          </div>
          
          {attendanceLogs.length === 0 ? (
            <div className="no-data">No attendance logs yet.</div>
          ) : (
            <div className="logs-list">
              {attendanceLogs.map(log => (
                <div key={log.id} className="log-card">
                  <div className="log-date">{new Date(log.log_date).toLocaleDateString()}</div>
                  <div className="log-hours">{log.hours_worked} hours</div>
                  {log.notes && <div className="log-notes">{log.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoice Tab */}
      {activeTab === 'invoice' && (
        <div className="tab-content">
          <div className="invoice-summary">
            <h3>What Can Be Invoiced This Month?</h3>
            <div className="invoice-calc">
              <div className="calc-item"><span>Completed Work Value:</span><strong>${summary.completed_value?.toLocaleString() || 0}</strong></div>
              <div className="calc-item"><span>Already Invoiced:</span><strong>$0</strong></div>
              <div className="calc-item total"><span>Available to Invoice:</span><strong className="text-success">${summary.completed_value?.toLocaleString() || 0}</strong></div>
            </div>
            <div className="progress-label">Progress to Total Budget: {budgetUtilization}%</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(budgetUtilization, 100)}%` }}></div></div>
            <button className="btn-primary" style={{ marginTop: '20px' }}>Generate Invoice</button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Quoted Item</h3>
            <form onSubmit={createJobItem}>
              <input type="text" placeholder="Item Name" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required />
              <textarea placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
              <input type="number" step="0.01" placeholder="Quantity" value={newItem.quoted_quantity} onChange={e => setNewItem({...newItem, quoted_quantity: e.target.value})} required />
              <input type="number" step="0.01" placeholder="Unit Price" value={newItem.quoted_unit_price} onChange={e => setNewItem({...newItem, quoted_unit_price: e.target.value})} required />
              <div className="modal-buttons"><button type="submit">Add</button><button type="button" onClick={() => setShowAddItemModal(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {showAssignModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Assign Employee</h3>
            <form onSubmit={assignEmployee}>
              <select value={newAssignment.employee_id} onChange={e => setNewAssignment({...newAssignment, employee_id: e.target.value})} required>
                <option value="">Select Employee</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} {emp.surname} ({emp.employee_number})</option>)}
              </select>
              <input type="text" placeholder="Role (e.g., Lead Tech)" value={newAssignment.role} onChange={e => setNewAssignment({...newAssignment, role: e.target.value})} />
              <input type="number" step="0.5" placeholder="Estimated Hours" value={newAssignment.estimated_hours} onChange={e => setNewAssignment({...newAssignment, estimated_hours: e.target.value})} />
              <div className="modal-buttons"><button type="submit">Assign</button><button type="button" onClick={() => setShowAssignModal(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attendance Modal */}
      {showAddAttendanceModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Attendance Log</h3>
            <form onSubmit={addAttendance}>
              <input type="date" value={newAttendance.date} onChange={e => setNewAttendance({...newAttendance, date: e.target.value})} required />
              <input type="number" step="0.5" placeholder="Hours Worked" value={newAttendance.hours} onChange={e => setNewAttendance({...newAttendance, hours: e.target.value})} required />
              <textarea placeholder="Notes" value={newAttendance.notes} onChange={e => setNewAttendance({...newAttendance, notes: e.target.value})} />
              <div className="modal-buttons"><button type="submit">Save</button><button type="button" onClick={() => setShowAddAttendanceModal(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .back-link { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 1rem; }
        .back-link:hover { color: #2563eb; }
        .header { margin-bottom: 1.5rem; }
        .header-title h1 { margin: 0; }
        .client-name { color: #6b7280; margin: 0.25rem 0 0 0; }
        
        .budget-card { background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .budget-card.over-budget { border: 2px solid #dc2626; background: #fef2f2; }
        .budget-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
        .budget-stat { display: flex; justify-content: space-between; padding: 0.5rem; background: #f9fafb; border-radius: 0.5rem; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
        .alert { padding: 0.75rem; border-radius: 0.5rem; margin-top: 1rem; }
        .alert-danger { background: #fee2e2; color: #991b1b; }
        .text-danger { color: #dc2626; }
        .text-warning { color: #f59e0b; }
        .text-success { color: #10b981; }
        
        .tab-nav { display: flex; gap: 0.5rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .tab-btn { padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; }
        .tab-btn.active { color: #2563eb; border-bottom: 2px solid #2563eb; }
        
        .tab-content { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .info-card { padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
        .info-card h3 { margin: 0 0 0.75rem 0; font-size: 1rem; }
        .info-card p { margin: 0.5rem 0; font-size: 0.875rem; }
        
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .items-table th { background: #f9fafb; }
        .over-budget-row { background: #fef2f2; }
        
        .logs-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .log-card { background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #2563eb; }
        .log-date { font-weight: 600; }
        .log-hours { font-size: 0.875rem; color: #6b7280; }
        .log-notes { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }
        
        .invoice-summary { text-align: center; }
        .invoice-calc { max-width: 400px; margin: 1rem auto; }
        .calc-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
        .calc-item.total { font-size: 1.25rem; font-weight: bold; border-bottom: none; }
        
        .status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-not_started { background: #e5e7eb; color: #374151; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }
        
        .btn-primary-small { background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; border: none; cursor: pointer; font-size: 0.75rem; }
        .btn-small { background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: none; cursor: pointer; font-size: 0.7rem; }
        .btn-primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; }
        
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 1.5rem; border-radius: 0.75rem; width: 400px; max-width: 90%; }
        .modal-buttons { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .modal-buttons button { flex: 1; }
        input, select, textarea { width: 100%; padding: 0.5rem; margin-bottom: 0.75rem; border: 1px solid #ddd; border-radius: 0.375rem; }
        
        .loading { text-align: center; padding: 3rem; }
        .no-data { text-align: center; padding: 2rem; color: #6b7280; }
        
        @media (max-width: 768px) { .container { padding: 1rem; } .budget-stats { grid-template-columns: 1fr; } .info-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}