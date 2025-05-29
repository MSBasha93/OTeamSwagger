import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to handle token expiration or other global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      // This might conflict with AuthContext's logout, so coordinate
      console.error('Unauthorized, logging out or redirecting...');
      // localStorage.removeItem('oteam_token');
      // localStorage.removeItem('oteam_user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;