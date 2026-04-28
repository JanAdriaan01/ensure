'use client';

import { useState } from 'react';
import styles from './DateRangePicker.module.css';

export default function DateRangePicker({ onRangeChange, initialStartDate, initialEndDate }) {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  const handleApply = () => {
    if (startDate && endDate) {
      onRangeChange({ startDate, endDate });
    }
  };

  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onRangeChange({ startDate: startStr, endDate: endStr });
  };

  const presets = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'This Month', days: 'month' },
    { label: 'Last Month', days: 'lastMonth' }
  ];

  const handleMonthPreset = (type) => {
    const now = new Date();
    if (type === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
      onRangeChange({ 
        startDate: start.toISOString().split('T')[0], 
        endDate: end.toISOString().split('T')[0] 
      });
    } else if (type === 'lastMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
      onRangeChange({ 
        startDate: start.toISOString().split('T')[0], 
        endDate: end.toISOString().split('T')[0] 
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.presets}>
        {presets.map(preset => (
          <button
            key={preset.label}
            className={styles.presetBtn}
            onClick={() => preset.days === 'month' || preset.days === 'lastMonth' 
              ? handleMonthPreset(preset.days) 
              : handlePreset(preset.days)
            }
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className={styles.range}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.dateInput}
        />
        <span className={styles.to}>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.dateInput}
        />
        <button onClick={handleApply} className={styles.applyBtn}>Apply</button>
      </div>
    </div>
  );
}