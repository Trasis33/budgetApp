import { apiClient } from '../axios';
import { RecurringTemplate } from '../../types';

export const recurringExpenseService = {
  /**
   * Get all active recurring templates for the authenticated couple.
   * Templates are couple-level; ownership is shared.
   */
  async getTemplates(): Promise<RecurringTemplate[]> {
    return apiClient.get<RecurringTemplate[]>('/recurring-expenses');
  },

  /**
   * Get a single recurring template by ID.
   */
  async getTemplate(id: number): Promise<RecurringTemplate> {
    return apiClient.get<RecurringTemplate>(`/recurring-expenses/${id}`);
  },

  /**
   * Create a new recurring expense template.
   * @param payload Template data including description, default_amount, category_id, paid_by_user_id, split config
   */
  async createTemplate(payload: {
    description: string;
    default_amount: number;
    category_id: number;
    paid_by_user_id: number;
    split_type: '50/50' | 'custom' | 'personal' | 'bill';
    split_ratio_user1?: number;
    split_ratio_user2?: number;
  }): Promise<RecurringTemplate> {
    return apiClient.post<RecurringTemplate>('/recurring-expenses', payload);
  },

  /**
   * Update an existing recurring template.
   * @param id Template ID
   * @param payload Partial template data (any fields to update)
   */
  async updateTemplate(
    id: number,
    payload: Partial<{
      description: string;
      default_amount: number;
      category_id: number;
      paid_by_user_id: number;
      split_type: '50/50' | 'custom' | 'personal' | 'bill';
      split_ratio_user1?: number;
      split_ratio_user2?: number;
    }>
  ): Promise<RecurringTemplate> {
    return apiClient.put<RecurringTemplate>(`/recurring-expenses/${id}`, payload);
  },

  /**
   * Deactivate a recurring template (soft delete). Does not delete generated expenses.
   * @param id Template ID
   */
  async deactivateTemplate(id: number): Promise<void> {
    return apiClient.delete(`/recurring-expenses/${id}`);
  },

  /**
   * Generate recurring expenses for a specific month.
   * Creates one concrete expense per active template for the given {year, month} if not already created.
   * Idempotent: calling multiple times for the same month doesn't create duplicates.
   * @param year Year (e.g., 2025)
   * @param month Month (1-12)
   */
  async generate(payload: {
    year: number;
    month: number;
  }): Promise<{ generatedCount: number; generatedAmount: number; year: number; month: number }> {
    return apiClient.post('/recurring-expenses/generate', payload);
  }
};
