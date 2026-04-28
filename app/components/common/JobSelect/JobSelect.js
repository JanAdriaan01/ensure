'use client';

import { useEffect, useState } from 'react';
import { FormSelect } from '../ui/Form';

export default function JobSelect({ value, onChange, required = false, error = '', showCompleted = false }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      let data = await res.json();
      if (!showCompleted) {
        data = data.filter(job => job.completion_status !== 'completed');
      }
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const options = jobs.map(job => ({
    value: job.id,
    label: `${job.lc_number} - ${job.completion_status?.replace('_', ' ')}`
  }));

  return (
    <FormSelect
      label="Job"
      name="job_id"
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      placeholder={loading ? 'Loading jobs...' : 'Select a job'}
      error={error}
      disabled={loading}
    />
  );
}