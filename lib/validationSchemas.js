import * as yup from 'yup';

// Common validation rules
export const idSchema = yup.number().positive().integer();
export const emailSchema = yup.string().email('Invalid email format').required('Email is required');
export const phoneSchema = yup.string().matches(/^[\d\s+-]{10,}$/, 'Invalid phone number');
export const currencySchema = yup.number().min(0, 'Amount must be positive').typeError('Must be a number');
export const dateSchema = yup.date().typeError('Invalid date');
export const urlSchema = yup.string().url('Invalid URL');

// Entity schemas
export const clientSchema = yup.object({
  name: yup.string().required('Client name is required').min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema,
  address: yup.string(),
  contact_person: yup.string(),
  vat_number: yup.string(),
  status: yup.string().oneOf(['active', 'inactive'], 'Invalid status')
});

export const employeeSchema = yup.object({
  employee_number: yup.string().required('Employee number is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: emailSchema,
  phone: phoneSchema,
  position: yup.string().required('Position is required'),
  department: yup.string().required('Department is required'),
  hourly_rate: currencySchema,
  status: yup.string().oneOf(['active', 'inactive', 'on_leave', 'terminated'], 'Invalid status'),
  start_date: dateSchema,
  emergency_contact: yup.object({
    name: yup.string(),
    relationship: yup.string(),
    phone: phoneSchema
  })
});

export const jobSchema = yup.object({
  lc_number: yup.string().required('Job number is required'),
  client_id: yup.number().nullable(),
  description: yup.string(),
  po_status: yup.string().oneOf(['pending', 'approved', 'rejected'], 'Invalid PO status'),
  completion_status: yup.string().oneOf(['not_started', 'in_progress', 'completed'], 'Invalid completion status'),
  po_amount: currencySchema.nullable(),
  total_budget: currencySchema.nullable(),
  start_date: dateSchema.nullable(),
  end_date: dateSchema.nullable().test('is-after-start', 'End date must be after start date', function(value) {
    const { start_date } = this.parent;
    if (!start_date || !value) return true;
    return new Date(value) >= new Date(start_date);
  })
});

export const quoteSchema = yup.object({
  quote_number: yup.string().required('Quote number is required'),
  client_id: yup.number().required('Client is required'),
  job_id: yup.number().nullable(),
  description: yup.string(),
  amount: currencySchema.required('Amount is required'),
  vat_rate: yup.number().min(0).max(1, 'VAT rate must be between 0 and 1'),
  status: yup.string().oneOf(['pending', 'approved', 'rejected', 'invoiced'], 'Invalid status'),
  valid_until: dateSchema
});

export const stockItemSchema = yup.object({
  name: yup.string().required('Item name is required'),
  sku: yup.string().required('SKU is required'),
  category: yup.string(),
  quantity: yup.number().min(0, 'Quantity cannot be negative').required('Quantity is required'),
  min_quantity: yup.number().min(0, 'Minimum quantity cannot be negative'),
  max_quantity: yup.number().min(0, 'Maximum quantity cannot be negative'),
  unit_price: currencySchema,
  supplier: yup.string(),
  location: yup.string()
});

export const toolSchema = yup.object({
  name: yup.string().required('Tool name is required'),
  serial_number: yup.string(),
  category: yup.string(),
  status: yup.string().oneOf(['available', 'checked_out', 'maintenance', 'lost', 'retired'], 'Invalid status'),
  location: yup.string(),
  condition: yup.string().oneOf(['excellent', 'good', 'fair', 'poor', 'damaged'], 'Invalid condition'),
  purchase_date: dateSchema,
  purchase_price: currencySchema,
  current_value: currencySchema
});

export const timeEntrySchema = yup.object({
  employee_id: yup.number().required('Employee is required'),
  job_id: yup.number().nullable(),
  date: dateSchema.required('Date is required'),
  hours: yup.number().min(0.5, 'Minimum hours is 0.5').max(24, 'Maximum hours is 24').required('Hours are required'),
  labor_type: yup.string().oneOf(['productive', 'training', 'office', 'leave'], 'Invalid labor type'),
  description: yup.string(),
  overtime: yup.boolean()
});

export const invoiceSchema = yup.object({
  invoice_number: yup.string().required('Invoice number is required'),
  client_id: yup.number().required('Client is required'),
  job_id: yup.number().nullable(),
  quote_id: yup.number().nullable(),
  amount: currencySchema.required('Amount is required'),
  vat_amount: currencySchema,
  total_amount: currencySchema.required('Total amount is required'),
  status: yup.string().oneOf(['draft', 'sent', 'paid', 'overdue', 'cancelled'], 'Invalid status'),
  issue_date: dateSchema.required('Issue date is required'),
  due_date: dateSchema.required('Due date is required').test('is-after-issue', 'Due date must be after issue date', function(value) {
    const { issue_date } = this.parent;
    if (!issue_date || !value) return true;
    return new Date(value) >= new Date(issue_date);
  }),
  notes: yup.string()
});

export const payrollSchema = yup.object({
  employee_id: yup.number().required('Employee is required'),
  month: yup.number().min(1).max(12).required('Month is required'),
  year: yup.number().min(2000).max(2100).required('Year is required'),
  regular_hours: yup.number().min(0).required('Regular hours are required'),
  overtime_hours: yup.number().min(0).default(0),
  bonus: currencySchema.default(0),
  deductions: currencySchema.default(0),
  status: yup.string().oneOf(['pending', 'processed', 'paid'], 'Invalid status')
});

export const scheduleSchema = yup.object({
  employee_id: yup.number().required('Employee is required'),
  job_id: yup.number().required('Job is required'),
  date: dateSchema.required('Date is required'),
  start_time: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').required('Start time is required'),
  end_time: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').required('End time is required'),
  role: yup.string(),
  notes: yup.string()
}).test('end-after-start', 'End time must be after start time', function(value) {
  const { start_time, end_time } = value;
  if (!start_time || !end_time) return true;
  return end_time > start_time;
});

export const stockMovementSchema = yup.object({
  stock_item_id: yup.number().required('Stock item is required'),
  quantity: yup.number().notOneOf([0], 'Quantity cannot be zero').required('Quantity is required'),
  type: yup.string().oneOf(['in', 'out', 'adjustment'], 'Invalid movement type'),
  reference_type: yup.string().oneOf(['purchase', 'job', 'return', 'adjustment'], 'Invalid reference type'),
  reference_id: yup.number().required('Reference ID is required'),
  notes: yup.string(),
  unit_price: currencySchema
});

export const toolCheckoutSchema = yup.object({
  tool_id: yup.number().required('Tool is required'),
  employee_id: yup.number().required('Employee is required'),
  job_id: yup.number().nullable(),
  checkout_date: dateSchema.required('Checkout date is required'),
  expected_return_date: dateSchema.required('Expected return date is required').test('is-after-checkout', 'Return date must be after checkout date', function(value) {
    const { checkout_date } = this.parent;
    if (!checkout_date || !value) return true;
    return new Date(value) >= new Date(checkout_date);
  }),
  condition_at_checkout: yup.string().oneOf(['excellent', 'good', 'fair', 'poor'], 'Invalid condition'),
  notes: yup.string()
});

export const userSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: emailSchema,
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  role: yup.string().oneOf(['admin', 'manager', 'supervisor', 'employee', 'client', 'accountant'], 'Invalid role'),
  status: yup.string().oneOf(['active', 'inactive', 'suspended'], 'Invalid status')
});

