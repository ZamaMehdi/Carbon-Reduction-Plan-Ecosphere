// 📁 src/api/axiosConfig.js
import axios from 'axios';

// Determine the API URL based on environment
const getApiUrl = () => {
  // For production (Netlify), use the Render backend
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://carbon-emission-2.onrender.com';
  }
  // For development, use localhost
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
