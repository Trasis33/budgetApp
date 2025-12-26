import axios from 'axios';
import { optimizationService } from '../optimizationService';

jest.mock('axios');

describe('optimizationService', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockGet = mockAxios.get as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('getAnalysis', () => {
    it('calls correct endpoint and returns data', async () => {
      const mockAnalysis = {
        patterns: {
          Groceries: {
            data: [{ month: '2025-07', amount: 1200 }, { month: '2025-08', amount: 1400 }],
            trend: 'increasing' as const,
            trendStrength: 150.2,
            enhancedTrend: {
              category: 'strong',
              normalizedStrength: 18.2,
              percentageChange: 25.6,
              monthlyChange: 180,
              volatility: 90,
              confidence: 73,
              description: 'Significant change, strong trend detected',
              dataPoints: 12,
              average: 990
            }
          }
        },
        seasonalTrends: { '01': 0.92, '12': 1.14 },
        budgetVariances: [
          {
            name: 'Groceries',
            month: '2025-08',
            budgetAmount: 1000,
            actualAmount: 1200,
            variance: 0.2,
            overagePercentage: 20,
            suggestedReduction: 200,
            unusedAmount: 0
          }
        ],
        recommendations: [
          {
            type: 'reduction',
            category: 'Groceries',
            title: 'Reduce Groceries spending',
            description: "You're spending 20% over budget in Groceries...",
            impact_amount: 200,
            confidence_score: 0.8
          }
        ]
      };

      mockGet.mockResolvedValue({ data: mockAnalysis });

      const result = await optimizationService.getAnalysis();

      expect(mockGet).toHaveBeenCalledWith('/optimization/analyze');
      expect(result).toEqual(mockAnalysis);
    });

    it('handle API errors gracefully', async () => {
      const error = new Error('Network error');
      mockGet.mockRejectedValue(error);

      await expect(optimizationService.getAnalysis()).rejects.toThrow('Network error');
    });
  });
});
