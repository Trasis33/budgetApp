import { apiClient } from '../axios';

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  is_pinned: boolean;
  color_index: number;
}

export const savingsService = {
  async getGoals() {
    return apiClient.get<SavingsGoal[]>('/savings/goals');
  },

  async createGoal(data: {
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    is_pinned?: boolean;
    color_index?: number;
  }) {
    return apiClient.post('/savings/goals', data);
  },

  async updateGoal(id: number, data: Partial<SavingsGoal>) {
    return apiClient.put(`/savings/goals/${id}`, data);
  },

  async deleteGoal(id: number) {
    return apiClient.delete(`/savings/goals/${id}`);
  },

  async getSavingsRate(startDate: string, endDate: string) {
    return apiClient.get(`/savings/rate/${startDate}/${endDate}`);
  },
};
