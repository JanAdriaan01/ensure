// app/components/common/ClientSelect/ClientSelect.js
'use client';

import { useState, useEffect } from 'react';

export default function ClientSelect({ 
  value, 
  onChange, 
  onClientSelect,
  clients = [],
  loading: externalLoading = false,
  required = false,
  disabled = false,
  placeholder = 'Select a client...',
  error = '',
  helperText = '',
  className = '',
  fetchClients = null
}) {
  const [internalClients, setInternalClients] = useState(clients);
  const [loading, setLoading] = useState(externalLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  useEffect(() => {
    if (clients.length > 0) {
      setInternalClients(clients);
    } else if (fetchClients) {
      loadClients();
    }
  }, [clients, fetchClients]);
  
  useEffect(() => {
    if (value && internalClients.length > 0) {
      const found = internalClients.find(c => c.id === value || c.client_id === value);
      setSelectedClient(found);
    }
  }, [value, internalClients]);
  
  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setInternalClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredClients = internalClients.filter(client =>
    client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelect = (client) => {
    setSelectedClient(client);
    setIsOpen(false);
    setSearchTerm('');
    
    if (onChange) {
      onChange({
        target: {
          name: 'clientId',
          value: client.id || client.client_id
        }
      });
    }
    
    if (onClientSelect) {
      onClientSelect(client);
    }
  };
  
  return (
    <div className={`client-select ${className}`}>
      <div className="select-wrapper">
        <div 
          className={`select-trigger ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedClient ? (
            <div className="selected-value">
              <span className="client-name">{selectedClient.client_name}</span>
              {selectedClient.contact_person && (
                <span className="client-contact">({selectedClient.contact_person})</span>
              )}
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
          <span className="arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="select-dropdown">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="options-list">
              {loading ? (
                <div className="loading-state">Loading clients...</div>
              ) : filteredClients.length === 0 ? (
                <div className="empty-state">No clients found</div>
              ) : (
                filteredClients.map(client => (
                  <div
                    key={client.id || client.client_id}
                    className={`option-item ${selectedClient?.id === client.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(client)}
                  >
                    <div className="option-name">{client.client_name}</div>
                    {client.contact_person && (
                      <div className="option-contact">{client.contact_person}</div>
                    )}
                    {client.email && (
                      <div className="option-email">{client.email}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <div className="helper-text">{helperText}</div>
      )}
      
      {error && (
        <div className="error-text">{error}</div>
      )}
      
      <style jsx>{`
        .client-select {
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .select-wrapper {
          position: relative;
        }
        
        .select-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 42px;
        }
        
        .select-trigger:hover:not(.disabled) {
          border-color: #9ca3af;
        }
        
        .select-trigger.error {
          border-color: #ef4444;
        }
        
        .select-trigger.disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .selected-value {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: baseline;
        }
        
        .client-name {
          font-size: 0.875rem;
          color: #111827;
        }
        
        .client-contact {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .placeholder {
          color: #9ca3af;
          font-size: 0.875rem;
        }
        
        .arrow {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 50;
          max-height: 300px;
          overflow: hidden;
        }
        
        .search-input-wrapper {
          padding: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .search-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .options-list {
          max-height: 250px;
          overflow-y: auto;
        }
        
        .loading-state, .empty-state {
          padding: 1rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .option-item {
          padding: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .option-item:hover {
          background: #f3f4f6;
        }
        
        .option-item.selected {
          background: #dbeafe;
        }
        
        .option-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .option-contact, .option-email {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .helper-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .error-text {
          margin-top: 0.375rem;
          font-size: 0.75rem;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}