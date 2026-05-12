// app/organizations/new/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
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
    
    if (!formData.organization_name) {
      setError('Organization name is required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
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
        setError(data.error || 'Failed to create organization');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <h1>Authentication Required</h1>
        <p>Please log in to create organizations.</p>
        <Link href="/login" className="btn-primary">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <Link href="/organizations" className="back-link">← Back to Organizations</Link>
          <h1>Create New Organization</h1>
          <p>Add a parent company with complete billing and contact details</p>
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
                placeholder="e.g., Acme Corporation"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Organization Type</label>
              <select name="organization_type" value={formData.organization_type} onChange={handleChange}>
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
                value={formData.registration_number}
                onChange={handleChange}
                placeholder="Company registration number"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>VAT Number</label>
              <input
                type="text"
                name="vat_number"
                value={formData.vat_number}
                onChange={handleChange}
                placeholder="VAT registration number"
              />
            </div>
            <div className="form-group">
              <label>Tax Number</label>
              <input
                type="text"
                name="tax_number"
                value={formData.tax_number}
                onChange={handleChange}
                placeholder="Income tax number"
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
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@company.com"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+27 11 123 4567"
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.company.com"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group full-width">
            <label>Address Line 1</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>
          <div className="form-group full-width">
            <label>Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              placeholder="Suite, floor, etc."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="Postal code"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
            />
          </div>
        </div>

        {/* Bank Details */}
        <div className="form-section">
          <h3>Bank Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="Bank name"
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="bank_account_number"
                value={formData.bank_account_number}
                onChange={handleChange}
                placeholder="Account number"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Account Type</label>
              <select name="bank_account_type" value={formData.bank_account_type} onChange={handleChange}>
                {bankAccountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Branch Code</label>
              <input
                type="text"
                name="bank_branch_code"
                value={formData.bank_branch_code}
                onChange={handleChange}
                placeholder="Branch code"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>SWIFT Code</label>
              <input
                type="text"
                name="bank_swift_code"
                value={formData.bank_swift_code}
                onChange={handleChange}
                placeholder="SWIFT/BIC code"
              />
            </div>
            <div className="form-group">
              <label>IBAN</label>
              <input
                type="text"
                name="bank_iban"
                value={formData.bank_iban}
                onChange={handleChange}
                placeholder="IBAN (for international transfers)"
              />
            </div>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="form-section">
          <h3>Billing Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Billing Email</label>
              <input
                type="email"
                name="billing_email"
                value={formData.billing_email}
                onChange={handleChange}
                placeholder="billing@company.com"
              />
            </div>
            <div className="form-group">
              <label>Billing Phone</label>
              <input
                type="tel"
                name="billing_phone"
                value={formData.billing_phone}
                onChange={handleChange}
                placeholder="Billing contact number"
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Billing Address</label>
            <textarea
              name="billing_address"
              value={formData.billing_address}
              onChange={handleChange}
              rows="2"
              placeholder="Billing address (if different from main address)"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Payment Terms (days)</label>
              <input
                type="number"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                placeholder="30"
              />
            </div>
            <div className="form-group">
              <label>Credit Limit (R)</label>
              <input
                type="number"
                name="credit_limit"
                value={formData.credit_limit}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          <div className="form-group full-width">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional notes about this organization..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Organization'}
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
        .form-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden; }
        .form-section { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .form-section:last-child { border-bottom: none; }
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