import api from './api';

export interface IBillingMonth {
  month: string;
  status: 'paid' | 'due' | 'unpaid' | string;
}

export interface IClient {
  _id: string;
  name: string;
  phone: string;
  holding: string;
  cardNumber: string;
  billingMonths: IBillingMonth[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientData {
  name: string;
  phone: string;
  holding: string;
  cardNumber: string;
  billingMonths?: IBillingMonth[];
}

export const ClientService = {
  // GET /api/v1/clients
  getAllClients: async (params?: { searchTerm?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: string }) => {
    const res = await api.get<{ success: boolean; message: string; meta?: any; data: IClient[] }>('/clients', { params });
    return res.data;
  },

  // GET /api/v1/clients/search?term=
  searchClients: async (term: string) => {
    const res = await api.get<{ success: boolean; message: string; data: IClient[] }>('/clients/search', { params: { term } });
    return res.data;
  },

  // POST /api/v1/clients
  createClient: async (data: CreateClientData) => {
    const res = await api.post<{ success: boolean; message: string; data: IClient }>('/clients', data);
    return res.data;
  },

  // PATCH /api/v1/clients/:id
  updateClient: async (id: string, data: Partial<CreateClientData>) => {
    const res = await api.patch<{ success: boolean; message: string; data: IClient }>(`/clients/${id}`, data);
    return res.data;
  },

  // DELETE /api/v1/clients/:id
  deleteClient: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string; data: IClient }>(`/clients/${id}`);
    return res.data;
  },

  // POST /api/v1/clients/:id/billing
  addBillingMonth: async (id: string, data: { month: string; status?: string }) => {
    const res = await api.post<{ success: boolean; message: string; data: IClient }>(`/clients/${id}/billing`, data);
    return res.data;
  },

  // PATCH /api/v1/clients/:id/billing/:month
  updateBillingStatus: async (id: string, month: string, data: { status: string }) => {
    const res = await api.patch<{ success: boolean; message: string; data: IClient }>(`/clients/${id}/billing/${month}`, data);
    return res.data;
  }
};
