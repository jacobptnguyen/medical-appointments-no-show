import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_BASE_URL?.trim();

const api = axios.create({
  baseURL: baseUrl && baseUrl.length > 0 ? baseUrl : undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
