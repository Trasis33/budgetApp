import axios from 'axios';

export interface TrendData {
  month: string;
  amount: number;
}

export interface EnhancedTrend {
  category: string;
  normalizedStrength: number;
  percentageChange: number;
  monthlyChange: number;
  volatility: number;
  confidence: number;
  description: string;
  dataPoints: number;
  average: number;
}

export interface CategoryPattern {
  data: TrendData[];
  trend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number;
  enhancedTrend: EnhancedTrend;
}

export interface BudgetVariance {
  name: string;
  month: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  overagePercentage: number;
  suggestedReduction: number;
  unusedAmount: number;
}

export interface Recommendation {
  type: string;
  category?: string;
  title: string;
  description: string;
  impact_amount: number;
  confidence_score: number;
}

export interface AnalysisResponse {
  patterns: Record<string, CategoryPattern>;
  seasonalTrends: Record<string, number>;
  budgetVariances: BudgetVariance[];
  recommendations: Recommendation[];
}

const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' && window.location
    ? `${window.location.protocol}//${window.location.host}/api`
    : 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
if (token) {
  apiClient.defaults.headers.common['x-auth-token'] = token;
}

export const optimizationService = {
  async getAnalysis(proposedBudgets?: Record<number, number>, scope?: string): Promise<AnalysisResponse> {
    const params: Record<string, string> = {};
    
    if (proposedBudgets && Object.keys(proposedBudgets).length > 0) {
      params.proposedBudgets = JSON.stringify(proposedBudgets);
    }
    
    if (scope) {
      params.scope = scope;
    }
    
    const response = await apiClient.get<AnalysisResponse>('/optimization/analyze', { params });
    return response.data;
  },
};
