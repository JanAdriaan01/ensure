class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient('/api');

// Specific API endpoints
export const jobsApi = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getItems: (jobId) => api.get(`/jobs/${jobId}/items`),
  addItem: (jobId, data) => api.post(`/jobs/${jobId}/items`, data),
  getAssignments: (jobId) => api.get(`/jobs/${jobId}/assignments`),
  assignEmployee: (jobId, data) => api.post(`/jobs/${jobId}/assignments`, data)
};

export const employeesApi = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  addTime: (id, data) => api.post(`/employees/${id}/time`, data),
  getCertifications: (id) => api.get(`/employees/${id}/certifications`),
  updateCertifications: (id, data) => api.post(`/employees/${id}/certifications`, data)
};

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

export const quotesApi = {
  getAll: () => api.get('/quotes'),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  delete: (id) => api.delete(`/quotes/${id}`)
};