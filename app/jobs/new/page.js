'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Button from '@/app/components/ui/Button/Button';
import { FormInput, FormSelect, FormCurrencyInput } from '@/app/components/ui/Form';
import ClientSelect from '@/app/components/common/ClientSelect';

export default function NewJobPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: clients } = useFetch('/api/clients');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lc_number: '',
    client_id: '',
    po_status: 'pending',
    completion_status: 'not_started',
    po_amount: '',
    total_budget: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      lc_number: formData.lc_number,
      client_id: formData.client_id || null,
      po_status: formData.po_status,
      completion_status: 'not_started',
      po_amount: formData.po_amount ? parseFloat(formData.po_amount) : null,
      total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null
    };
    
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newJob = await res.json();
        success('Job created successfully');
        router.push(`/jobs/${newJob.id}`);
      } else {
        const err = await res.json();
        toastError(err.error || 'Failed to create job');
      }
    } catch (err) {
      toastError('Error creating job');
    } finally {
      setLoading(false);
    }
  };

  const poStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="➕ Create New Job"
        description="Enter project details"
        action={<Link href="/jobs"><Button variant="secondary">← Back</Button></Link>}
      />
      
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <FormInput
          label="LC Number (Job Number)"
          name="lc_number"
          value={formData.lc_number}
          onChange={(e) => setFormData({...formData, lc_number: e.target.value})}
          required
          placeholder="e.g., LC-2024-001"
        />
        
        <ClientSelect
          value={formData.client_id}
          onChange={(e) => setFormData({...formData, client_id: e.target.value})}
        />
        
        <FormSelect
          label="PO Status"
          name="po_status"
          value={formData.po_status}
          onChange={(e) => setFormData({...formData, po_status: e.target.value})}
          options={poStatusOptions}
        />
        
        <FormCurrencyInput
          label="PO Amount (ZAR)"
          name="po_amount"
          value={formData.po_amount}
          onChange={(e) => setFormData({...formData, po_amount: e.target.value})}
          placeholder="0.00"
        />
        
        <FormCurrencyInput
          label="Total Budget (ZAR)"
          name="total_budget"
          value={formData.total_budget}
          onChange={(e) => setFormData({...formData, total_budget: e.target.value})}
          placeholder="0.00"
        />
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button type="submit" loading={loading}>Create Job</Button>
          <Link href="/jobs"><Button variant="secondary">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}