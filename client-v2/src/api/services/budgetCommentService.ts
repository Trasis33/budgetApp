import { apiClient } from '../axios';

export interface BudgetComment {
  id: number;
  budget_id: number;
  user_id: number;
  user_name: string;
  user_color?: string;
  text: string;
  created_at: string;
}

export const budgetCommentService = {
  async getComments(budgetId: number): Promise<BudgetComment[]> {
    return apiClient.get<BudgetComment[]>(`/budget-comments/${budgetId}`);
  },

  async addComment(budgetId: number, text: string): Promise<BudgetComment> {
    return apiClient.post<BudgetComment>('/budget-comments', {
      budget_id: budgetId,
      text
    });
  },

  async deleteComment(id: number): Promise<void> {
    return apiClient.delete(`/budget-comments/${id}`);
  }
};
