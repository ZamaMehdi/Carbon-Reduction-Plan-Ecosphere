// 📁 src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://carbon-emission-2.onrender.com',
  withCredentials: false, // Temporarily disable to test CORS
});

export default api;
