'use client'

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

export default function EmployeeSkillsPage() {
  const { success, error: toastError } = useToast();
  const { data: skills, loading, refetch } = useFetch('/api/employees/skills');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ skill_name: '' });

  const addSkill = async () => {
    if (!newSkill.skill_name) {
      toastError('Skill name is required');
      return;
    }
    const res = await fetch('/api/employees/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSkill)
    });
    if (res.ok) {
      success('Skill added');
      setShowAddModal(false);
      setNewSkill({ skill_name: '' });
      refetch();
    }
  };

  if (loading) return <LoadingSpinner text="Loading skills..." />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="⭐ Add Skill" 
        description="Manage employee skills database"
        action={<Button onClick={() => setShowAddModal(true)}>+ Add Skill</Button>}
      />
      <div className="skills-grid">
        {skills?.map(skill => (
          <Card key={skill.id}>{skill.skill_name}</Card>
        ))}
      </div>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Skill">
        <FormInput label="Skill Name" value={newSkill.skill_name} onChange={e => setNewSkill({ skill_name: e.target.value })} required />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button onClick={addSkill}>Add Skill</Button>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
        </div>
      </Modal>
      <style jsx>{`
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
      `}</style>
    </div>
  );
}
