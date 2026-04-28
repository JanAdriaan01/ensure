'use client';

import { useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/hooks/useToast';
import { usePermissions } from '@/app/hooks/usePermissions';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import Modal from '@/app/components/ui/Modal/Modal';
import Tabs from '@/app/components/ui/Tabs';
import StatusBadge from '@/app/components/common/StatusBadge';
import EmployeeSelect from '@/app/components/common/EmployeeSelect';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import EmptyState from '@/app/components/ui/EmptyState';
import { FormInput, FormSelect, FormDatePicker, FormTextarea } from '@/app/components/ui/Form';

export default function OHSPage() {
  const { success, error: toastError } = useToast();
  const { can } = usePermissions();
  const { data: incidents, loading: incidentsLoading, refetch: refetchIncidents } = useFetch('/api/ohs/incidents');
  const { data: training, loading: trainingLoading, refetch: refetchTraining } = useFetch('/api/ohs/training');
  const { data: audits, loading: auditsLoading, refetch: refetchAudits } = useFetch('/api/ohs/audits');
  
  const [activeTab, setActiveTab] = useState('incidents');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentForm, setIncidentForm] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    incident_type: '',
    description: '',
    severity: 'medium',
    location: '',
    employee_id: '',
    witness_names: '',
    immediate_action: '',
  });
  const [trainingForm, setTrainingForm] = useState({
    employee_id: '',
    training_name: '',
    provider: '',
    completion_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    certificate_number: '',
    notes: '',
  });
  const [auditForm, setAuditForm] = useState({
    audit_date: new Date().toISOString().split('T')[0],
    audit_type: 'internal',
    scope: '',
    findings: '',
    recommendations: '',
    status: 'draft',
  });
  const [submitting, setSubmitting] = useState(false);

  const incidentTypes = [
    { value: 'near_miss', label: 'Near Miss' },
    { value: 'first_aid', label: 'First Aid' },
    { value: 'medical_treatment', label: 'Medical Treatment' },
    { value: 'lost_time', label: 'Lost Time Injury' },
    { value: 'property_damage', label: 'Property Damage' },
    { value: 'environmental', label: 'Environmental' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const auditTypes = [
    { value: 'internal', label: 'Internal Audit' },
    { value: 'external', label: 'External Audit' },
    { value: 'regulatory', label: 'Regulatory Inspection' },
    { value: 'client', label: 'Client Audit' },
  ];

  const reportIncident = async () => {
    if (!incidentForm.incident_type || !incidentForm.description || !incidentForm.severity) {
      toastError('Incident type, description, and severity are required');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/ohs/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentForm),
      });
      
      if (res.ok) {
        success('Incident reported successfully');
        setShowIncidentModal(false);
        setIncidentForm({
          incident_date: new Date().toISOString().split('T')[0],
          incident_type: '',
          description: '',
          severity: 'medium',
          location: '',
          employee_id: '',
          witness_names: '',
          immediate_action: '',
        });
        refetchIncidents();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to report incident');
      }
    } catch (error) {
      toastError('Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  const recordTraining = async () => {
    if (!trainingForm.employee_id || !trainingForm.training_name || !trainingForm.completion_date) {
      toastError('Employee, training name, and completion date are required');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/ohs/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingForm),
      });
      
      if (res.ok) {
        success('Training recorded successfully');
        setShowTrainingModal(false);
        setTrainingForm({
          employee_id: '',
          training_name: '',
          provider: '',
          completion_date: new Date().toISOString().split('T')[0],
          expiry_date: '',
          certificate_number: '',
          notes: '',
        });
        refetchTraining();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to record training');
      }
    } catch (error) {
      toastError('Failed to record training');
    } finally {
      setSubmitting(false);
    }
  };

  const createAudit = async () => {
    if (!auditForm.audit_date || !auditForm.audit_type) {
      toastError('Audit date and type are required');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/ohs/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditForm),
      });
      
      if (res.ok) {
        success('Audit created successfully');
        setShowAuditModal(false);
        setAuditForm({
          audit_date: new Date().toISOString().split('T')[0],
          audit_type: 'internal',
          scope: '',
          findings: '',
          recommendations: '',
          status: 'draft',
        });
        refetchAudits();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to create audit');
      }
    } catch (error) {
      toastError('Failed to create audit');
    } finally {
      setSubmitting(false);
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/ohs/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        success(`Incident ${status}`);
        refetchIncidents();
      } else {
        toastError('Failed to update incident');
      }
    } catch (error) {
      toastError('Failed to update incident');
    }
  };

  const loading = incidentsLoading || trainingLoading || auditsLoading;

  const stats = {
    openIncidents: incidents?.filter(i => i.status === 'reported' || i.status === 'investigating').length || 0,
    closedIncidents: incidents?.filter(i => i.status === 'closed').length || 0,
    trainingExpiring: training?.filter(t => t.status === 'expiring_soon').length || 0,
    trainingExpired: training?.filter(t => t.status === 'expired').length || 0,
  };

  const tabs = [
    { id: 'incidents', label: '📋 Incidents', icon: '⚠️' },
    { id: 'training', label: '📚 Training', icon: '🎓' },
    { id: 'audits', label: '📊 Audits', icon: '🔍' },
  ];

  if (loading) return <LoadingSpinner text="Loading OHS data..." />;

  return (
    <div className="ohs-page">
      <PageHeader 
        title="🛡️ OHS Compliance"
        description="Manage incidents, training, audits, and safety compliance"
        action={
          <div className="header-actions">
            {can('ohs:create') && (
              <>
                <Button variant="secondary" onClick={() => setShowIncidentModal(true)}>
                  ⚠️ Report Incident
                </Button>
                <Button variant="secondary" onClick={() => setShowTrainingModal(true)}>
                  🎓 Record Training
                </Button>
                <Button onClick={() => setShowAuditModal(true)}>
                  🔍 Create Audit
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className={stats.openIncidents > 0 ? 'warning' : ''}>
          <div className="stat-value">{stats.openIncidents}</div>
          <div className="stat-label">Open Incidents</div>
        </Card>
        <Card>
          <div className="stat-value">{stats.closedIncidents}</div>
          <div className="stat-label">Closed Incidents</div>
        </Card>
        <Card className={stats.trainingExpiring > 0 ? 'warning' : ''}>
          <div className="stat-value">{stats.trainingExpiring}</div>
          <div className="stat-label">Training Expiring Soon</div>
        </Card>
        <Card className={stats.trainingExpired > 0 ? 'danger' : ''}>
          <div className="stat-value">{stats.trainingExpired}</div>
          <div className="stat-label">Training Expired</div>
        </Card>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="tab-content">
          {incidents?.length === 0 ? (
            <EmptyState 
              title="No incidents reported"
              message="Report your first incident to start tracking"
              actionText="Report Incident"
              onAction={() => setShowIncidentModal(true)}
            />
          ) : (
            <div className="incidents-list">
              {incidents.map(incident => (
                <Card key={incident.id} className={`incident-item severity-${incident.severity}`}>
                  <div className="incident-header">
                    <div>
                      <div className="incident-type">{incident.incident_type?.replace('_', ' ')}</div>
                      <div className="incident-date">{new Date(incident.incident_date).toLocaleDateString()}</div>
                    </div>
                    <div className="incident-status">
                      <StatusBadge status={incident.status} size="sm" />
                    </div>
                  </div>
                  <div className="incident-description">{incident.description}</div>
                  {incident.location && (
                    <div className="incident-location">📍 {incident.location}</div>
                  )}
                  {incident.employee_name && (
                    <div className="incident-employee">👤 {incident.employee_name} {incident.employee_surname}</div>
                  )}
                  <div className="incident-actions">
                    {incident.status === 'reported' && can('ohs:edit') && (
                      <Button size="sm" onClick={() => updateIncidentStatus(incident.id, 'investigating')}>
                        Start Investigation
                      </Button>
                    )}
                    {incident.status === 'investigating' && can('ohs:edit') && (
                      <Button size="sm" variant="success" onClick={() => updateIncidentStatus(incident.id, 'closed')}>
                        Close Incident
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="tab-content">
          {training?.length === 0 ? (
            <EmptyState 
              title="No training records"
              message="Record training completions to track compliance"
              actionText="Record Training"
              onAction={() => setShowTrainingModal(true)}
            />
          ) : (
            <div className="training-list">
              {training.map(record => (
                <Card key={record.id} className={`training-item status-${record.status}`}>
                  <div className="training-header">
                    <div className="training-name">{record.training_name}</div>
                    <div className="training-status">
                      {record.status === 'expired' && <StatusBadge status="rejected" size="sm" />}
                      {record.status === 'expiring_soon' && <StatusBadge status="warning" size="sm" />}
                      {record.status === 'valid' && <StatusBadge status="approved" size="sm" />}
                    </div>
                  </div>
                  <div className="training-employee">👤 {record.employee_name} {record.employee_surname}</div>
                  <div className="training-dates">
                    <div>Completed: {new Date(record.completion_date).toLocaleDateString()}</div>
                    {record.expiry_date && (
                      <div>Expires: {new Date(record.expiry_date).toLocaleDateString()}</div>
                    )}
                  </div>
                  {record.provider && <div className="training-provider">Provider: {record.provider}</div>}
                  {record.certificate_number && <div className="training-cert">Cert: {record.certificate_number}</div>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audits Tab */}
      {activeTab === 'audits' && (
        <div className="tab-content">
          {audits?.length === 0 ? (
            <EmptyState 
              title="No audits conducted"
              message="Create your first audit to track compliance"
              actionText="Create Audit"
              onAction={() => setShowAuditModal(true)}
            />
          ) : (
            <div className="audits-list">
              {audits.map(audit => (
                <Card key={audit.id} className="audit-item">
                  <div className="audit-header">
                    <div>
                      <div className="audit-type">{audit.audit_type?.replace('_', ' ')} Audit</div>
                      <div className="audit-date">{new Date(audit.audit_date).toLocaleDateString()}</div>
                    </div>
                    <StatusBadge status={audit.status} size="sm" />
                  </div>
                  {audit.scope && <div className="audit-scope">Scope: {audit.scope}</div>}
                  <div className="audit-stats">
                    <span>🔍 {audit.findings_count || 0} Findings</span>
                    <span>⚠️ {audit.open_findings || 0} Open</span>
                  </div>
                  {audit.conducted_by_name && (
                    <div className="audit-conducted">Conducted by: {audit.conducted_by_name}</div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incident Modal */}
      <Modal isOpen={showIncidentModal} onClose={() => setShowIncidentModal(false)} title="Report Incident">
        <div>
          <FormDatePicker
            label="Incident Date *"
            value={incidentForm.incident_date}
            onChange={e => setIncidentForm({...incidentForm, incident_date: e.target.value})}
            required
          />
          <FormSelect
            label="Incident Type *"
            value={incidentForm.incident_type}
            onChange={e => setIncidentForm({...incidentForm, incident_type: e.target.value})}
            options={incidentTypes}
            required
          />
          <FormSelect
            label="Severity *"
            value={incidentForm.severity}
            onChange={e => setIncidentForm({...incidentForm, severity: e.target.value})}
            options={severityLevels}
            required
          />
          <FormTextarea
            label="Description *"
            value={incidentForm.description}
            onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}
            required
            rows={3}
          />
          <FormInput
            label="Location"
            value={incidentForm.location}
            onChange={e => setIncidentForm({...incidentForm, location: e.target.value})}
          />
          <EmployeeSelect
            value={incidentForm.employee_id}
            onChange={e => setIncidentForm({...incidentForm, employee_id: e.target.value})}
          />
          <FormInput
            label="Witness Names"
            value={incidentForm.witness_names}
            onChange={e => setIncidentForm({...incidentForm, witness_names: e.target.value})}
            placeholder="Comma-separated names"
          />
          <FormTextarea
            label="Immediate Action Taken"
            value={incidentForm.immediate_action}
            onChange={e => setIncidentForm({...incidentForm, immediate_action: e.target.value})}
            rows={2}
          />
          <div className="modal-actions">
            <Button onClick={reportIncident} loading={submitting}>Report Incident</Button>
            <Button variant="secondary" onClick={() => setShowIncidentModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Training Modal */}
      <Modal isOpen={showTrainingModal} onClose={() => setShowTrainingModal(false)} title="Record Training">
        <div>
          <EmployeeSelect
            value={trainingForm.employee_id}
            onChange={e => setTrainingForm({...trainingForm, employee_id: e.target.value})}
            required
          />
          <FormInput
            label="Training Name *"
            value={trainingForm.training_name}
            onChange={e => setTrainingForm({...trainingForm, training_name: e.target.value})}
            required
          />
          <FormInput
            label="Provider"
            value={trainingForm.provider}
            onChange={e => setTrainingForm({...trainingForm, provider: e.target.value})}
          />
          <FormDatePicker
            label="Completion Date *"
            value={trainingForm.completion_date}
            onChange={e => setTrainingForm({...trainingForm, completion_date: e.target.value})}
            required
          />
          <FormDatePicker
            label="Expiry Date"
            value={trainingForm.expiry_date}
            onChange={e => setTrainingForm({...trainingForm, expiry_date: e.target.value})}
          />
          <FormInput
            label="Certificate Number"
            value={trainingForm.certificate_number}
            onChange={e => setTrainingForm({...trainingForm, certificate_number: e.target.value})}
          />
          <FormTextarea
            label="Notes"
            value={trainingForm.notes}
            onChange={e => setTrainingForm({...trainingForm, notes: e.target.value})}
            rows={2}
          />
          <div className="modal-actions">
            <Button onClick={recordTraining} loading={submitting}>Record Training</Button>
            <Button variant="secondary" onClick={() => setShowTrainingModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Audit Modal */}
      <Modal isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} title="Create Audit">
        <div>
          <FormDatePicker
            label="Audit Date *"
            value={auditForm.audit_date}
            onChange={e => setAuditForm({...auditForm, audit_date: e.target.value})}
            required
          />
          <FormSelect
            label="Audit Type *"
            value={auditForm.audit_type}
            onChange={e => setAuditForm({...auditForm, audit_type: e.target.value})}
            options={auditTypes}
            required
          />
          <FormTextarea
            label="Scope"
            value={auditForm.scope}
            onChange={e => setAuditForm({...auditForm, scope: e.target.value})}
            rows={2}
            placeholder="What areas were audited?"
          />
          <FormTextarea
            label="Findings"
            value={auditForm.findings}
            onChange={e => setAuditForm({...auditForm, findings: e.target.value})}
            rows={3}
            placeholder="List any non-conformances or observations"
          />
          <FormTextarea
            label="Recommendations"
            value={auditForm.recommendations}
            onChange={e => setAuditForm({...auditForm, recommendations: e.target.value})}
            rows={2}
          />
          <FormSelect
            label="Status"
            value={auditForm.status}
            onChange={e => setAuditForm({...auditForm, status: e.target.value})}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <div className="modal-actions">
            <Button onClick={createAudit} loading={submitting}>Create Audit</Button>
            <Button variant="secondary" onClick={() => setShowAuditModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .ohs-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .header-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
        
        .warning {
          border-left: 3px solid #f59e0b;
        }
        
        .danger {
          border-left: 3px solid #dc2626;
        }
        
        .tab-content {
          margin-top: 1.5rem;
        }
        
        .incidents-list, .training-list, .audits-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }
        
        .incident-item, .training-item, .audit-item {
          transition: transform 0.2s;
        }
        
        .incident-item:hover, .training-item:hover, .audit-item:hover {
          transform: translateY(-2px);
        }
        
        .incident-item.severity-critical {
          border-left: 3px solid #dc2626;
        }
        
        .incident-item.severity-high {
          border-left: 3px solid #f59e0b;
        }
        
        .incident-header, .training-header, .audit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        
        .incident-type, .training-name, .audit-type {
          font-weight: 600;
        }
        
        .incident-date, .audit-date {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-top: 0.25rem;
        }
        
        .incident-description {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        
        .incident-location, .incident-employee, .training-employee, .training-provider, .training-cert, .audit-scope, .audit-conducted {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-top: 0.25rem;
        }
        
        .training-dates {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
          margin: 0.5rem 0;
        }
        
        .audit-stats {
          display: flex;
          gap: 1rem;
          margin: 0.5rem 0;
          font-size: 0.75rem;
        }
        
        .incident-actions {
          margin-top: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-light);
        }
        
        .training-item.status-expired {
          opacity: 0.6;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
          .ohs-page {
            padding: 1rem;
          }
          .incidents-list, .training-list, .audits-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}