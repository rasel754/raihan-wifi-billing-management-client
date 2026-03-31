import api from './api';

export interface MonthlySummary {
  month: string;
  totalPaid: number;
  totalDue: number;
}

export interface DashboardStats {
  totalClients: number;
  monthlySummary: MonthlySummary[];
}

export const DashboardService = {
  /**
   * GET /api/v1/dashboard — Admin only
   * Returns total clients and monthly billing summary.
   */
  getStats: async (): Promise<{ success: boolean; message: string; data: DashboardStats }> => {
    const res = await api.get<{ success: boolean; message: string; data: DashboardStats }>('/dashboard');
    return res.data;
  },
};
