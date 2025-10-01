import axios from 'axios';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://carbon-reduction-plan-ecosphere.onrender.com',
  withCredentials: true, // ⚠️ Important
});

export default publicApi;
