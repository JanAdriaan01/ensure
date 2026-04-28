'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/hooks/useToast';
import { usePermissions } from '@/app/hooks/usePermissions';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import Modal from '@/app/components/ui/Modal/Modal';
import SearchBar from '@/app/components/ui/SearchBar';
import FilterBar from '@/app/components/ui/FilterBar';
import StatusBadge from '@/app/components/common/StatusBadge';
import EmployeeSelect from '@/app/components/common/EmployeeSelect';
import JobSelect from '@/app/components/common/JobSelect';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import EmptyState from '@/app/components/ui/EmptyState';
import { FormInput, FormSelect, FormDatePicker, FormTimePicker, FormTextarea } from '@/app/components/ui/Form';

export default function SchedulePage() {
  const { success, error: toastError } = useToast();
  const { can } = usePermissions();
  const { data: schedule, loading, refetch } = useFetch('/api/schedule');
  const { data: jobs } = useFetch('/api/jobs');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    job_id: '',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: '',
    team_lead_id: '',
    employee_ids: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Group schedule by date for calendar view
  const scheduleByDate = schedule?.reduce((acc, item) => {
    const date = item.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const filteredSchedule = schedule?.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.job_number?.toLowerCase().includes(search.toLowerCase()) ||
      item.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const createWorkOrder = async () => {
    if (!formData.job_id || !formData.scheduled_date || !formData.title) {
      toastError('Job, date, and title are required');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        success('Work order created successfully');
        setShowCreateModal(false);
        setFormData({
          job_id: '',
          scheduled_date: '',
          start_time: '',
          end_time: '',
          title: '',
          description: '',
          priority: 'medium',
          estimated_hours: '',
          team_lead_id: '',
          employee_ids: [],
        });
        refetch();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to create work order');
      }
    } catch (error) {
      toastError('Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        success(`Work order ${newStatus}`);
        refetch();
        if (selectedOrder?.id === id) {
          fetchOrderDetails(id);
        }
      } else {
        toastError('Failed to update status');
      }
    } catch (error) {
      toastError('Failed to update status');
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const res = await fetch(`/api/schedule/${id}`);
      const data = await res.json();
      setSelectedOrder(data);
      setShowDetailsModal(true);
    } catch (error) {
      toastError('Failed to load order details');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#dc2626',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return colors[priority] || '#6b7280';
  };

  const stats = {
    scheduled: schedule?.filter(s => s.status === 'scheduled').length || 0,
    inProgress: schedule?.filter(s => s.status === 'in_progress').length || 0,
    completed: schedule?.filter(s => s.status === 'completed').length || 0,
    cancelled: schedule?.filter(s => s.status === 'cancelled').length || 0,
  };

  if (loading) return <LoadingSpinner text="Loading schedule..." />;

  return (
    <div className="schedule-page">
      <PageHeader 
        title="📅 Work Orders & Scheduling"
        description="Manage work orders, assign teams, and track progress"
        action={
          can('schedule:create') && (
            <Button onClick={() => setShowCreateModal(true)}>+ Create Work Order</Button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card>
          <div className="stat-value">{stats.scheduled}</div>
          <div className="stat-label">Scheduled</div>
        </Card>
        <Card>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </Card>
        <Card>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </Card>
        <Card>
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 List View
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          📅 Calendar View
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filters">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by title, job number, or client..."
        />
        <FilterBar
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'all', label: 'All Status' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
          ]}
          onFilterChange={(filters) => setStatusFilter(filters.status || 'all')}
        />
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        filteredSchedule.length === 0 ? (
          <EmptyState 
            title="No work orders found"
            message="Create your first work order to get started"
            actionText="Create Work Order"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="schedule-list">
            {filteredSchedule.map(order => (
              <Card 
                key={order.id} 
                className={`schedule-item status-${order.status}`}
                onClick={() => fetchOrderDetails(order.id)}
              >
                <div className="schedule-header">
                  <div className="schedule-title">
                    <span className="priority-dot" style={{ backgroundColor: getPriorityColor(order.priority) }} />
                    <span className="order-title">{order.title}</span>
                  </div>
                  <div className="schedule-status">
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                </div>
                
                <div className="schedule-details">
                  <div className="detail">
                    <span className="label">Job:</span>
                    <span className="value">{order.job_number} - {order.client_name}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(order.scheduled_date).toLocaleDateString()}</span>
                  </div>
                  {order.start_time && (
                    <div className="detail">
                      <span className="label">Time:</span>
                      <span className="value">
                        {order.start_time} {order.end_time ? `- ${order.end_time}` : ''}
                      </span>
                    </div>
                  )}
                  <div className="detail">
                    <span className="label">Team:</span>
                    <span className="value">{order.assigned_count || 0} assigned</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-view">
          {scheduleByDate && Object.entries(scheduleByDate).sort().map(([date, items]) => (
            <div key={date} className="calendar-day">
              <div className="calendar-date">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="calendar-items">
                {items.map(order => (
                  <div 
                    key={order.id} 
                    className={`calendar-item priority-${order.priority}`}
                    onClick={() => fetchOrderDetails(order.id)}
                  >
                    <div className="calendar-item-time">
                      {order.start_time || 'All day'}
                    </div>
                    <div className="calendar-item-content">
                      <div className="calendar-item-title">{order.title}</div>
                      <div className="calendar-item-job">{order.job_number}</div>
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Work Order Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Work Order">
        <div>
          <JobSelect
            value={formData.job_id}
            onChange={e => setFormData({...formData, job_id: e.target.value})}
            required
          />
          <FormInput
            label="Title *"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
          <FormDatePicker
            label="Scheduled Date *"
            value={formData.scheduled_date}
            onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
            required
          />
          <div className="time-row">
            <FormInput
              label="Start Time"
              type="time"
              value={formData.start_time}
              onChange={e => setFormData({...formData, start_time: e.target.value})}
            />
            <FormInput
              label="End Time"
              type="time"
              value={formData.end_time}
              onChange={e => setFormData({...formData, end_time: e.target.value})}
            />
          </div>
          <FormSelect
            label="Priority"
            value={formData.priority}
            onChange={e => setFormData({...formData, priority: e.target.value})}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <FormInput
            label="Estimated Hours"
            type="number"
            step="0.5"
            value={formData.estimated_hours}
            onChange={e => setFormData({...formData, estimated_hours: e.target.value})}
          />
          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <div className="modal-actions">
            <Button onClick={createWorkOrder} loading={submitting}>Create Work Order</Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Order Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Work Order Details">
        {selectedOrder && (
          <div>
            <div className="details-header">
              <h3>{selectedOrder.title}</h3>
              <div className="details-status">
                <StatusBadge status={selectedOrder.status} />
              </div>
            </div>
            
            <div className="details-section">
              <h4>Job Information</h4>
              <div className="details-grid">
                <div><strong>Job Number:</strong> {selectedOrder.job_number}</div>
                <div><strong>Client:</strong> {selectedOrder.client_name}</div>
                <div><strong>Status:</strong> {selectedOrder.job_status}</div>
              </div>
            </div>
            
            <div className="details-section">
              <h4>Schedule</h4>
              <div className="details-grid">
                <div><strong>Date:</strong> {new Date(selectedOrder.scheduled_date).toLocaleDateString()}</div>
                {selectedOrder.start_time && <div><strong>Time:</strong> {selectedOrder.start_time} {selectedOrder.end_time ? `- ${selectedOrder.end_time}` : ''}</div>}
                {selectedOrder.estimated_hours && <div><strong>Estimated Hours:</strong> {selectedOrder.estimated_hours}</div>}
                {selectedOrder.actual_hours && <div><strong>Actual Hours:</strong> {selectedOrder.actual_hours}</div>}
              </div>
            </div>
            
            {selectedOrder.description && (
              <div className="details-section">
                <h4>Description</h4>
                <p>{selectedOrder.description}</p>
              </div>
            )}
            
            <div className="details-section">
              <h4>Assigned Team</h4>
              {selectedOrder.employees && selectedOrder.employees.length > 0 ? (
                <div className="team-list">
                  {selectedOrder.employees.map(emp => (
                    <div key={emp.id} className="team-member">{emp.name} {emp.surname}</div>
                  ))}
                </div>
              ) : (
                <p>No employees assigned yet.</p>
              )}
            </div>
            
            {can('schedule:edit') && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
              <div className="details-actions">
                <div className="action-group">
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={() => updateStatus(selectedOrder.id, 'in_progress')}
                    disabled={selectedOrder.status === 'in_progress'}
                  >
                    Start Work
                  </Button>
                  <Button 
                    size="sm" 
                    variant="success" 
                    onClick={() => updateStatus(selectedOrder.id, 'completed')}
                  >
                    Complete
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .schedule-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
        
        .view-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          justify-content: flex-end;
        }
        
        .toggle-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .toggle-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .filters {
          margin-bottom: 1.5rem;
        }
        
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .schedule-item {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .schedule-item:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
        }
        
        .schedule-item.status-completed {
          opacity: 0.7;
        }
        
        .schedule-item.status-cancelled {
          opacity: 0.5;
        }
        
        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .schedule-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .priority-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .order-title {
          font-weight: 600;
        }
        
        .schedule-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          font-size: 0.75rem;
        }
        
        .detail {
          display: flex;
          gap: 0.5rem;
        }
        
        .detail .label {
          color: var(--text-tertiary);
        }
        
        .calendar-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .calendar-day {
          background: var(--bg-primary);
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        
        .calendar-date {
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          font-weight: 600;
          border-bottom: 1px solid var(--border-light);
        }
        
        .calendar-items {
          padding: 0.5rem;
        }
        
        .calendar-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: var(--bg-primary);
          border-radius: 0.5rem;
          border-left: 3px solid;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .calendar-item:hover {
          background: var(--bg-tertiary);
        }
        
        .calendar-item.priority-high {
          border-left-color: #dc2626;
        }
        
        .calendar-item.priority-medium {
          border-left-color: #f59e0b;
        }
        
        .calendar-item.priority-low {
          border-left-color: #10b981;
        }
        
        .calendar-item-time {
          min-width: 80px;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
        
        .calendar-item-content {
          flex: 1;
        }
        
        .calendar-item-title {
          font-weight: 500;
        }
        
        .calendar-item-job {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }
        
        .time-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        
        .details-header h3 {
          margin: 0;
        }
        
        .details-section {
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        
        .details-section h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .team-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .team-member {
          padding: 0.25rem 0.5rem;
          background: var(--bg-tertiary);
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        
        .details-actions {
          margin-top: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-light);
        }
        
        .action-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
          .schedule-page {
            padding: 1rem;
          }
          .time-row {
            grid-template-columns: 1fr;
          }
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}