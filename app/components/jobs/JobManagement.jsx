// app/components/jobs/JobManagement.jsx
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
  
  // Check if data is available
  if (!managementData?.data) {
    return (
      <div className="job-management-disabled">
        <div className="disabled-icon">⚠️</div>
        <h3>Unable to load job data</h3>
        <p>Please refresh the page or contact support.</p>
      </div>
    );
  }

  const { job, tools, stock, team, payroll, totals } = managementData.data;

  // Check if job is ready for management
  const isJobReady = job?.po_status === 'approved';

  if (!isJobReady) {
    return (
      <div className="job-management-disabled">
        <div className="disabled-icon">⏳</div>
        <h3>Job Management Not Yet Available</h3>
        <p>This job requires PO approval before management features (tools, stock, team, payroll) can be accessed.</p>
        <div className="job-status">
          <strong>Current Status:</strong> {job?.po_status || 'Unknown'} | {job?.completion_status || 'Unknown'}
        </div>
        <div className="status-note">
          💡 Once the PO is received and approved, you'll be able to manage tools, stock, team assignments, and payroll.
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
          <div>Actual Cost: R {(totals?.actual_cost || 0).toLocaleString()}</div>
          <div className={(totals?.actual_cost || 0) > (job.total_budget || 0) ? 'over-budget' : 'under-budget'}>
            Variance: R {((totals?.actual_cost || 0) - (job.total_budget || 0)).toLocaleString()}
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
          <OverviewTab job={job} totals={totals || {}} tools={tools || []} stock={stock || []} team={team || []} payroll={payroll || []} />
        )}
        
        {activeTab === 'tools' && (
          <ToolsTab 
            tools={tools || []} 
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
            stock={stock || []} 
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
            team={team || []} 
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
            payroll={payroll || []} 
            jobId={jobId}
            team={team || []}
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

        .job-status {
          margin-top: 1rem;
          padding: 0.5rem;
          background: white;
          border-radius: 0.5rem;
          display: inline-block;
        }

        .status-note {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: #856404;
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

// OverviewTab component (add this within the same file or create separate files)
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
          <div className="stat-value">R {(totals.total_stock_cost || 0).toLocaleString()}</div>
          <div className="stat-label">Stock Cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{team.length}</div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{totals.total_labour_hours || 0}</div>
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
          <div><strong>Actual Cost:</strong> R {(totals.actual_cost || 0).toLocaleString()}</div>
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

// Simplified versions of other tabs (add the complete implementations)
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

// Add StockTab, TeamTab, PayrollTab, and ManagementModal similarly
// (I'll provide these in the next message due to length)