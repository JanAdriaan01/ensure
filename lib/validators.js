export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number';
  }
  return null;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  if (new Date(startDate) > new Date(endDate)) {
    return 'Start date cannot be after end date';
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};