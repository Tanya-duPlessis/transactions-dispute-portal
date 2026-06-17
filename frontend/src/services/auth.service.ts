import api from './api';
import type { AuthTokens } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async register(email: string, password: string, name: string): Promise<AuthTokens> {
    const { data } = await api.post('/auth/register', { email, password, name });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
