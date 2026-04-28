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
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import EmptyState from '@/app/components/ui/EmptyState';
import { FormInput, FormSelect, FormCurrencyInput, FormTextarea } from '@/app/components/ui/Form';

export default function StockPage() {
  const { success, error: toastError } = useToast();
  const { can } = usePermissions();
  const { data: stock, loading, refetch } = useFetch('/api/stock');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [movementType, setMovementType] = useState('IN');
  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    description: '',
    category: '',
    quantity_on_hand: 0,
    unit_of_measure: 'each',
    unit_cost: 0,
    selling_price: 0,
    min_stock_level: 5,
    max_stock_level: '',
    location: '',
  });
  const [movementData, setMovementData] = useState({
    quantity: '',
    reference_number: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [...new Set(stock?.map(item => item.category).filter(Boolean))];

  const filteredStock = stock?.filter(item => {
    const matchesSearch = item.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = !lowStockFilter || (item.quantity_on_hand < item.min_stock_level);
    return matchesSearch && matchesCategory && matchesLowStock;
  }) || [];

  const addStockItem = async () => {
    if (!formData.item_code || !formData.item_name) {
      toastError('Item code and name are required');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        success('Stock item added successfully');
        setShowAddModal(false);
        setFormData({
          item_code: '',
          item_name: '',
          description: '',
          category: '',
          quantity_on_hand: 0,
          unit_of_measure: 'each',
          unit_cost: 0,
          selling_price: 0,
          min_stock_level: 5,
          max_stock_level: '',
          location: '',
        });
        refetch();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to add stock item');
      }
    } catch (error) {
      toastError('Failed to add stock item');
    } finally {
      setSubmitting(false);
    }
  };

  const recordMovement = async () => {
    if (!selectedItem || !movementData.quantity || movementData.quantity <= 0) {
      toastError('Valid quantity is required');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/stock/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_item_id: selectedItem.id,
          movement_type: movementType,
          quantity: parseFloat(movementData.quantity),
          reference_number: movementData.reference_number,
          notes: movementData.notes,
        }),
      });
      
      if (res.ok) {
        success(`${movementType === 'IN' ? 'Stock received' : movementType === 'OUT' ? 'Stock issued' : 'Stock adjusted'} successfully`);
        setShowMovementModal(false);
        setMovementData({ quantity: '', reference_number: '', notes: '' });
        setSelectedItem(null);
        refetch();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to record movement');
      }
    } catch (error) {
      toastError('Failed to record movement');
    } finally {
      setSubmitting(false);
    }
  };

  const openMovementModal = (item, type) => {
    setSelectedItem(item);
    setMovementType(type);
    setMovementData({ quantity: '', reference_number: '', notes: '' });
    setShowMovementModal(true);
  };

  const lowStockCount = stock?.filter(item => item.quantity_on_hand < item.min_stock_level).length || 0;
  const totalValue = stock?.reduce((sum, item) => sum + (item.quantity_on_hand * (item.unit_cost || 0)), 0) || 0;

  if (loading) return <LoadingSpinner text="Loading inventory..." />;

  return (
    <div className="stock-page">
      <PageHeader 
        title="📦 Inventory Management"
        description="Manage stock items, track movements, and monitor stock levels"
        action={
          can('stock:create') && (
            <Button onClick={() => setShowAddModal(true)}>+ Add Stock Item</Button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card>
          <div className="stat-value">{stock?.length || 0}</div>
          <div className="stat-label">Total Items</div>
        </Card>
        <Card>
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-label">Low Stock Alert</div>
        </Card>
        <Card>
          <div className="stat-value"><CurrencyAmount amount={totalValue} /></div>
          <div className="stat-label">Total Inventory Value</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="filters">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by item code or name..."
        />
        <FilterBar
          filters={[
            {
              key: 'category',
              label: 'Category',
              type: 'select',
              options: [{ value: 'all', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))],
            },
            {
              key: 'lowStock',
              label: 'Low Stock Only',
              type: 'checkbox',
            },
          ]}
          onFilterChange={(filters) => {
            setCategoryFilter(filters.category || 'all');
            setLowStockFilter(filters.lowStock || false);
          }}
        />
      </div>

      {/* Stock Grid */}
      {filteredStock.length === 0 ? (
        <EmptyState 
          title="No stock items found"
          message="Add your first stock item to get started"
          actionText="Add Stock Item"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="stock-grid">
          {filteredStock.map(item => (
            <Card key={item.id} className={item.quantity_on_hand < item.min_stock_level ? 'low-stock' : ''}>
              <div className="stock-header">
                <div>
                  <div className="stock-code">{item.item_code}</div>
                  <div className="stock-name">{item.item_name}</div>
                  {item.category && <div className="stock-category">{item.category}</div>}
                </div>
                <div className="stock-status">
                  {item.quantity_on_hand < item.min_stock_level && (
                    <StatusBadge status="low_stock" size="sm" />
                  )}
                </div>
              </div>
              
              <div className="stock-details">
                <div className="detail">
                  <span className="label">On Hand:</span>
                  <span className="value">{item.quantity_on_hand} {item.unit_of_measure}</span>
                </div>
                <div className="detail">
                  <span className="label">Min Level:</span>
                  <span className="value">{item.min_stock_level} {item.unit_of_measure}</span>
                </div>
                <div className="detail">
                  <span className="label">Unit Cost:</span>
                  <span className="value"><CurrencyAmount amount={item.unit_cost} /></span>
                </div>
                <div className="detail">
                  <span className="label">Location:</span>
                  <span className="value">{item.location || '-'}</span>
                </div>
              </div>
              
              {can('stock:adjust') && (
                <div className="stock-actions">
                  <Button size="sm" variant="success" onClick={() => openMovementModal(item, 'IN')}>
                    + Receive
                  </Button>
                  <Button size="sm" variant="warning" onClick={() => openMovementModal(item, 'OUT')}>
                    - Issue
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openMovementModal(item, 'ADJUST')}>
                    Adjust
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Stock Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Stock Item">
        <div>
          <FormInput
            label="Item Code *"
            value={formData.item_code}
            onChange={e => setFormData({...formData, item_code: e.target.value})}
            required
          />
          <FormInput
            label="Item Name *"
            value={formData.item_name}
            onChange={e => setFormData({...formData, item_name: e.target.value})}
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
            label="Initial Quantity"
            type="number"
            step="0.01"
            value={formData.quantity_on_hand}
            onChange={e => setFormData({...formData, quantity_on_hand: parseFloat(e.target.value) || 0})}
          />
          <FormSelect
            label="Unit of Measure"
            value={formData.unit_of_measure}
            onChange={e => setFormData({...formData, unit_of_measure: e.target.value})}
            options={[
              { value: 'each', label: 'Each' },
              { value: 'meter', label: 'Meter' },
              { value: 'kg', label: 'KG' },
              { value: 'liter', label: 'Liter' },
              { value: 'box', label: 'Box' },
              { value: 'roll', label: 'Roll' },
            ]}
          />
          <FormCurrencyInput
            label="Unit Cost"
            value={formData.unit_cost}
            onChange={e => setFormData({...formData, unit_cost: parseFloat(e.target.value) || 0})}
          />
          <FormCurrencyInput
            label="Selling Price"
            value={formData.selling_price}
            onChange={e => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})}
          />
          <FormInput
            label="Min Stock Level"
            type="number"
            value={formData.min_stock_level}
            onChange={e => setFormData({...formData, min_stock_level: parseInt(e.target.value) || 0})}
          />
          <FormInput
            label="Max Stock Level"
            type="number"
            value={formData.max_stock_level}
            onChange={e => setFormData({...formData, max_stock_level: parseInt(e.target.value) || ''})}
          />
          <FormInput
            label="Location"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
          />
          <div className="modal-actions">
            <Button onClick={addStockItem} loading={submitting}>Add Item</Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Stock Movement Modal */}
      <Modal isOpen={showMovementModal} onClose={() => setShowMovementModal(false)} title={`${movementType === 'IN' ? 'Receive' : movementType === 'OUT' ? 'Issue' : 'Adjust'} Stock`}>
        {selectedItem && (
          <div>
            <div className="movement-info">
              <div><strong>Item:</strong> {selectedItem.item_name} ({selectedItem.item_code})</div>
              <div><strong>Current Stock:</strong> {selectedItem.quantity_on_hand} {selectedItem.unit_of_measure}</div>
            </div>
            
            <FormInput
              label="Quantity *"
              type="number"
              step="0.01"
              value={movementData.quantity}
              onChange={e => setMovementData({...movementData, quantity: e.target.value})}
              required
            />
            <FormInput
              label="Reference Number"
              value={movementData.reference_number}
              onChange={e => setMovementData({...movementData, reference_number: e.target.value})}
              placeholder="PO number, job number, etc."
            />
            <FormTextarea
              label="Notes"
              value={movementData.notes}
              onChange={e => setMovementData({...movementData, notes: e.target.value})}
              placeholder="Reason for movement..."
            />
            
            <div className="modal-actions">
              <Button onClick={recordMovement} loading={submitting}>
                {movementType === 'IN' ? 'Receive Stock' : movementType === 'OUT' ? 'Issue Stock' : 'Adjust Stock'}
              </Button>
              <Button variant="secondary" onClick={() => setShowMovementModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .stock-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        
        .filters {
          margin-bottom: 1.5rem;
        }
        
        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        
        .low-stock {
          border-left: 3px solid #f59e0b;
        }
        
        .stock-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .stock-code {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }
        
        .stock-name {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .stock-category {
          font-size: 0.7rem;
          color: #2563eb;
          margin-top: 0.25rem;
        }
        
        .stock-details {
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
        
        .stock-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        
        .movement-info {
          background: var(--bg-tertiary);
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
          .stock-page {
            padding: 1rem;
          }
          .stock-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}