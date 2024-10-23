import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',  // 不需要在这里添加 '/main'，因为它会被添加到每个具体的 API 调用中
  timeout: 10000,
});

export default api;