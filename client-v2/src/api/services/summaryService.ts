import { apiClient } from '../axios';

export interface SettlementData {
  totalSharedExpenses: string;
  user1: { name: string; paid: string };
  user2: { name: string; paid: string };
  settlement: { message: string };
}

export const summaryService = {
  async getSettlement(month: number, year: number): Promise<SettlementData> {
    return apiClient.get<SettlementData>(`/summary/settle?month=${month}&year=${year}`);
  },
};
