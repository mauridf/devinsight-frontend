import axios from 'axios';

const API_BASE_URL = 'https://localhost:7168/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token às requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Auth
export const AuthService = {
  login: async (email: string, senha: string) => {
    return api.post('/Auth/login', { email, senha });
  },
  register: async (nome: string, email: string, senha: string, tipoUsuario: number) => {
    return api.post('/Auth/registrar', { nome, email, senha, tipoUsuario });
  },
};

export default api;