'use client';

import { useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Button from '@/app/components/ui/Button/Button';
import Card from '@/app/components/ui/Card/Card';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import Modal from '@/app/components/ui/Modal/Modal';
import { FormInput, FormCurrencyInput } from '@/app/components/ui/Form';

export default function StockPurchasingPage() {
  const { success, error: toastError } = useToast();
  const { data: stock, loading, refetch } = useFetch('/api/stock');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    item_code: '',
    item_name: '',
    category: '',
    quantity_on_hand: 0,
    unit_cost: 0,
    selling_price: 0,
    min_stock_level: 5
  });

  const addStockItem = async () => {
    if (!newItem.item_code || !newItem.item_name) {
      toastError('Item code and name are required');
      return;
    }
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    if (res.ok) {
      success('Stock item added');
      setShowAddModal(false);
      setNewItem({ item_code: '', item_name: '', category: '', quantity_on_hand: 0, unit_cost: 0, selling_price: 0, min_stock_level: 5 });
      refetch();
    }
  };

  if (loading) return <LoadingSpinner text="Loading stock..." />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="🛒 Stock Purchasing" 
        description="Manage inventory and stock items"
        action={<Button onClick={() => setShowAddModal(true)}>+ Add Stock Item</Button>}
      />

      <div className="stock-grid">
        {stock?.map(item => (
          <Card key={item.id} className={item.quantity_on_hand < item.min_stock_level ? 'low-stock' : ''}>
            <div className="stock-header">
              <strong>{item.item_code}</strong>
              <span>{item.item_name}</span>
            </div>
            <div className="stock-details">
              <div>On Hand: {item.quantity_on_hand} {item.unit_of_measure || 'units'}</div>
              <div>Cost: <CurrencyAmount amount={item.unit_cost} /></div>
              <div>Selling: <CurrencyAmount amount={item.selling_price} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Stock Item">
        <FormInput label="Item Code" value={newItem.item_code} onChange={e => setNewItem({...newItem, item_code: e.target.value})} required />
        <FormInput label="Item Name" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required />
        <FormInput label="Category" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} />
        <FormInput label="Quantity on Hand" type="number" value={newItem.quantity_on_hand} onChange={e => setNewItem({...newItem, quantity_on_hand: parseInt(e.target.value)})} />
        <FormCurrencyInput label="Unit Cost" value={newItem.unit_cost} onChange={e => setNewItem({...newItem, unit_cost: parseFloat(e.target.value)})} />
        <FormCurrencyInput label="Selling Price" value={newItem.selling_price} onChange={e => setNewItem({...newItem, selling_price: parseFloat(e.target.value)})} />
        <FormInput label="Min Stock Level" type="number" value={newItem.min_stock_level} onChange={e => setNewItem({...newItem, min_stock_level: parseInt(e.target.value)})} />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button onClick={addStockItem}>Add Item</Button>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
        </div>
      </Modal>

      <style jsx>{`
        .stock-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .stock-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .stock-details { font-size: 0.875rem; color: #6b7280; }
        :global(.low-stock) { border: 1px solid #f59e0b; background: #fffbeb; }
      `}</style>
    </div>
  );
}