export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required')
});

export const changePasswordSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
  confirm_password: yup.string().oneOf([yup.ref('new_password'), null], 'Passwords must match').required('Confirm password is required')
});

export const reportSchema = yup.object({
  type: yup.string().required('Report type is required'),
  start_date: dateSchema.required('Start date is required'),
  end_date: dateSchema.required('End date is required').test('is-after-start', 'End date must be after start date', function(value) {
    const { start_date } = this.parent;
    if (!start_date || !value) return true;
    return new Date(value) >= new Date(start_date);
  }),
  format: yup.string().oneOf(['pdf', 'excel', 'csv', 'json'], 'Invalid format').required('Format is required'),
  include_charts: yup.boolean(),
  filters: yup.object()
});

// Validation helper functions
export async function validateData(schema, data) {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: null };
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
}

export function createValidator(schema) {
  return async (data) => {
    return validateData(schema, data);
  };
}

// Pre-configured validators
export const validateClient = createValidator(clientSchema);
export const validateEmployee = createValidator(employeeSchema);
export const validateJob = createValidator(jobSchema);
export const validateQuote = createValidator(quoteSchema);
export const validateStockItem = createValidator(stockItemSchema);
export const validateTool = createValidator(toolSchema);
export const validateTimeEntry = createValidator(timeEntrySchema);
export const validateInvoice = createValidator(invoiceSchema);
export const validatePayroll = createValidator(payrollSchema);
export const validateSchedule = createValidator(scheduleSchema);
export const validateStockMovement = createValidator(stockMovementSchema);
export const validateToolCheckout = createValidator(toolCheckoutSchema);
export const validateUser = createValidator(userSchema);
export const validateLogin = createValidator(loginSchema);
export const validateChangePassword = createValidator(changePasswordSchema);
export const validateReport = createValidator(reportSchema);

// Bulk validation
export async function validateBulk(schema, dataArray) {
  const results = [];
  const errors = [];

  for (let i = 0; i < dataArray.length; i++) {
    const result = await validateData(schema, dataArray[i]);
    if (result.isValid) {
      results.push(dataArray[i]);
    } else {
      errors.push({ index: i, errors: result.errors, data: dataArray[i] });
    }
  }

  return {
    valid: results,
    invalid: errors,
    total: dataArray.length,
    validCount: results.length,
    invalidCount: errors.length
  };
}

// Conditional validation schemas
export const jobWithClientSchema = jobSchema.shape({
  client_id: yup.number().required('Client is required when creating job')
});

export const quoteWithJobSchema = quoteSchema.shape({
  job_id: yup.number().required('Job is required for this quote')
});

export const timeEntryWithJobSchema = timeEntrySchema.shape({
  job_id: yup.number().required('Job is required for productive hours')
});

// Partial update schemas (all fields optional)
export const partialClientSchema = clientSchema.partial();
export const partialEmployeeSchema = employeeSchema.partial();
export const partialJobSchema = jobSchema.partial();
export const partialQuoteSchema = quoteSchema.partial();
export const partialStockItemSchema = stockItemSchema.partial();
export const partialToolSchema = toolSchema.partial();
export const partialInvoiceSchema = invoiceSchema.partial();
export const partialUserSchema = userSchema.partial();