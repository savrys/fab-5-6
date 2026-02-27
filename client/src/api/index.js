import axios from 'axios';

// Функция для определения базового URL API в зависимости от среды
const getBaseURL = () => {
  // Если задана переменная окружения (например, в .env), используем её
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Определяем, запущено ли приложение в GitHub Codespaces
  if (typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev')) {
    // Формируем URL для сервера на порту 3000 на основе текущего хоста клиента (порт 3001)
    const hostname = window.location.hostname;
    // Заменяем суффикс "-3001.app.github.dev" на "-3000.app.github.dev"
    const baseHost = hostname.replace(/-\d+\.app\.github\.dev$/, '') + '-3000.app.github.dev';
    return `https://${baseHost}/api`;
  }

  // Локальная разработка
  return 'http://localhost:3000/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Внешнее API (без изменений)
const exchangeRateApi = axios.create({
  baseURL: 'https://api.exchangerate-api.com/v4',
});

export const api = {
  getProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (product) => {
    const response = await apiClient.post('/products', product);
    return response.data;
  },
  updateProduct: async (id, product) => {
    const response = await apiClient.patch(`/products/${id}`, product);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
  getExchangeRates: async () => {
    const response = await exchangeRateApi.get('/latest/USD');
    return response.data;
  },
};