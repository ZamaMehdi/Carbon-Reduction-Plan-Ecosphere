// 📁 src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', // Use local server for development
  withCredentials: false, // Temporarily disabled to fix CORS issue
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
