import { apiClient } from '../axios';

export interface Settlement {
  amount: string;
  creditor: string;
  debtor: string;
  message: string;
}

export const summaryService = {
  async getSettlement(month: number, year: number) {
    return apiClient.get(`/summary/settle?month=${month}&year=${year}`);
  },
};
