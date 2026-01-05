import { apiClient } from '../axios';

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  is_pinned: boolean;
  color_index: number;
  category_id?: number;
  category_name?: string;
}

export interface Contribution {
  id: number;
  goal_id: number;
  amount: number;
  date: string;
  note?: string;
  created_at: string;
}

export const savingsService = {
  async getGoals(scope?: string) {
    return apiClient.get<SavingsGoal[]>('/savings/goals', {
      params: scope ? { scope } : undefined,
    });
  },

  async createGoal(data: {
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    is_pinned?: boolean;
    color_index?: number;
    category_id?: number;
  }) {
    return apiClient.post<SavingsGoal>('/savings/goals', data);
  },

  async updateGoal(id: number, data: Partial<SavingsGoal>) {
    return apiClient.put<SavingsGoal>(`/savings/goals/${id}`, data);
  },

  async deleteGoal(id: number) {
    return apiClient.delete<{ success: boolean }>(`/savings/goals/${id}`);
  },

  async getContributions(goalId: number) {
    return apiClient.get<Contribution[]>(`/savings/goals/${goalId}/contributions`);
  },

  async addContribution(goalId: number, data: { amount: number; date: string; note?: string }) {
    return apiClient.post<Contribution>(`/savings/goals/${goalId}/contributions`, data);
  },

  async deleteContribution(contributionId: number) {
    return apiClient.delete<{ success: boolean }>(`/savings/contributions/${contributionId}`);
  },

  async getSavingsRate(startDate: string, endDate: string) {
    return apiClient.get(`/savings/rate/${startDate}/${endDate}`);
  },
};