// app/organizations/[id]/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    registration_number: '',
    vat_number: '',
    tax_number: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'South Africa',
    bank_name: '',
    bank_account_number: '',
    bank_account_type: 'Cheque',
    bank_branch_code: '',
    bank_swift_code: '',
    bank_iban: '',
    billing_email: '',
    billing_phone: '',
    billing_address: '',
    payment_terms: 30,
    credit_limit: '',
    notes: ''
  });

  const organizationTypes = [
    'Corporate', 'Warehouse', 'Office', 'Airport', 'Fuel Depot',
    'Retail Store', 'Distribution Center', 'Manufacturing Plant',
    'Construction Site', 'Mining Site', 'Other'
  ];

  const bankAccountTypes = ['Cheque', 'Savings', 'Transmission', 'Current'];

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchOrganization();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching organization:', error);
      setError('Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/organizations/${params.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/organizations');
      } else {
        setError(data.error || 'Failed to update organization');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading organization...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <Link href="/organizations" className="back-link">← Back to Organizations</Link>
          <h1>Edit Organization</h1>
          <p>Update organization details</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Organization Name *</label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Organization Type</label>
              <select name="organization_type" value={formData.organization_type || ''} onChange={handleChange}>
                <option value="">Select Type</option>
                {organizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>VAT Number</label>
              <input
                type="text"
                name="vat_number"
                value={formData.vat_number || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Tax Number</label>
              <input
                type="text"
                name="tax_number"
                value={formData.tax_number || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Website</label>
            <input type="url" name="website" value={formData.website || ''} onChange={handleChange} />
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group full-width">
            <label>Address Line 1</label>
            <input type="text" name="address_line1" value={formData.address_line1 || ''} onChange={handleChange} />
          </div>
          <div className="form-group full-width">
            <label>Address Line 2</label>
            <input type="text" name="address_line2" value={formData.address_line2 || ''} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Country</label>
            <input type="text" name="country" value={formData.country || ''} onChange={handleChange} />
          </div>
        </div>

        {/* Bank Details */}
        <div className="form-section">
          <h3>Bank Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Bank Name</label>
              <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input type="text" name="bank_account_number" value={formData.bank_account_number || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Account Type</label>
              <select name="bank_account_type" value={formData.bank_account_type || 'Cheque'} onChange={handleChange}>
                {bankAccountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Branch Code</label>
              <input type="text" name="bank_branch_code" value={formData.bank_branch_code || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>SWIFT Code</label>
              <input type="text" name="bank_swift_code" value={formData.bank_swift_code || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>IBAN</label>
              <input type="text" name="bank_iban" value={formData.bank_iban || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="form-section">
          <h3>Billing Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Billing Email</label>
              <input type="email" name="billing_email" value={formData.billing_email || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Billing Phone</label>
              <input type="tel" name="billing_phone" value={formData.billing_phone || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Billing Address</label>
            <textarea name="billing_address" value={formData.billing_address || ''} onChange={handleChange} rows="2" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Payment Terms (days)</label>
              <input type="number" name="payment_terms" value={formData.payment_terms || 30} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Credit Limit (R)</label>
              <input type="number" name="credit_limit" value={formData.credit_limit || ''} onChange={handleChange} step="0.01" />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          <div className="form-group full-width">
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows="3" />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/organizations" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .form-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2rem; }
        .back-link { color: #64748b; text-decoration: none; display: inline-block; margin-bottom: 0.5rem; font-size: 0.875rem; }
        .back-link:hover { color: #22c55e; }
        .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b; }
        .page-header p { margin: 0.25rem 0 0; color: #64748b; }
        .error-message { background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #22c55e; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden; }
        .form-section { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .form-section h3 { margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-group { display: flex; flex-direction: column; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { margin-bottom: 0.375rem; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; color: #64748b; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.625rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; background: white; color: #1e293b; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
        .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn-primary { background: #22c55e; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
        .btn-primary:hover { background: #16a34a; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: #64748b; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
        .btn-secondary:hover { background: #475569; }
        @media (max-width: 768px) {
          .form-container { padding: 1rem; }
          .form-row { grid-template-columns: 1fr; }
          .form-group.full-width { grid-column: span 1; }
          .form-actions { flex-direction: column; }
          .form-actions button, .form-actions a { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  );
}