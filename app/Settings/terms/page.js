'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsManagerPage() {
  const [templates, setTemplates] = useState([]);
  const [groupedTemplates, setGroupedTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'standard',
    description: '',
    content: '',
    is_active: true,
    is_default: false
  });

  const categories = [
    { value: 'standard', label: 'Standard', description: 'General terms for all quotes' },
    { value: 'tender', label: 'Tender', description: 'Terms for tender submissions' },
    { value: 'client', label: 'Client Type', description: 'Private, Business, Government clients' },
    { value: 'project_size', label: 'Project Size', description: 'Small, Medium, Large projects' },
    { value: 'supply_type', label: 'Supply Type', description: 'Materials only, Labour only, Supply & Install' },
    { value: 'custom', label: 'Custom', description: 'Custom terms for specific situations' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/settings/terms');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
        setGroupedTemplates(data.grouped || {});
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (e) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: name,
      slug: generateSlug(name)
    }));
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      slug: '',
      category: 'standard',
      description: '',
      content: '',
      is_active: true,
      is_default: false
    });
    setShowModal(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      category: template.category,
      description: template.description || '',
      content: template.content,
      is_active: template.is_active,
      is_default: template.is_default
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const url = editingTemplate 
        ? `/api/settings/terms?id=${editingTemplate.id}`
        : '/api/settings/terms';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: editingTemplate ? 'Template updated successfully!' : 'Template created successfully!' });
        setShowModal(false);
        fetchTemplates();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save template' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/settings/terms?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Template deleted successfully!' });
        fetchTemplates();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete template' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const getCategoryLabel = (category) => {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading terms templates...</p>
      </div>
    );
  }

  return (
    <div className="terms-manager">
      <div className="page-header">
        <div>
          <Link href="/Settings" className="back-link">← Back to Settings</Link>
          <h1>Terms & Conditions</h1>
          <p>Manage terms and conditions templates for different situations</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">+ New Template</button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Categories Section */}
      <div className="categories-section">
        {categories.map(cat => {
          const categoryTemplates = templates.filter(t => t.category === cat.value);
          if (categoryTemplates.length === 0) return null;
          
          return (
            <div key={cat.value} className="category-group">
              <div className="category-header">
                <h2>{cat.label}</h2>
                <p>{cat.description}</p>
              </div>
              <div className="templates-grid">
                {categoryTemplates.map(template => (
                  <div key={template.id} className="template-card">
                    <div className="template-header">
                      <div className="template-title">
                        <h3>{template.name}</h3>
                        {template.is_default && <span className="badge default">Default</span>}
                        {!template.is_active && <span className="badge inactive">Inactive</span>}
                      </div>
                      <div className="template-actions">
                        <button onClick={() => openEditModal(template)} className="action-btn edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(template.id, template.name)} className="action-btn delete">
                          Delete
                        </button>
                      </div>
                    </div>
                    {template.description && (
                      <p className="template-description">{template.description}</p>
                    )}
                    <div className="template-preview">
                      <div dangerouslySetInnerHTML={{ __html: template.content.substring(0, 200) + (template.content.length > 200 ? '...' : '') }} />
                    </div>
                    <div className="template-meta">
                      <span className="meta-item">Slug: {template.slug}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g., Standard Terms, Small Project Terms"
                />
              </div>

              <div className="form-group">
                <label>Slug (URL identifier) *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="standard_terms"
                />
                <small>Unique identifier. Use lowercase letters, numbers, and underscores.</small>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of when to use these terms"
                />
              </div>

              <div className="form-group">
                <label>Terms & Conditions Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleContentChange}
                  required
                  rows="10"
                  placeholder="Enter HTML or plain text terms and conditions..."
                />
                <small>HTML formatting supported (h3, p, ul, li, etc.)</small>
              </div>

              <div className="form-row">
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    Active (available for use in quotes)
                  </label>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleChange}
                    />
                    Set as Default (used when no specific terms selected)
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : (editingTemplate ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .terms-manager {
          max-width: 1280px;
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
        .back-link {
          color: var(--text-tertiary);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        .back-link:hover {
          color: var(--primary);
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: var(--text-tertiary);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .message {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .message.success {
          background: var(--success-bg);
          color: var(--success-dark);
          border: 1px solid var(--success-light);
        }
        .message.error {
          background: var(--danger-bg);
          color: var(--danger-dark);
          border: 1px solid var(--danger-light);
        }
        .categories-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .category-group {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .category-header {
          background: var(--bg-tertiary);
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .category-header h2 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .category-header p {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
          padding: 1rem;
        }
        .template-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.2s;
        }
        .template-card:hover {
          border-color: var(--primary-light);
          box-shadow: var(--shadow-sm);
        }
        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .template-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .template-title h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .badge {
          font-size: 0.6rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-weight: 500;
        }
        .badge.default {
          background: var(--success-bg);
          color: var(--success-dark);
        }
        .badge.inactive {
          background: var(--warning-bg);
          color: var(--warning-dark);
        }
        .template-actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          background: none;
          border: none;
          font-size: 0.7rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
        .action-btn.edit {
          color: var(--primary);
        }
        .action-btn.edit:hover {
          background: var(--primary-bg);
        }
        .action-btn.delete {
          color: var(--danger);
        }
        .action-btn.delete:hover {
          background: var(--danger-bg);
        }
        .template-description {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-bottom: 0.75rem;
        }
        .template-preview {
          font-size: 0.7rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 0.5rem;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
          max-height: 80px;
          overflow: hidden;
        }
        .template-meta {
          font-size: 0.6rem;
          color: var(--text-tertiary);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--card-bg);
          border-radius: 0.75rem;
          width: 90%;
          max-width: 700px;
          max-height: 85vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-tertiary);
        }
        .modal-form {
          padding: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
        .form-group.checkbox {
          display: flex;
          align-items: center;
        }
        .form-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: none;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .form-group.checkbox input {
          width: auto;
        }
        .form-group small {
          display: block;
          font-size: 0.65rem;
          color: var(--text-tertiary);
          margin-top: 0.25rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .btn-secondary {
          background: var(--secondary);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        @media (max-width: 768px) {
          .terms-manager {
            padding: 1rem;
          }
          .templates-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}