'use client';

import { useEffect, useState } from 'react';
import { FormSelect } from '../ui/Form';

export default function EmployeeSelect({ value, onChange, required = false, error = '' }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const options = employees.map(emp => ({
    value: emp.id,
    label: `${emp.employee_number} - ${emp.name} ${emp.surname}`
  }));

  return (
    <FormSelect
      label="Employee"
      name="employee_id"
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      placeholder={loading ? 'Loading employees...' : 'Select an employee'}
      error={error}
      disabled={loading}
    />
  );
}