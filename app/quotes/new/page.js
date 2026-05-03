'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewQuotePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
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
    status: 'draft'
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
    if (isAuthenticated && token) {
      fetchClients();
    }
  }, [isAuthenticated, token]);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      const clientsList = Array.isArray(data) ? data : (data.data || []);
      setClients(clientsList);
      console.log('Clients loaded:', clientsList.length);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toastError('Failed to load clients');
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
    
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        success('Quote created successfully');
        router.push(`/quotes/${data.data.id}`);
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
    <div className="quote-container">
      <div className="page-header">
        <div>
          <h1>Create New Quote</h1>
          <p>Fill in quote details and add line items</p>
        </div>
        <Link href="/quotes" className="btn-secondary">Back to Quotes</Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Quote Details Section */}
        <div className="card">
          <h3>Quote Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                required
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
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Quote Date *</label>
              <input
                type="date"
                value={formData.quote_date}
                onChange={(e) => setFormData({...formData, quote_date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Quote Prepared By</label>
              <input
                type="text"
                value={formData.quote_prepared_by}
                onChange={(e) => setFormData({...formData, quote_prepared_by: e.target.value})}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="draft">Draft</option>
                <option value="sent">Send to Client</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Scope / Subject</label>
            <textarea
              value={formData.scope_subject}
              onChange={(e) => setFormData({...formData, scope_subject: e.target.value})}
              rows="3"
              placeholder="Describe the scope of work..."
            />
          </div>
        </div>

        {/* Line Items Section */}
        <div className="card">
          <h3>Quote Items</h3>
          
          {/* Add Item Form */}
          <div className="add-item-section">
            <div className="add-item-grid">
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  placeholder="Item description"
                />
              </div>
              <div className="form-group">
                <label>Additional Description</label>
                <input
                  type="text"
                  value={currentItem.additional_description}
                  onChange={(e) => setCurrentItem({...currentItem, additional_description: e.target.value})}
                  placeholder="Optional details"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={currentItem.unit}
                  onChange={(e) => setCurrentItem({...currentItem, unit: e.target.value})}
                  placeholder="e.g., Hour, Day, Meter"
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="form-group">
                <label>Unit of Measure</label>
                <select
                  value={currentItem.unit_of_measure}
                  onChange={(e) => setCurrentItem({...currentItem, unit_of_measure: e.target.value})}
                >
                  <option value="each">Each</option>
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="meter">Meter</option>
                  <option value="kg">KG</option>
                  <option value="lot">Lot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price Ex VAT *</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentItem.price_ex_vat}
                  onChange={(e) => setCurrentItem({...currentItem, price_ex_vat: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <button type="button" onClick={addItem} className="btn-add">Add Item</button>
          </div>
          
          {/* Items Table */}
          {items.length > 0 && (
            <div className="table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>UoM</th>
                    <th>Unit Price</th>
                    <th>Total Ex VAT</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.item_number}</td>
                      <td>
                        <strong>{item.description}</strong>
                        {item.additional_description && <div className="item-sub">{item.additional_description}</div>}
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItemField(idx, 'quantity', e.target.value)}
                          className="item-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) => updateItemField(idx, 'unit', e.target.value)}
                          className="item-input"
                        />
                      </td>
                      <td>
                        <select
                          value={item.unit_of_measure}
                          onChange={(e) => updateItemField(idx, 'unit_of_measure', e.target.value)}
                          className="item-select"
                        >
                          <option value="each">Each</option>
                          <option value="hour">Hour</option>
                          <option value="day">Day</option>
                          <option value="meter">Meter</option>
                          <option value="kg">KG</option>
                          <option value="lot">Lot</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price_ex_vat}
                          onChange={(e) => updateItemField(idx, 'price_ex_vat', e.target.value)}
                          className="item-input"
                        />
                      </td>
                      <td className="amount">R {(item.quantity * item.price_ex_vat).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>
                        <button type="button" onClick={() => removeItem(idx)} className="btn-remove">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="total-label">Subtotal Ex VAT:</td>
                    <td className="amount">R {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="total-label">VAT (15%):</td>
                    <td className="amount">R {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td></td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan="6" className="total-label">Total:</td>
                    <td className="amount">R {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Quote'}
          </button>
          <Link href="/quotes" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .quote-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: var(--text-tertiary);
        }
        .card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .full-width {
          grid-column: span 2;
          margin-top: 1rem;
        }
        .form-group {
          margin-bottom: 0;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .add-item-section {
          background: var(--bg-tertiary);
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .add-item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .btn-add {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .btn-add:hover {
          background: var(--primary-dark);
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
        }
        .items-table th {
          text-align: left;
          padding: 0.75rem;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-light);
          background: var(--bg-tertiary);
        }
        .items-table td {
          padding: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-light);
        }
        .item-input {
          width: 80px;
          padding: 0.25rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.25rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .item-select {
          width: 80px;
          padding: 0.25rem;
          border: 1px solid var(--border-medium);
          border-radius: 0.25rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .item-sub {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-top: 0.25rem;
        }
        .amount {
          text-align: right;
          font-weight: 500;
        }
        .btn-remove {
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }
        .btn-remove:hover {
          background: var(--danger-dark);
        }
        .total-label {
          text-align: right;
          font-weight: 500;
        }
        .total-row {
          background: var(--success-bg);
          font-weight: 700;
        }
        .total-row td {
          color: var(--success-dark);
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--secondary);
          color: white;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
        }
        .btn-secondary:hover {
          background: var(--secondary-dark);
        }
        @media (max-width: 768px) {
          .quote-container {
            padding: 1rem;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
          .add-item-grid {
            grid-template-columns: 1fr;
          }
          .items-table {
            font-size: 0.75rem;
          }
          .item-input, .item-select {
            width: 60px;
          }
        }
      `}</style>
    </div>
  );
}