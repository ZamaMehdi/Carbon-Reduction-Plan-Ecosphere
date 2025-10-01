// 📁 src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://carbon-emission-2.onrender.com', // Default to production, override with localhost for development
  withCredentials: true, // Re-enabled for local development
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
