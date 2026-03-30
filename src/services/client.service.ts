import api from './api';

export interface Client {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  holding: string;
  cardNumber: string;
  billingStatus: 'paid' | 'due';
  billingMonth: string;
}

export interface CreateClientData {
  name: string;
  phone: string;
  holding: string;
  cardNumber: string;
  billingStatus: 'paid' | 'due';
  billingMonth: string;
}

export const ClientService = {
  getClients: async () => {
    const res = await api.get('/clients');
    return res.data;
  },
  searchClients: async (query: string) => {
    const res = await api.get('/clients/search', { params: { query } });
    return res.data;
  },
  createClient: async (data: CreateClientData) => {
    const res = await api.post('/clients', data);
    return res.data;
  },
  updateClient: async (id: string, data: Partial<CreateClientData>) => {
    const res = await api.patch(`/clients/${id}`, data);
    return res.data;
  },
  deleteClient: async (id: string) => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },
  addBilling: async (id: string, data: { billingMonth: string, billingStatus: 'paid' | 'due' }) => {
    const res = await api.post(`/clients/${id}/billing`, data);
    return res.data;
  },
  updateBilling: async (id: string, month: string, data: { billingStatus: 'paid' | 'due' }) => {
    const res = await api.patch(`/clients/${id}/billing/${month}`, data);
    return res.data;
  }
};
