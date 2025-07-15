// 📁 src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://carbon-reduction-plan-ecosphere.onrender.com',
  withCredentials: true,
});

export default api;
