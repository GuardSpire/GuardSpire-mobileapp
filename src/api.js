import axios from 'axios';

// Set up Axios instance with backend URL
const API = axios.create({
  baseURL: 'http://192.168.8.178:5000', // Use this instead of 127.0.0.1
  timeout: 10000, // 10 seconds timeout
  headers: { 'Content-Type': 'application/json' },
});

export default API;


