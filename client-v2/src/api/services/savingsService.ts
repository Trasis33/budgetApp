import { apiClient } from '../axios';
import { SavingsGoal } from '../../types';

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
    const response = await apiClient.get<{ goals: any[] }>('/savings/goals', {
      params: scope ? { scope } : undefined,
    });
    return response.goals.map(goal => ({
      ...goal,
      name: goal.goal_name,
      category_name: goal.category,
      is_pinned: Boolean(goal.is_pinned),
    })) as SavingsGoal[];
  },

  async createGoal(data: {
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    is_pinned?: boolean;
    color_index?: number;
    category_id?: number;
    category_name?: string;
  }) {
    const payload = {
      goal_name: data.name,
      target_amount: data.target_amount,
      target_date: data.target_date,
      category: data.category_name,
    };
    return apiClient.post<any>('/savings/goals', payload);
  },

  async updateGoal(id: number, data: Partial<SavingsGoal>) {
    const payload: any = { ...data };
    if (data.name) {
      payload.goal_name = data.name;
      delete payload.name;
    }
    if (data.category_name !== undefined) {
      payload.category = data.category_name;
      delete payload.category_name;
    }
    return apiClient.put<any>(`/savings/goals/${id}`, payload);
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