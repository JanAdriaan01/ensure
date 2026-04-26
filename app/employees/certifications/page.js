'use client';

import { useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Button from '@/app/components/ui/Button/Button';
import Card from '@/app/components/ui/Card/Card';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import Modal from '@/app/components/ui/Modal/Modal';
import { FormInput } from '@/app/components/ui/Form';

export default function EmployeeCertificationsPage() {
  const { success, error: toastError } = useToast();
  const { data: certifications, loading, refetch } = useFetch('/api/employees/certifications');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCert, setNewCert] = useState({ certification_name: '' });

  const addCertification = async () => {
    if (!newCert.certification_name) {
      toastError('Certification name is required');
      return;
    }
    const res = await fetch('/api/employees/certifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCert)
    });
    if (res.ok) {
      success('Certification added');
      setShowAddModal(false);
      setNewCert({ certification_name: '' });
      refetch();
    }
  };

  if (loading) return <LoadingSpinner text="Loading certifications..." />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="📜 Add Certificate" 
        description="Manage employee certifications database"
        action={<Button onClick={() => setShowAddModal(true)}>+ Add Certificate</Button>}
      />
      <div className="certs-grid">
        {certifications?.map(cert => (
          <Card key={cert.id}>{cert.certification_name}</Card>
        ))}
      </div>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Certification">
        <FormInput label="Certification Name" value={newCert.certification_name} onChange={e => setNewCert({ certification_name: e.target.value })} required />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button onClick={addCertification}>Add Certification</Button>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
        </div>
      </Modal>
      <style jsx>{`
        .certs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; }
      `}</style>
    </div>
  );
}