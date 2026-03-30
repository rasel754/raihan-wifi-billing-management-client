import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rs_wifi_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle token expiration logic, e.g. logout
      // For now, let the AuthContext handle re-directs if API calls fail with 401
      localStorage.removeItem('rs_wifi_token');
      localStorage.removeItem('rs_wifi_user');
      // window.location.href = '/login'; // if needed
    }
    return Promise.reject(error);
  }
);

export default api;
