/**
 * ESTORA Centralized API Service Wrapper
 */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes(':3000')
  ? '/api'
  : '/api';

const ApiService = {
  /**
   * Get authorization token
   */
  getToken() {
    return localStorage.getItem('estora_token');
  },

  /**
   * Standard Request Helper
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    // If options.body is FormData, don't set Content-Type header
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = { success: false, message: 'Invalid JSON response from server' };
        }
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { success: false, message: text || `HTTP ${response.status} ${response.statusText}` };
        }
      }

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          // Token expired or invalid
          localStorage.removeItem('estora_token');
          localStorage.removeItem('estora_user');
          window.dispatchEvent(new Event('estora-auth-changed'));
        }
        throw new Error((data && data.message) || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  },

  // Auth Endpoints
  login(emailOrCredentials, maybePassword) {
    const payload = typeof emailOrCredentials === 'object' && emailOrCredentials !== null
      ? emailOrCredentials
      : { email: emailOrCredentials, password: maybePassword };

    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getCurrentUser() {
    return this.request('/auth/me');
  },

  updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Properties Endpoints
  getProperties(queryParams = {}) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    });
    return this.request(`/properties?${params.toString()}`);
  },

  getFeaturedProperties() {
    return this.request('/properties/featured');
  },

  getPropertyById(id) {
    return this.request(`/properties/${id}`);
  },

  createProperty(propertyData) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData)
    });
  },

  updateProperty(id, propertyData) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData)
    });
  },

  deleteProperty(id) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE'
    });
  },

  getAgentProperties(agentId) {
    return this.request(`/properties/agent/${agentId}`);
  },

  // Favorites Endpoints
  getFavorites() {
    return this.request('/favorites');
  },

  getFavoriteIds() {
    return this.request('/favorites/ids');
  },

  addFavorite(propertyId) {
    return this.request(`/favorites/${propertyId}`, {
      method: 'POST'
    });
  },

  removeFavorite(propertyId) {
    return this.request(`/favorites/${propertyId}`, {
      method: 'DELETE'
    });
  },

  // Inquiries Endpoints
  createInquiry(inquiryData) {
    return this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  },

  getMyInquiries() {
    return this.request('/inquiries/my-inquiries');
  },

  getAgentInquiries() {
    return this.request('/inquiries/agent');
  },

  updateInquiryStatus(id, status) {
    return this.request(`/inquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  deleteInquiry(id) {
    return this.request(`/inquiries/${id}`, {
      method: 'DELETE'
    });
  },

  // Agents Endpoints
  getAgents() {
    return this.request('/agents');
  },

  getAgentById(id) {
    return this.request(`/agents/${id}`);
  },

  // Admin Endpoints
  getAdminStats() {
    return this.request('/admin/stats');
  },

  getAdminProperties() {
    return this.request('/admin/properties');
  },

  approveProperty(id) {
    return this.request(`/admin/properties/${id}/approve`, { method: 'PUT' });
  },

  rejectProperty(id) {
    return this.request(`/admin/properties/${id}/reject`, { method: 'PUT' });
  },

  toggleFeatureProperty(id) {
    return this.request(`/admin/properties/${id}/feature`, { method: 'PUT' });
  },

  getAdminUsers() {
    return this.request('/admin/users');
  },

  updateUserStatus(id, status) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  deleteUser(id) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  },

  getAdminAgents() {
    return this.request('/admin/agents');
  },

  verifyAgent(id, verified = true) {
    return this.request(`/admin/agents/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verified })
    });
  },

  getAdminInquiries() {
    return this.request('/admin/inquiries');
  },

  // File Upload
  uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request('/upload', {
      method: 'POST',
      body: formData
    });
  }
};
