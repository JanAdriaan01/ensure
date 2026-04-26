'use client';

import { useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/context/ToastContext';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import Button from '@/app/components/ui/Button/Button';
import Card from '@/app/components/ui/Card/Card';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';
import Modal from '@/app/components/ui/Modal/Modal';
import CurrencyAmount from '@/app/components/CurrencyAmount';
import { FormInput, FormSelect, FormCurrencyInput } from '@/app/components/ui/Form';

export default function ToolsPage() {
  const { success, error: toastError } = useToast();
  const { data: tools, loading, refetch } = useFetch('/api/tools');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTool, setNewTool] = useState({
    tool_code: '',
    tool_name: '',
    category: '',
    serial_number: '',
    purchase_cost: 0,
    location: ''
  });

  const addTool = async () => {
    if (!newTool.tool_code || !newTool.tool_name) {
      toastError('Tool code and name are required');
      return;
    }
    const res = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTool)
    });
    if (res.ok) {
      success('Tool added');
      setShowAddModal(false);
      setNewTool({ tool_code: '', tool_name: '', category: '', serial_number: '', purchase_cost: 0, location: '' });
      refetch();
    }
  };

  if (loading) return <LoadingSpinner text="Loading tools..." />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <PageHeader 
        title="🔧 Tools Management" 
        description="Manage all tools and equipment"
        action={<Button onClick={() => setShowAddModal(true)}>+ Add Tool</Button>}
      />

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{tools?.length || 0}</div><div className="stat-label">Total Tools</div></div>
        <div className="stat-card"><div className="stat-value">{tools?.filter(t => t.status === 'available').length || 0}</div><div className="stat-label">Available</div></div>
        <div className="stat-card"><div className="stat-value">{tools?.filter(t => t.status === 'checked_out').length || 0}</div><div className="stat-label">Checked Out</div></div>
      </div>

      <div className="tools-grid">
        {tools?.map(tool => (
          <Card key={tool.id} className={tool.status === 'checked_out' ? 'checked-out' : ''}>
            <div className="tool-header">
              <strong>{tool.tool_code}</strong>
              <span className={`tool-status status-${tool.status}`}>{tool.status || 'available'}</span>
            </div>
            <div className="tool-name">{tool.tool_name}</div>
            <div className="tool-details">
              <div>SN: {tool.serial_number || '-'}</div>
              <div>Location: {tool.location || '-'}</div>
              <div>Cost: <CurrencyAmount amount={tool.purchase_cost} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Tool">
        <FormInput label="Tool Code" value={newTool.tool_code} onChange={e => setNewTool({...newTool, tool_code: e.target.value})} required />
        <FormInput label="Tool Name" value={newTool.tool_name} onChange={e => setNewTool({...newTool, tool_name: e.target.value})} required />
        <FormInput label="Category" value={newTool.category} onChange={e => setNewTool({...newTool, category: e.target.value})} />
        <FormInput label="Serial Number" value={newTool.serial_number} onChange={e => setNewTool({...newTool, serial_number: e.target.value})} />
        <FormCurrencyInput label="Purchase Cost" value={newTool.purchase_cost} onChange={e => setNewTool({...newTool, purchase_cost: parseFloat(e.target.value)})} />
        <FormInput label="Location" value={newTool.location} onChange={e => setNewTool({...newTool, location: e.target.value})} />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button onClick={addTool}>Add Tool</Button>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
        </div>
      </Modal>

      <style jsx>{`
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .stat-card { background: white; padding: 1rem; border-radius: 0.75rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-value { font-size: 1.5rem; font-weight: bold; }
        .stat-label { font-size: 0.75rem; color: #6b7280; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .tool-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .tool-name { font-weight: bold; margin-bottom: 0.5rem; }
        .tool-details { font-size: 0.75rem; color: #6b7280; }
        .tool-status { font-size: 0.7rem; padding: 0.125rem 0.5rem; border-radius: 9999px; }
        .status-available { background: #d1fae5; color: #065f46; }
        .status-checked_out { background: #fef3c7; color: #92400e; }
        :global(.checked-out) { border: 1px solid #f59e0b; }
      `}</style>
    </div>
  );
}