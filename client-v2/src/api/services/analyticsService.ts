import { apiClient } from '../axios';

export const analyticsService = {
  async getTrends(startDate: string, endDate: string) {
    return apiClient.get(`/analytics/trends/${startDate}/${endDate}`);
  },

  async getCategoryTrends(startDate: string, endDate: string) {
    return apiClient.get(`/analytics/category-trends/${startDate}/${endDate}`);
  },

  async getIncomeExpenses(startDate: string, endDate: string) {
    return apiClient.get(`/analytics/income-expenses/${startDate}/${endDate}`);
  },

  async getSavingsAnalysis(startDate: string, endDate: string) {
    return apiClient.get(`/analytics/savings-analysis/${startDate}/${endDate}`);
  },

  async getCurrentSettlement() {
    return apiClient.get('/analytics/current-settlement');
  },
};
