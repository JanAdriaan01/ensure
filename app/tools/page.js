'use client';

import { useState } from 'react';
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
import CurrencyAmount from '@/app/components/CurrencyAmount';
import EmployeeSelect from '@/app/components/common/EmployeeSelect';
import JobSelect from '@/app/components/common/JobSelect';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import EmptyState from '@/app/components/ui/EmptyState';
import { FormInput, FormSelect, FormDatePicker, FormCurrencyInput, FormTextarea } from '@/app/components/ui/Form';

export default function ToolsPage() {
  const { success, error: toastError } = useToast();
  const { can } = usePermissions();
  const { data: tools, loading, refetch } = useFetch('/api/tools');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [formData, setFormData] = useState({
    tool_code: '',
    tool_name: '',
    description: '',
    category: '',
    serial_number: '',
    condition: 'good',
    purchase_date: '',
    purchase_cost: 0,
    location: '',
  });
  const [checkoutData, setCheckoutData] = useState({
    employee_id: '',
    job_id: '',
    expected_return_date: '',
    notes: '',
  });
  const [returnData, setReturnData] = useState({
    condition_on_return: 'good',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [checkedOutTools, setCheckedOutTools] = useState([]);

  const categories = [...new Set(tools?.map(tool => tool.category).filter(Boolean))];

  const filteredTools = tools?.filter(tool => {
    const matchesSearch = tool.tool_name?.toLowerCase().includes(search.toLowerCase()) ||
      tool.tool_code?.toLowerCase().includes(search.toLowerCase()) ||
      tool.serial_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const fetchCheckedOutTools = async () => {
    const res = await fetch('/api/tools/checkout');
    const data = await res.json();
    setCheckedOutTools(data);
  };

  const addTool = async () => {
    if (!formData.tool_code || !formData.tool_name) {
      toastError('Tool code and name are required');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        success('Tool added successfully');
        setShowAddModal(false);
        setFormData({
          tool_code: '',
          tool_name: '',
          description: '',
          category: '',
          serial_number: '',
          condition: 'good',
          purchase_date: '',
          purchase_cost: 0,
          location: '',
        });
        refetch();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to add tool');
      }
    } catch (error) {
      toastError('Failed to add tool');
    } finally {
      setSubmitting(false);
    }
  };

  const checkoutTool = async () => {
    if (!selectedTool || !checkoutData.employee_id) {
      toastError('Please select an employee');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/tools/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: selectedTool.id,
          employee_id: checkoutData.employee_id,
          job_id: checkoutData.job_id || null,
          expected_return_date: checkoutData.expected_return_date || null,
          notes: checkoutData.notes,
        }),
      });
      
      if (res.ok) {
        success('Tool checked out successfully');
        setShowCheckoutModal(false);
        setCheckoutData({
          employee_id: '',
          job_id: '',
          expected_return_date: '',
          notes: '',
        });
        setSelectedTool(null);
        refetch();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to checkout tool');
      }
    } catch (error) {
      toastError('Failed to checkout tool');
    } finally {
      setSubmitting(false);
    }
  };

  const returnTool = async () => {
    if (!selectedCheckout) {
      toastError('Invalid checkout record');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/tools/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkout_id: selectedCheckout.id,
          condition_on_return: returnData.condition_on_return,
          notes: returnData.notes,
        }),
      });
      
      if (res.ok) {
        success('Tool returned successfully');
        setShowReturnModal(false);
        setReturnData({ condition_on_return: 'good', notes: '' });
        setSelectedCheckout(null);
        refetch();
        fetchCheckedOutTools();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to return tool');
      }
    } catch (error) {
      toastError('Failed to return tool');
    } finally {
      setSubmitting(false);
    }
  };

  const openCheckoutModal = (tool) => {
    setSelectedTool(tool);
    setCheckoutData({
      employee_id: '',
      job_id: '',
      expected_return_date: '',
      notes: '',
    });
    setShowCheckoutModal(true);
  };

  const openReturnModal = async () => {
    await fetchCheckedOutTools();
    setShowReturnModal(true);
  };

  const stats = {
    total: tools?.length || 0,
    available: tools?.filter(t => t.status === 'available').length || 0,
    checkedOut: tools?.filter(t => t.status === 'checked_out').length || 0,
    overdue: checkedOutTools.filter(t => t.expected_return_date && new Date(t.expected_return_date) < new Date()).length || 0,
  };

  if (loading) return <LoadingSpinner text="Loading tools..." />;

  return (
    <div className="tools-page">
      <PageHeader 
        title="🔧 Tools Management"
        description="Manage tools inventory, checkouts, and returns"
        action={
          <div className="header-actions">
            {can('tool:checkout') && (
              <Button variant="secondary" onClick={openReturnModal}>
                View Checked Out
              </Button>
            )}
            {can('tool:create') && (
              <Button onClick={() => setShowAddModal(true)}>+ Add Tool</Button>
            )}
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tools</div>
        </Card>
        <Card>
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available</div>
        </Card>
        <Card>
          <div className="stat-value">{stats.checkedOut}</div>
          <div className="stat-label">Checked Out</div>
        </Card>
        <Card className={stats.overdue > 0 ? 'warning' : ''}>
          <div className="stat-value">{stats.overdue}</div>
          <div className="stat-label">Overdue Returns</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="filters">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by tool code, name, or serial number..."
        />
        <FilterBar
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'all', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'checked_out', label: 'Checked Out' },
              ],
            },
            {
              key: 'category',
              label: 'Category',
              type: 'select',
              options: [{ value: 'all', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))],
            },
          ]}
          onFilterChange={(filters) => {
            setStatusFilter(filters.status || 'all');
            setCategoryFilter(filters.category || 'all');
          }}
        />
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <EmptyState 
          title="No tools found"
          message="Add your first tool to get started"
          actionText="Add Tool"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="tools-grid">
          {filteredTools.map(tool => (
            <Card key={tool.id} className={`tool-card ${tool.status === 'checked_out' ? 'checked-out' : ''}`}>
              <div className="tool-header">
                <div>
                  <div className="tool-code">{tool.tool_code}</div>
                  <div className="tool-name">{tool.tool_name}</div>
                  {tool.serial_number && <div className="tool-sn">SN: {tool.serial_number}</div>}
                </div>
                <div className="tool-status">
                  <StatusBadge status={tool.status} size="sm" />
                </div>
              </div>
              
              <div className="tool-details">
                {tool.category && (
                  <div className="detail">
                    <span className="label">Category:</span>
                    <span className="value">{tool.category}</span>
                  </div>
                )}
                {tool.location && (
                  <div className="detail">
                    <span className="label">Location:</span>
                    <span className="value">{tool.location}</span>
                  </div>
                )}
                {tool.purchase_cost > 0 && (
                  <div className="detail">
                    <span className="label">Cost:</span>
                    <span className="value"><CurrencyAmount amount={tool.purchase_cost} /></span>
                  </div>
                )}
                <div className="detail">
                  <span className="label">Condition:</span>
                  <span className="value">{tool.condition}</span>
                </div>
              </div>
              
              {can('tool:checkout') && tool.status === 'available' && (
                <div className="tool-actions">
                  <Button size="sm" variant="primary" onClick={() => openCheckoutModal(tool)}>
                    Checkout
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Tool Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Tool">
        <div>
          <FormInput
            label="Tool Code *"
            value={formData.tool_code}
            onChange={e => setFormData({...formData, tool_code: e.target.value})}
            required
          />
          <FormInput
            label="Tool Name *"
            value={formData.tool_name}
            onChange={e => setFormData({...formData, tool_name: e.target.value})}
            required
          />
          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <FormInput
            label="Category"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          />
          <FormInput
            label="Serial Number"
            value={formData.serial_number}
            onChange={e => setFormData({...formData, serial_number: e.target.value})}
          />
          <FormSelect
            label="Condition"
            value={formData.condition}
            onChange={e => setFormData({...formData, condition: e.target.value})}
            options={[
              { value: 'new', label: 'New' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'needs_repair', label: 'Needs Repair' },
            ]}
          />
          <FormDatePicker
            label="Purchase Date"
            value={formData.purchase_date}
            onChange={e => setFormData({...formData, purchase_date: e.target.value})}
          />
          <FormCurrencyInput
            label="Purchase Cost"
            value={formData.purchase_cost}
            onChange={e => setFormData({...formData, purchase_cost: parseFloat(e.target.value) || 0})}
          />
          <FormInput
            label="Location"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
          />
          <div className="modal-actions">
            <Button onClick={addTool} loading={submitting}>Add Tool</Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} title="Checkout Tool">
        {selectedTool && (
          <div>
            <div className="item-summary">
              <div><strong>Tool:</strong> {selectedTool.tool_name} ({selectedTool.tool_code})</div>
              <div><strong>Status:</strong> {selectedTool.status}</div>
            </div>
            
            <EmployeeSelect
              value={checkoutData.employee_id}
              onChange={e => setCheckoutData({...checkoutData, employee_id: e.target.value})}
              required
            />
            <JobSelect
              value={checkoutData.job_id}
              onChange={e => setCheckoutData({...checkoutData, job_id: e.target.value})}
            />
            <FormDatePicker
              label="Expected Return Date"
              value={checkoutData.expected_return_date}
              onChange={e => setCheckoutData({...checkoutData, expected_return_date: e.target.value})}
            />
            <FormTextarea
              label="Notes"
              value={checkoutData.notes}
              onChange={e => setCheckoutData({...checkoutData, notes: e.target.value})}
              placeholder="Reason for checkout, special instructions..."
            />
            
            <div className="modal-actions">
              <Button onClick={checkoutTool} loading={submitting}>Checkout</Button>
              <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Return Tool">
        <div>
          <div className="checked-out-list">
            {checkedOutTools.length === 0 ? (
              <div className="empty-state">No tools currently checked out.</div>
            ) : (
              checkedOutTools.map(checkout => (
                <div 
                  key={checkout.id} 
                  className={`checkout-item ${new Date(checkout.expected_return_date) < new Date() ? 'overdue' : ''}`}
                  onClick={() => {
                    setSelectedCheckout(checkout);
                    setShowReturnModal(false);
                    setShowReturnModal(true);
                    setReturnData({ condition_on_return: 'good', notes: '' });
                  }}
                >
                  <div className="checkout-tool">{checkout.tool_name}</div>
                  <div className="checkout-details">
                    <div>Employee: {checkout.employee_name} {checkout.employee_surname}</div>
                    {checkout.expected_return_date && (
                      <div>Expected: {new Date(checkout.expected_return_date).toLocaleDateString()}</div>
                    )}
                    {checkout.job_number && <div>Job: {checkout.job_number}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal isOpen={showReturnModal && selectedCheckout} onClose={() => setShowReturnModal(false)} title="Return Tool">
        {selectedCheckout && (
          <div>
            <div className="item-summary">
              <div><strong>Tool:</strong> {selectedCheckout.tool_name}</div>
              <div><strong>Checked Out By:</strong> {selectedCheckout.employee_name} {selectedCheckout.employee_surname}</div>
              <div><strong>Checkout Date:</strong> {new Date(selectedCheckout.checkout_date).toLocaleDateString()}</div>
              {selectedCheckout.expected_return_date && (
                <div><strong>Expected Return:</strong> {new Date(selectedCheckout.expected_return_date).toLocaleDateString()}</div>
              )}
            </div>
            
            <FormSelect
              label="Condition on Return"
              value={returnData.condition_on_return}
              onChange={e => setReturnData({...returnData, condition_on_return: e.target.value})}
              options={[
                { value: 'new', label: 'New' },
                { value: 'good', label: 'Good' },
                { value: 'fair', label: 'Fair' },
                { value: 'poor', label: 'Poor' },
                { value: 'damaged', label: 'Damaged' },
                { value: 'needs_repair', label: 'Needs Repair' },
              ]}
            />
            <FormTextarea
              label="Notes"
              value={returnData.notes}
              onChange={e => setReturnData({...returnData, notes: e.target.value})}
              placeholder="Any damage, missing parts, or additional notes..."
            />
            
            <div className="modal-actions">
              <Button onClick={returnTool} loading={submitting}>Return Tool</Button>
              <Button variant="secondary" onClick={() => setShowReturnModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .tools-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .header-actions {
          display: flex;
          gap: 0.5rem;
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
          border-left: 3px solid #dc2626;
        }
        
        .filters {
          margin-bottom: 1.5rem;
        }
        
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        
        .tool-card {
          transition: transform 0.2s;
        }
        
        .tool-card:hover {
          transform: translateY(-2px);
        }
        
        .tool-card.checked-out {
          border-left: 3px solid #f59e0b;
        }
        
        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .tool-code {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }
        
        .tool-name {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .tool-sn {
          font-size: 0.7rem;
          color: #2563eb;
          margin-top: 0.25rem;
        }
        
        .tool-details {
          margin: 1rem 0;
          padding: 0.5rem 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }
        
        .detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
          font-size: 0.75rem;
        }
        
        .detail .label {
          color: var(--text-tertiary);
        }
        
        .detail .value {
          font-weight: 500;
        }
        
        .tool-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .item-summary {
          background: var(--bg-tertiary);
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        .checked-out-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .checkout-item {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-light);
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .checkout-item:hover {
          background: var(--bg-tertiary);
        }
        
        .checkout-item.overdue {
          background: #fef2f2;
          border-left: 3px solid #dc2626;
        }
        
        .checkout-tool {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .checkout-details {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-tertiary);
        }
        
        @media (max-width: 768px) {
          .tools-page {
            padding: 1rem;
          }
          .tools-grid {
            grid-template-columns: 1fr;
          }
          .checkout-details {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
