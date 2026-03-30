import api from './api';

export const AuthService = {
  login: async (phone: string, password: string) => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data;
  },
};
