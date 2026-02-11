// api/axiosInstance.js
import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'https://apinmea.oxiumev.com/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage based on user role
    const adminToken = localStorage.getItem('adminToken');
    const invigilatorToken = localStorage.getItem('invigilatorToken');
    
    // Add token to headers if it exists
    if (adminToken) {
      config.headers['x-auth-token'] = adminToken;
    } else if (invigilatorToken) {
      config.headers['x-auth-token'] = invigilatorToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // You can modify response data here if needed
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - Redirect to login
          if (localStorage.getItem('adminToken')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            localStorage.removeItem('adminRole');
            window.location.href = '/admin/login';
          } else if (localStorage.getItem('invigilatorToken')) {
            localStorage.removeItem('invigilatorToken');
            localStorage.removeItem('invigilatorData');
            localStorage.removeItem('invigilatorRole');
            window.location.href = '/invigilator/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('API endpoint not found');
          break;
        case 500:
          // Server error
          console.error('Internal server error');
          break;
        default:
          console.error('Request failed with status:', error.response.status);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;