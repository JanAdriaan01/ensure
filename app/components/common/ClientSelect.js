'use client';

import { useEffect, useState } from 'react';
import { FormSelect } from '../ui/Form';

export default function ClientSelect({ value, onChange, required = false, error = '' }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const options = clients.map(client => ({
    value: client.id,
    label: client.client_name
  }));

  return (
    <FormSelect
      label="Client"
      name="client_id"
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      placeholder={loading ? 'Loading clients...' : 'Select a client'}
      error={error}
      disabled={loading}
    />
  );
}