export class NotificationService {
  constructor(apiEndpoint = '/api/notifications') {
    this.apiEndpoint = apiEndpoint;
  }
  
  async send(userId, notification) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...notification })
    });
    
    return response.json();
  }
  
  async sendEmail(to, subject, template, data) {
    const response = await fetch(`${this.apiEndpoint}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, template, data })
    });
    
    return response.json();
  }
  
  async sendSMS(to, message) {
    const response = await fetch(`${this.apiEndpoint}/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message })
    });
    
    return response.json();
  }
  
  async getNotifications(userId, options = {}) {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;
    const params = new URLSearchParams({ userId, unreadOnly, limit, offset });
    const response = await fetch(`${this.apiEndpoint}?${params}`);
    return response.json();
  }
  
  async markAsRead(notificationId) {
    const response = await fetch(`${this.apiEndpoint}/${notificationId}/read`, {
      method: 'PATCH'
    });
    return response.json();
  }
  
  async markAllAsRead(userId) {
    const response = await fetch(`${this.apiEndpoint}/read-all`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return response.json();
  }
  
  async delete(notificationId) {
    const response = await fetch(`${this.apiEndpoint}/${notificationId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}

// Pre-defined notification templates
export const NOTIFICATION_TEMPLATES = {
  JOB_ASSIGNED: {
    type: 'job_assigned',
    title: 'Job Assignment',
    message: 'You have been assigned to job {job_number}',
    icon: '📋',
    action: '/jobs/{job_id}'
  },
  
  QUOTE_APPROVED: {
    type: 'quote_approved',
    title: 'Quote Approved',
    message: 'Quote {quote_number} has been approved',
    icon: '✅',
    action: '/quotes/{quote_id}'
  },
  
  QUOTE_REJECTED: {
    type: 'quote_rejected',
    title: 'Quote Rejected',
    message: 'Quote {quote_number} has been rejected',
    icon: '❌',
    action: '/quotes/{quote_id}'
  },
  
  INVOICE_READY: {
    type: 'invoice_ready',
    title: 'Invoice Ready',
    message: 'Invoice {invoice_number} is ready for review',
    icon: '💰',
    action: '/invoicing'
  },
  
  TOOL_CHECKOUT: {
    type: 'tool_checkout',
    title: 'Tool Checkout',
    message: '{tool_name} has been checked out to you',
    icon: '🔧',
    action: '/tools'
  },
  
  TOOL_OVERDUE: {
    type: 'tool_overdue',
    title: 'Tool Overdue',
    message: '{tool_name} is overdue for return',
    icon: '⚠️',
    action: '/tools/returns'
  },
  
  STOCK_LOW: {
    type: 'stock_low',
    title: 'Low Stock Alert',
    message: '{item_name} stock level is below minimum ({quantity} remaining)',
    icon: '📦',
    action: '/stock'
  },
  
  PAYROLL_PROCESSED: {
    type: 'payroll_processed',
    title: 'Payroll Processed',
    message: 'Payroll for {month} has been processed',
    icon: '💰',
    action: '/payroll'
  },
  
  SCHEDULE_CHANGE: {
    type: 'schedule_change',
    title: 'Schedule Change',
    message: 'Your schedule has been updated for {date}',
    icon: '📅',
    action: '/schedule'
  },
  
  DOCUMENT_UPLOADED: {
    type: 'document_uploaded',
    title: 'Document Uploaded',
    message: '{document_name} has been uploaded',
    icon: '📄',
    action: '/uploads'
  }
};

export function createNotification(template, replacements) {
  let message = NOTIFICATION_TEMPLATES[template].message;
  let action = NOTIFICATION_TEMPLATES[template].action;
  
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    message = message.replace(regex, value);
    action = action.replace(regex, value);
  });
  
  return {
    type: NOTIFICATION_TEMPLATES[template].type,
    title: NOTIFICATION_TEMPLATES[template].title,
    message,
    icon: NOTIFICATION_TEMPLATES[template].icon,
    action
  };
}