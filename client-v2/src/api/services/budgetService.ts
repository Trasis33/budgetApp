import { apiClient } from '../axios';

export interface Budget {
  id: number;
  category_id: number;
  month: number;
  year: number;
  amount: number;
  category_name: string;
}

export const budgetService = {
  async createOrUpdateBudget(data: {
    category_id: number;
    month: number;
    year: number;
    amount: number;
  }) {
    return apiClient.post('/budgets', data);
  },

  async getBudgets(month: number, year: number) {
    return apiClient.get<Budget[]>(`/budgets?month=${month}&year=${year}`);
  },

  async deleteBudget(id: number) {
    return apiClient.delete(`/budgets/${id}`);
  },
};
