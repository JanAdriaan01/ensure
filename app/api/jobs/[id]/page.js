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
  const [summary, setSummary] = useState({ total_quoted: 0, total_actual: 0, completed_value: 0, over_budget_count: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', description: '', quoted_quantity: '', quoted_unit_price: '' });
  const [newAssignment, setNewAssignment] = useState({ employee_id: '', role: '', estimated_hours: '' });

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
      fetchClients()
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
      body: JSON.stringify({ itemId, actual_quantity, actual_cost, completed_by: parseInt(completedBy) })
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

  const budgetUtilization = summary.total_quoted > 0 
    ? (summary.total_actual / summary.total_quoted * 100).toFixed(1)
    : 0;
  const isOverBudget = summary.total_actual > summary.total_quoted;

  if (loading) return <div className="loading">Loading job details...</div>;

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <Link href="/" className="back-link">← Back to Dashboard</Link>
        <h1>📋 {job?.lc_number}</h1>
        {job?.client_id && <p className="client-name">Client: {clients.find(c => c.id === job.client_id)?.client_name}</p>}
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
        <button className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>📦 Job Items</button>
        <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>👥 Team Assignments</button>
        <button className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveTab('invoice')}>📄 Monthly Invoice</button>
      </div>

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
                        if (qty && cost) completeItem(item.id, parseFloat(qty), parseFloat(cost));
                      }} className="btn-small">Complete</button>
                    )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Team Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Assigned Employees</h2>
            <button className="btn-primary-small" onClick={() => setShowAssignModal(true)}>+ Assign Employee</button>
          </div>
          
          {assignments.length === 0 ? (
            <div className="no-data">No employees assigned yet.</div>
          ) : (
            <table className="items-table">
              <thead><tr><th>Employee</th><th>Role</th><th>Est. Hours</th><th>Daily Capacity</th><th>Status</th></tr></thead>
              <tbody>
                {assignments.map(ass => (
                  <tr key={ass.employee_id}>
                    <td>{ass.name} {ass.surname}<br/><small>{ass.employee_number}</small></td>
                    <td>{ass.role || '-'}</td>
                    <td>{ass.estimated_hours || 0} hrs</td>
                    <td>{ass.daily_capacity_hours} hrs/day</td>
                    <td>🟢 Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Invoice Tab */}
      {activeTab === 'invoice' && (
        <div className="tab-content">
          <div className="invoice-summary">
            <h3>What Can Be Invoiced This Month?</h3>
            <div className="invoice-calc">
              <div className="calc-item">
                <span>Completed Work Value:</span>
                <strong>${summary.completed_value?.toLocaleString() || 0}</strong>
              </div>
              <div className="calc-item">
                <span>Already Invoiced:</span>
                <strong>$0</strong>
              </div>
              <div className="calc-item total">
                <span>Available to Invoice:</span>
                <strong className="text-success">${summary.completed_value?.toLocaleString() || 0}</strong>
              </div>
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

      <style jsx>{`
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .back-link { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 1rem; }
        .budget-card { background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .budget-card.over-budget { border: 2px solid #dc2626; background: #fef2f2; }
        .budget-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
        .budget-stat { display: flex; justify-content: space-between; padding: 0.5rem; background: #f9fafb; border-radius: 0.5rem; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 0.5rem 0; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
        .alert { padding: 0.75rem; border-radius: 0.5rem; margin-top: 1rem; }
        .alert-danger { background: #fee2e2; color: #991b1b; }
        .text-danger { color: #dc2626; }
        .text-warning { color: #f59e0b; }
        .text-success { color: #10b981; }
        .tab-nav { display: flex; gap: 0.5rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
        .tab-btn { padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; }
        .tab-btn.active { color: #2563eb; border-bottom: 2px solid #2563eb; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .items-table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.5rem; overflow: hidden; }
        .items-table th, .items-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .over-budget-row { background: #fef2f2; }
        .invoice-summary { background: white; padding: 1.5rem; border-radius: 0.75rem; }
        .invoice-calc { margin: 1rem 0; }
        .calc-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
        .calc-item.total { font-size: 1.25rem; font-weight: bold; border-bottom: none; margin-top: 0.5rem; padding-top: 0.5rem; }
        .progress-label { font-size: 0.875rem; color: #6b7280; margin-top: 1rem; }
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 1.5rem; border-radius: 0.75rem; width: 400px; max-width: 90%; }
        .modal-buttons { display: flex; gap: 0.5rem; margin-top: 1rem; }
        input, select, textarea { width: 100%; padding: 0.5rem; margin-bottom: 0.75rem; border: 1px solid #ddd; border-radius: 0.25rem; }
        .btn-primary, .btn-primary-small { background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; }
        .btn-primary-small { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        .btn-small { background: #10b981; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; }
        .loading { text-align: center; padding: 3rem; }
        @media (max-width: 768px) { .budget-stats { grid-template-columns: 1fr; } .container { padding: 1rem; } }
      `}</style>
    </div>
  );
}