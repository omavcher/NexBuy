import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nexbuy-server.onrender.com',
  withCredentials: true, // Include cookies or credentials if necessary
});

export default api;
