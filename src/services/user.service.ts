import api from './api';

export interface User {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  role: 'admin' | 'employee';
}

export interface CreateUserData {
  name: string;
  phone: string;
  password?: string;
  role?: 'admin' | 'employee';
}

export const UserService = {
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  createUser: async (data: CreateUserData) => {
    const res = await api.post('/users', data);
    return res.data;
  },
  updateUser: async (id: string, data: Partial<CreateUserData>) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  }
};
