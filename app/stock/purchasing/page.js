'use client';

import { useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/hooks/useToast';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import Modal from '@/app/components/ui/Modal/Modal';
import SearchBar from '@/app/components/ui/SearchBar';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import { FormInput, FormSelect, FormCurrencyInput, FormTextarea } from '@/app/components/ui/Form';

export default function PurchasingPage() {
  const { success, error: toastError } = useToast();
  const { data: stock, loading, refetch } = useFetch('/api/stock');
  const [search, setSearch] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseData, setPurchaseData] = useState({
    quantity: '',
    unit_cost: '',
    po_number: '',
    supplier: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredStock = stock?.filter(item =>
    item.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.item_code?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const recordPurchase = async () => {
    if (!selectedItem || !purchaseData.quantity || purchaseData.quantity <= 0) {
      toastError('Valid quantity is required');
      return;
    }
    
    setSubmitting(true);
    try {
      // First, update the stock item cost if provided
      if (purchaseData.unit_cost) {
        await fetch(`/api/stock/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unit_cost: parseFloat(purchaseData.unit_cost),
          }),
        });
      }
      
      // Record the stock movement
      const res = await fetch('/api/stock/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_item_id: selectedItem.id,
          movement_type: 'IN',
          quantity: parseFloat(purchaseData.quantity),
          reference_number: purchaseData.po_number,
          notes: `Purchase from ${purchaseData.supplier || 'supplier'}. ${purchaseData.notes || ''}`,
        }),
      });
      
      if (res.ok) {
        success('Purchase recorded successfully');
        setShowPurchaseModal(false);
        setPurchaseData({
          quantity: '',
          unit_cost: '',
          po_number: '',
          supplier: '',
          notes: '',
        });
        setSelectedItem(null);
        refetch();
      } else {
        const error = await res.json();
        toastError(error.error || 'Failed to record purchase');
      }
    } catch (error) {
      toastError('Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading stock items..." />;

  return (
    <div className="purchasing-page">
      <PageHeader 
        title="🛒 Stock Purchasing"
        description="Record new stock purchases and update inventory"
      />

      <div className="search-bar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search for item to purchase..."
        />
      </div>

      <div className="stock-list">
        {filteredStock.length === 0 ? (
          <Card>
            <div className="empty-state">
              No stock items found. Add items in Inventory Management first.
            </div>
          </Card>
        ) : (
          filteredStock.map(item => (
            <Card key={item.id} className="stock-item">
              <div className="item-info">
                <div className="item-code">{item.item_code}</div>
                <div className="item-name">{item.item_name}</div>
                <div className="item-stock">
                  Current Stock: {item.quantity_on_hand} {item.unit_of_measure}
                </div>
                <div className="item-cost">
                  Current Cost: <CurrencyAmount amount={item.unit_cost} />
                </div>
              </div>
              <div className="item-actions">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setSelectedItem(item);
                    setShowPurchaseModal(true);
                  }}
                >
                  Record Purchase
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Purchase Modal */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Record Purchase Order">
        {selectedItem && (
          <div>
            <div className="item-summary">
              <div><strong>Item:</strong> {selectedItem.item_name}</div>
              <div><strong>Current Stock:</strong> {selectedItem.quantity_on_hand} {selectedItem.unit_of_measure}</div>
              <div><strong>Current Cost:</strong> <CurrencyAmount amount={selectedItem.unit_cost} /></div>
            </div>
            
            <FormInput
              label="Quantity Purchased *"
              type="number"
              step="0.01"
              value={purchaseData.quantity}
              onChange={e => setPurchaseData({...purchaseData, quantity: e.target.value})}
              required
            />
            <FormCurrencyInput
              label="New Unit Cost (optional)"
              value={purchaseData.unit_cost}
              onChange={e => setPurchaseData({...purchaseData, unit_cost: e.target.value})}
              placeholder="Leave blank to keep current cost"
            />
            <FormInput
              label="PO Number"
              value={purchaseData.po_number}
              onChange={e => setPurchaseData({...purchaseData, po_number: e.target.value})}
              placeholder="Purchase order reference"
            />
            <FormInput
              label="Supplier"
              value={purchaseData.supplier}
              onChange={e => setPurchaseData({...purchaseData, supplier: e.target.value})}
            />
            <FormTextarea
              label="Notes"
              value={purchaseData.notes}
              onChange={e => setPurchaseData({...purchaseData, notes: e.target.value})}
              placeholder="Additional notes about this purchase"
            />
            
            <div className="modal-actions">
              <Button onClick={recordPurchase} loading={submitting}>
                Record Purchase
              </Button>
              <Button variant="secondary" onClick={() => setShowPurchaseModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .purchasing-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .search-bar {
          margin-bottom: 1.5rem;
        }
        
        .stock-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .stock-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .item-info {
          flex: 1;
        }
        
        .item-code {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }
        
        .item-name {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .item-stock, .item-cost {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        
        .item-summary {
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
        
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-tertiary);
        }
        
        @media (max-width: 768px) {
          .purchasing-page {
            padding: 1rem;
          }
          .stock-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}