import { AuthService } from './api';

export const login = async (email: string, password: string) => {
  try {
    const response = await AuthService.login(email, password);
    const { token, id, nome, email: userEmail, tipoUsuario } = response.data;
    
    // Armazena os dados no localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id, nome, email: userEmail, tipoUsuario }));
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (nome: string, email: string, password: string, tipoUsuario: number) => {
  try {
    const response = await AuthService.register(nome, email, password, tipoUsuario);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};