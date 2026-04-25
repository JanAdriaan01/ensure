'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Button from '@/app/components/ui/Button/Button';
import Card from '@/app/components/ui/Card/Card';

export default function NewQuotePage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    site_name: '',
    contact_person: '',
    quote_date: new Date().toISOString().split('T')[0],
    quote_prepared_by: '',
    scope_subject: '',
    status: 'pending'
  });
  
  // Line items
  const [items, setItems] = useState([]);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    description: '',
    additional_description: '',
    unit: '',
    quantity: 1,
    unit_of_measure: 'each',
    price_ex_vat: 0
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const addItem = () => {
    if (!currentItem.description.trim()) {
      toastError('Item description is required');
      return;
    }
    
    if (currentItem.quantity <= 0) {
      toastError('Quantity must be greater than 0');
      return;
    }
    
    if (currentItem.price_ex_vat < 0) {
      toastError('Price cannot be negative');
      return;
    }
    
    setItems([...items, { 
      item_number: items.length + 1,
      description: currentItem.description,
      additional_description: currentItem.additional_description,
      unit: currentItem.unit,
      quantity: parseFloat(currentItem.quantity),
      unit_of_measure: currentItem.unit_of_measure,
      price_ex_vat: parseFloat(currentItem.price_ex_vat)
    }]);
    
    // Reset current item
    setCurrentItem({
      description: '',
      additional_description: '',
      unit: '',
      quantity: 1,
      unit_of_measure: 'each',
      price_ex_vat: 0
    });
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    // Renumber items
    const renumbered = newItems.map((item, idx) => ({ ...item, item_number: idx + 1 }));
    setItems(renumbered);
  };

  const updateItemField = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'quantity' || field === 'price_ex_vat' ? parseFloat(value) || 0 : value;
    setItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price_ex_vat), 0);
    const vatAmount = subtotal * 0.15;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `Q-${year}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toastError('Please select a client');
      return;
    }
    
    if (items.length === 0) {
      toastError('Please add at least one item to the quote');
      return;
    }
    
    setLoading(true);
    
    const payload = {
      quote_number: generateQuoteNumber(),
      client_id: parseInt(formData.client_id),
      site_name: formData.site_name,
      contact_person: formData.contact_person,
      quote_date: formData.quote_date,
      quote_prepared_by: formData.quote_prepared_by,
      scope_subject: formData.scope_subject,
      status: formData.status,
      subtotal: subtotal,
      vat_amount: vatAmount,
      total_amount: total,
      items: items.map(item => ({
        item_number: item.item_number,
        description: item.description,
        additional_description: item.additional_description,
        unit: item.unit,
        quantity: item.quantity,
        unit_of_measure: item.unit_of_measure,
        price_ex_vat: item.price_ex_vat
      }))
    };
    
    console.log('Submitting quote:', payload);
    
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        success('Quote created successfully');
        router.push(`/quotes/${data.id}`);
      } else {
        toastError(data.error || 'Failed to create quote');
      }
    } catch (err) {
      console.error('Error:', err);
      toastError('Error creating quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="➕ Create New Quote"
        description="Fill in quote details and add line items"
        action={<Link href="/quotes"><Button variant="secondary">← Back to Quotes</Button></Link>}
      />
      
      <form onSubmit={handleSubmit}>
        {/* Quote Details Section */}
        <Card>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Quote Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label>Client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                required
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              >
                <option value="">-- Select Client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.client_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData({...formData, site_name: e.target.value})}
                placeholder="e.g., Cape Town Main Site"
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              />
            </div>
            <div className="form-group">
              <label>Quote Date *</label>
              <input
                type="date"
                value={formData.quote_date}
                onChange={(e) => setFormData({...formData, quote_date: e.target.value})}
                required
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              />
            </div>
            <div className="form-group">
              <label>Quote Prepared By</label>
              <input
                type="text"
                value={formData.quote_prepared_by}
                onChange={(e) => setFormData({...formData, quote_prepared_by: e.target.value})}
                placeholder="Your name"
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Scope / Subject</label>
            <textarea
              value={formData.scope_subject}
              onChange={(e) => setFormData({...formData, scope_subject: e.target.value})}
              rows="3"
              placeholder="Describe the scope of work..."
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            />
          </div>
        </Card>

        {/* Line Items Section */}
        <Card style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Quote Items</h3>
          
          {/* Add Item Form */}
          <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Description *</label>
                <input
                  type="text"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  placeholder="Item description"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Additional Description</label>
                <input
                  type="text"
                  value={currentItem.additional_description}
                  onChange={(e) => setCurrentItem({...currentItem, additional_description: e.target.value})}
                  placeholder="Optional details"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Unit</label>
                <input
                  type="text"
                  value={currentItem.unit}
                  onChange={(e) => setCurrentItem({...currentItem, unit: e.target.value})}
                  placeholder="e.g., Hour, Day, Meter"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value) || 0})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Unit of Measure</label>
                <select
                  value={currentItem.unit_of_measure}
                  onChange={(e) => setCurrentItem({...currentItem, unit_of_measure: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                >
                  <option value="each">Each</option>
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="meter">Meter</option>
                  <option value="kg">KG</option>
                  <option value="lot">Lot</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Price Ex VAT *</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentItem.price_ex_vat}
                  onChange={(e) => setCurrentItem({...currentItem, price_ex_vat: parseFloat(e.target.value) || 0})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>
            <Button type="button" onClick={addItem} style={{ marginTop: '1rem' }}>+ Add Item</Button>
          </div>
          
          {/* Items Table */}
          {items.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Qty</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Unit</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>UoM</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Unit Price</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Ex VAT</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}>{item.item_number}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <strong>{item.description}</strong>
                        {item.additional_description && <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.additional_description}</div>}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItemField(idx, 'quantity', e.target.value)}
                          style={{ width: '70px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) => updateItemField(idx, 'unit', e.target.value)}
                          style={{ width: '80px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <select
                          value={item.unit_of_measure}
                          onChange={(e) => updateItemField(idx, 'unit_of_measure', e.target.value)}
                          style={{ width: '80px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                        >
                          <option value="each">Each</option>
                          <option value="hour">Hour</option>
                          <option value="day">Day</option>
                          <option value="meter">Meter</option>
                          <option value="kg">KG</option>
                          <option value="lot">Lot</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price_ex_vat}
                          onChange={(e) => updateItemField(idx, 'price_ex_vat', e.target.value)}
                          style={{ width: '90px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        R {(item.quantity * item.price_ex_vat).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(idx)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f9fafb' }}>
                    <td colSpan="6" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Subtotal Ex VAT:</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                      R {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="6" style={{ padding: '0.75rem', textAlign: 'right' }}>VAT (15%):</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      R {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td colSpan="6" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>Total:</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      R {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '0.625rem 1.25rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
            {loading ? 'Creating...' : 'Create Quote'}
          </button>
          <Link href="/quotes">
            <button type="button" style={{ background: '#6b7280', color: 'white', padding: '0.625rem 1.25rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
          </Link>
        </div>
      </form>

      <style jsx>{`
        .form-group {
          margin-bottom: 0;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 500;
          font-size: 0.75rem;
          color: #374151;
        }
        table th {
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}