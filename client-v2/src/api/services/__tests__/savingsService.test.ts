import { savingsService } from '../savingsService';
import { apiClient } from '../../axios';

// Mock the apiClient
jest.mock('../../axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('savingsService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGoals', () => {
    it('calls correct endpoint without scope', async () => {
      mockApiClient.get.mockResolvedValue([]);
      await savingsService.getGoals();
      expect(mockApiClient.get).toHaveBeenCalledWith('/savings/goals', { params: undefined });
    });

    it('calls correct endpoint with scope', async () => {
      mockApiClient.get.mockResolvedValue([]);
      await savingsService.getGoals('shared');
      expect(mockApiClient.get).toHaveBeenCalledWith('/savings/goals', { params: { scope: 'shared' } });
    });
  });

  describe('createGoal', () => {
    it('calls correct endpoint with data', async () => {
      const newGoal = {
        name: 'New Car',
        target_amount: 20000,
        current_amount: 0,
        target_date: '2026-12-31',
      };
      mockApiClient.post.mockResolvedValue({ id: 1, ...newGoal });
      await savingsService.createGoal(newGoal);
      expect(mockApiClient.post).toHaveBeenCalledWith('/savings/goals', newGoal);
    });
  });

  describe('updateGoal', () => {
    it('calls correct endpoint with id and data', async () => {
      const updates = { current_amount: 500 };
      mockApiClient.put.mockResolvedValue({ id: 1, ...updates });
      await savingsService.updateGoal(1, updates);
      expect(mockApiClient.put).toHaveBeenCalledWith('/savings/goals/1', updates);
    });
  });

  describe('deleteGoal', () => {
    it('calls correct endpoint with id', async () => {
      mockApiClient.delete.mockResolvedValue({ success: true });
      await savingsService.deleteGoal(1);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/savings/goals/1');
    });
  });

  describe('getContributions', () => {
    it('calls correct endpoint with goalId', async () => {
      mockApiClient.get.mockResolvedValue([]);
      // @ts-ignore - method doesn't exist yet
      await savingsService.getContributions(1);
      expect(mockApiClient.get).toHaveBeenCalledWith('/savings/goals/1/contributions');
    });
  });

  describe('addContribution', () => {
    it('calls correct endpoint with goalId and data', async () => {
      const contribution = { amount: 100, date: '2026-01-05' };
      mockApiClient.post.mockResolvedValue({ id: 1, ...contribution });
      // @ts-ignore - method doesn't exist yet
      await savingsService.addContribution(1, contribution);
      expect(mockApiClient.post).toHaveBeenCalledWith('/savings/goals/1/contributions', contribution);
    });
  });

  describe('deleteContribution', () => {
    it('calls correct endpoint with contributionId', async () => {
      mockApiClient.delete.mockResolvedValue({ success: true });
      // @ts-ignore - method doesn't exist yet
      await savingsService.deleteContribution(100);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/savings/contributions/100');
    });
  });
});
