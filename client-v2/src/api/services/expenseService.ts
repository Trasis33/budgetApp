import { apiClient } from '../axios';

export interface Expense {
  id: number;
  date: string;
  amount: number;
  category_id: number;
  category_name: string;
  category_icon?: string;
  description: string;
  paid_by_user_id: number;
  paid_by_name: string;
  split_type: 'equal' | 'custom' | 'personal' | 'bill';
  custom_split_ratio?: number;
}

export const expenseService = {
  async getExpenses(scope: 'ours' | 'mine' | 'partner' | 'all' = 'ours') {
    return apiClient.get<Expense[]>(`/expenses?scope=${scope}`);
  },

  async getExpense(id: number) {
    return apiClient.get<Expense>(`/expenses/${id}`);
  },

  async createExpense(data: {
    date: string;
    amount: number;
    category_id: number;
    description: string;
    paid_by_user_id: number;
    split_type: 'equal' | 'custom' | 'personal' | 'bill';
    custom_split_ratio?: number;
  }) {
    return apiClient.post('/expenses', data);
  },

  async updateExpense(id: number, data: Partial<Expense>) {
    return apiClient.put(`/expenses/${id}`, data);
  },

  async deleteExpense(id: number) {
    return apiClient.delete(`/expenses/${id}`);
  },

  async getRecentExpenses() {
    return apiClient.get<Expense[]>('/expenses/recent');
  },
};
