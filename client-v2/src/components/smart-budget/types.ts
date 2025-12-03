export type StrategyType = 'balanced' | 'saver' | 'spender';

export interface Strategy {
  id: StrategyType;
  name: string;
  description: string;
  icon: string;
  distribution: {
    needs: number; // 0-1
    wants: number; // 0-1
    savings: number; // 0-1
  };
}

export interface WizardState {
  step: number;
  income: number; // Combined income (computed from userIncome + partnerIncome)
  userIncome: number;
  partnerIncome: number;
  selectedStrategy: StrategyType;
  fixedExpenses: Record<number, number>; // categoryId -> amount
  variableAllocations: Record<number, number>; // categoryId -> amount
}

export const STRATEGIES: Strategy[] = [
  {
    id: 'balanced',
    name: 'Balanced Approach',
    description: 'The classic 50/30/20 rule. Good mix of fun today and security tomorrow.',
    icon: '⚖️',
    distribution: { needs: 0.5, wants: 0.3, savings: 0.2 }
  },
  {
    id: 'saver',
    name: 'Aggressive Saver',
    description: 'Prioritize future goals. Minimizes lifestyle spending to maximize savings rate.',
    icon: '🌱',
    distribution: { needs: 0.5, wants: 0.15, savings: 0.35 }
  },
  {
    id: 'spender',
    name: 'High Cost of Living',
    description: 'For when rent and bills eat up most of the budget. Focuses on essentials.',
    icon: '🏙️',
    distribution: { needs: 0.7, wants: 0.2, savings: 0.1 }
  }
];
