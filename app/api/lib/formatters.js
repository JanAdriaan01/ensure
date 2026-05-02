export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-ZA');
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-ZA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  if (format === 'iso') {
    return d.toISOString().split('T')[0];
  }
  return d.toLocaleDateString('en-ZA');
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('en-ZA');
};

export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  // Basic formatting for South African numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

export const truncate = (str, length = 50) => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + '...';
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};