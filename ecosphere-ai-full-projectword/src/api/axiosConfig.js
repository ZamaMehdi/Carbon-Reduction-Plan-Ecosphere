// 📁 src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://carbon-emission-2.onrender.com',
  withCredentials: false, // TEMPORARILY DISABLED TO TEST CORS
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
