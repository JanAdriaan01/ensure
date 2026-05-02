export const PO_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export const COMPLETION_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

export const QUOTE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'invoiced', label: 'Invoiced' }
];

export const LABOR_TYPES = [
  { value: 'productive', label: 'Productive (Job)', type: 'productive' },
  { value: 'training', label: 'Training', type: 'unproductive' },
  { value: 'office', label: 'Office', type: 'unproductive' },
  { value: 'leave', label: 'Leave', type: 'unproductive' }
];

export const CURRENCIES = [
  { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' }
];

export const DEFAULT_ZAR_TO_USD = 19.50;