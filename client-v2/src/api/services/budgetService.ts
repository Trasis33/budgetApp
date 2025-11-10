import { apiClient } from '../axios';
import { Budget } from '../../types';

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

  async getAvailableCategories(month: number, year: number) {
    return apiClient.get(`/budgets/available-categories?month=${month}&year=${year}`);
  },

  async getBudgetSummary(month: number, year: number) {
    return apiClient.get(`/budgets/summary/${month}/${year}`);
  },
};
