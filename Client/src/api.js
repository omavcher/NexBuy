import axios from 'axios';

const api = axios.create({
  baseURL:'https://nexbuy-server.onrender.com', 
});

export default api;
