// app/components/JobManagement/index.js
'use client';

import { useState, useEffect } from 'react';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/hooks/useToast';
import Button from '@/app/components/ui/Button/Button';
import Modal from '@/app/components/ui/Modal/Modal';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

const TABS = [
  { id: 'overview', label: '📊 Overview', icon: '📊' },
  { id: 'tools', label: '🔧 Tools', icon: '🔧' },
  { id: 'stock', label: '📦 Stock', icon: '📦' },
  { id: 'team', label: '👥 Team', icon: '👥' },
  { id: 'payroll', label: '💰 Payroll', icon: '💰' }
];

export default function JobManagement({ jobId, onUpdate }) {
  const { data: managementData, loading, refetch } = useFetch(`/api/jobs/${jobId}/manage`);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [formData, setFormData] = useState({});

  if (loading) return <LoadingSpinner text="Loading job management..." />;
  if (!managementData?.data) return <div>No job data available</div>;

  const { job, tools, stock, team, payroll, totals } = managementData.data;

  // Check if job is ready for management
  const isJobReady = job.po_status === 'approved';

  if (!isJobReady) {
    return (
      <div className="job-management-disabled">
        <div className="disabled-icon">⏳</div>
        <h3>Job Management Not Yet Available</h3>
        <p>This job is waiting for PO approval. Management features (tools, stock, team, payroll) will be available once the PO is received and approved.</p>
        <div className="job-status">
          <strong>Current Status:</strong> {job.po_status} | {job.completion_status}
        </div>
      </div>
    );
  }

  return (
    <div className="job-management">
      <div className="management-header">
        <h2>Job Management: {job.lc_number}</h2>
        <div className="budget-info">
          <div>Budget: R {parseFloat(job.total_budget || 0).toLocaleString()}</div>
          <div>Actual Cost: R {totals.actual_cost.toLocaleString()}</div>
          <div className={totals.actual_cost > job.total_budget ? 'over-budget' : 'under-budget'}>
            Variance: R {(totals.actual_cost - (job.total_budget || 0)).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="management-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="management-content">
        {activeTab === 'overview' && (
          <OverviewTab job={job} totals={totals} tools={tools} stock={stock} team={team} payroll={payroll} />
        )}
        
        {activeTab === 'tools' && (
          <ToolsTab 
            tools={tools} 
            jobId={jobId} 
            onAction={(action, data) => {
              setModalAction({ type: action, data });
              setShowModal(true);
            }}
            onRefresh={refetch}
          />
        )}
        
        {activeTab === 'stock' && (
          <StockTab 
            stock={stock} 
            jobId={jobId}
            onAction={(action, data) => {
              setModalAction({ type: action, data });
              setShowModal(true);
            }}
            onRefresh={refetch}
          />
        )}
        
        {activeTab === 'team' && (
          <TeamTab 
            team={team} 
            jobId={jobId}
            onAction={(action, data) => {
              setModalAction({ type: action, data });
              setShowModal(true);
            }}
            onRefresh={refetch}
          />
        )}
        
        {activeTab === 'payroll' && (
          <PayrollTab 
            payroll={payroll} 
            jobId={jobId}
            team={team}
            onAction={(action, data) => {
              setModalAction({ type: action, data });
              setShowModal(true);
            }}
            onRefresh={refetch}
          />
        )}
      </div>

      {showModal && modalAction && (
        <ManagementModal
          action={modalAction.type}
          jobId={jobId}
          initialData={modalAction.data}
          onClose={() => {
            setShowModal(false);
            setModalAction(null);
          }}
          onSuccess={() => {
            refetch();
            if (onUpdate) onUpdate();
            setShowModal(false);
            setModalAction(null);
          }}
        />
      )}

      <style jsx>{`
        .job-management {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .job-management-disabled {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
        }

        .disabled-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .management-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .management-header h2 {
          margin: 0 0 0.5rem 0;
        }

        .budget-info {
          display: flex;
          gap: 1.5rem;
          font-size: 0.875rem;
        }

        .over-budget {
          color: #ff6b6b;
        }

        .under-budget {
          color: #51cf66;
        }

        .management-tabs {
          display: flex;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          gap: 0.25rem;
          padding: 0 1rem;
        }

        .tab {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6c757d;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tab:hover {
          color: #495057;
          background: #e9ecef;
        }

        .tab.active {
          color: #667eea;
          border-bottom: 2px solid #667eea;
        }

        .management-content {
          padding: 1.5rem;
          min-height: 400px;
        }
      `}</style>
    </div>
  );
}

// Individual tab components
function OverviewTab({ job, totals, tools, stock, team, payroll }) {
  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-value">{tools.length}</div>
          <div className="stat-label">Tools Assigned</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">R {totals.total_stock_cost.toLocaleString()}</div>
          <div className="stat-label">Stock Cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{team.length}</div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{totals.total_labour_hours}</div>
          <div className="stat-label">Labour Hours</div>
        </div>
      </div>

      <div className="job-details">
        <h3>Job Details</h3>
        <div className="details-grid">
          <div><strong>LC Number:</strong> {job.lc_number}</div>
          <div><strong>PO Number:</strong> {job.po_number || 'N/A'}</div>
          <div><strong>PO Amount:</strong> R {parseFloat(job.po_amount || 0).toLocaleString()}</div>
          <div><strong>Total Budget:</strong> R {parseFloat(job.total_budget || 0).toLocaleString()}</div>
          <div><strong>Actual Cost:</strong> R {totals.actual_cost.toLocaleString()}</div>
          <div><strong>PO Status:</strong> {job.po_status}</div>
          <div><strong>Completion:</strong> {job.completion_status}</div>
          {job.site_address && <div><strong>Site:</strong> {job.site_address}</div>}
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #667eea;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .job-details {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .job-details h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}

function ToolsTab({ tools, jobId, onAction, onRefresh }) {
  return (
    <div>
      <div className="tab-header">
        <Button onClick={() => onAction('assign_tool')}>+ Assign Tool</Button>
      </div>
      {tools.length === 0 ? (
        <div className="empty-state">No tools assigned to this job yet</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Tool</th><th>Quantity</th><th>Issued Date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {tools.map(tool => (
              <tr key={tool.id}>
                <td>{tool.tool_name} ({tool.tool_code})</td>
                <td>{tool.quantity}</td>
                <td>{new Date(tool.issued_date).toLocaleDateString()}</td>
                <td>{tool.status}</td>
                <td>
                  {tool.status === 'issued' && (
                    <Button size="sm" onClick={() => onAction('return_tool', tool)}>
                      Return
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx>{`
        .tab-header {
          margin-bottom: 1rem;
          display: flex;
          justify-content: flex-end;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th, .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }
        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function StockTab({ stock, jobId, onAction, onRefresh }) {
  return (
    <div>
      <div className="tab-header">
        <Button onClick={() => onAction('purchase_stock')}>+ Purchase Stock</Button>
      </div>
      {stock.length === 0 ? (
        <div className="empty-state">No stock purchased for this job yet</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Item</th><th>Quantity</th><th>Unit Cost</th><th>Total</th><th>Purchase Date</th><th>Supplier</th></tr>
          </thead>
          <tbody>
            {stock.map(item => (
              <tr key={item.id}>
                <td>{item.item_name} ({item.sku})</td>
                <td>{item.quantity}</td>
                <td>R {parseFloat(item.unit_cost).toLocaleString()}</td>
                <td>R {parseFloat(item.total_cost).toLocaleString()}</td>
                <td>{new Date(item.purchase_date).toLocaleDateString()}</td>
                <td>{item.supplier || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx>{`
        .tab-header {
          margin-bottom: 1rem;
          display: flex;
          justify-content: flex-end;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th, .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }
        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function TeamTab({ team, jobId, onAction, onRefresh }) {
  return (
    <div>
      <div className="tab-header">
        <Button onClick={() => onAction('assign_team')}>+ Assign Team Member</Button>
      </div>
      {team.length === 0 ? (
        <div className="empty-state">No team members assigned to this job yet</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Start Date</th><th>End Date</th><th>Hourly Rate</th><th>Est. Hours</th><th>Status</th></tr>
          </thead>
          <tbody>
            {team.map(member => (
              <tr key={member.id}>
                <td>{member.user_name}</td>
                <td>{member.role}</td>
                <td>{new Date(member.start_date).toLocaleDateString()}</td>
                <td>{member.end_date ? new Date(member.end_date).toLocaleDateString() : '-'}</td>
                <td>R {parseFloat(member.hourly_rate).toLocaleString()}</td>
                <td>{member.estimated_hours}</td>
                <td>{member.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx>{`
        .tab-header {
          margin-bottom: 1rem;
          display: flex;
          justify-content: flex-end;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th, .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }
        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function PayrollTab({ payroll, jobId, team, onAction, onRefresh }) {
  const totalHours = payroll.reduce((sum, p) => sum + parseFloat(p.hours || 0), 0);
  const totalOvertime = payroll.reduce((sum, p) => sum + parseFloat(p.overtime_hours || 0), 0);
  
  return (
    <div>
      <div className="tab-header">
        <div className="summary">
          <span>Total Hours: {totalHours}</span>
          <span>Overtime: {totalOvertime}</span>
        </div>
        <Button onClick={() => onAction('log_hours')}>+ Log Hours</Button>
      </div>
      {payroll.length === 0 ? (
        <div className="empty-state">No hours logged for this job yet</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Date</th><th>Hours</th><th>Overtime</th><th>Description</th><th>Approved</th><th>Action</th></tr>
          </thead>
          <tbody>
            {payroll.map(entry => (
              <tr key={entry.id}>
                <td>{entry.user_name}</td>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.hours}</td>
                <td>{entry.overtime_hours || 0}</td>
                <td>{entry.description || '-'}</td>
                <td>{entry.approved ? '✓ Yes' : '❌ No'}</td>
                <td>
                  {!entry.approved && (
                    <Button size="sm" onClick={() => onAction('approve_hours', entry)}>
                      Approve
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx>{`
        .tab-header {
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .summary {
          display: flex;
          gap: 1rem;
          font-weight: 500;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th, .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }
        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function ManagementModal({ action, jobId, initialData, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {});

  const modalConfigs = {
    assign_tool: {
      title: 'Assign Tool to Job',
      fields: [
        { name: 'tool_id', label: 'Tool ID', type: 'number', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true, defaultValue: 1 },
        { name: 'issued_date', label: 'Issue Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ]
    },
    return_tool: {
      title: 'Return Tool',
      fields: []
    },
    purchase_stock: {
      title: 'Purchase Stock for Job',
      fields: [
        { name: 'stock_item_id', label: 'Stock Item ID', type: 'number', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'unit_cost', label: 'Unit Cost (R)', type: 'number', required: true, step: '0.01' },
        { name: 'purchase_date', label: 'Purchase Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
        { name: 'supplier', label: 'Supplier', type: 'text' },
        { name: 'invoice_number', label: 'Invoice Number', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ]
    },
    assign_team: {
      title: 'Assign Team Member',
      fields: [
        { name: 'user_id', label: 'User ID', type: 'number', required: true },
        { name: 'role', label: 'Role', type: 'text', required: true },
        { name: 'start_date', label: 'Start Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
        { name: 'end_date', label: 'End Date', type: 'date' },
        { name: 'hourly_rate', label: 'Hourly Rate (R)', type: 'number', required: true, step: '0.01' },
        { name: 'estimated_hours', label: 'Estimated Hours', type: 'number', step: '0.5' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
      ]
    },
    log_hours: {
      title: 'Log Work Hours',
      fields: [
        { name: 'user_id', label: 'User ID', type: 'number', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
        { name: 'hours', label: 'Hours Worked', type: 'number', required: true, step: '0.5' },
        { name: 'overtime_hours', label: 'Overtime Hours', type: 'number', step: '0.5', defaultValue: 0 },
        { name: 'description', label: 'Description', type: 'textarea' }
      ]
    },
    approve_hours: {
      title: 'Approve Hours',
      fields: []
    }
  };

  const config = modalConfigs[action];
  if (!config) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/jobs/${jobId}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: formData })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        showToast(result.message, 'success');
        onSuccess();
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Failed to complete action', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={config.title}>
      <form onSubmit={handleSubmit}>
        {config.fields.map(field => (
          <div key={field.name} className="form-field">
            <label>{field.label}{field.required && ' *'}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={formData[field.name] || ''}
                onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                rows={3}
              />
            ) : (
              <input
                type={field.type}
                step={field.step}
                value={formData[field.name] || field.defaultValue || ''}
                onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
              />
            )}
          </div>
        ))}
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Confirm'}</Button>
        </div>
      </form>
      <style jsx>{`
        .form-field {
          margin-bottom: 1rem;
        }
        .form-field label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }
        .form-field input, .form-field textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 0.25rem;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
      `}</style>
    </Modal>
  );
}