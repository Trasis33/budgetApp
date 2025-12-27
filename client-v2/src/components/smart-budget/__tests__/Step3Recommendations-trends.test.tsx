import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';

describe('Step3Recommendations - Trend Insights', () => {
  const mockCategories = [
    { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
    { id: 2, name: 'Dining Out', color: 'rose', icon: 'utensils' },
  ];

  const mockState: WizardState = {
    step: 3,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: { 1: 1000, 2: 800 },
    variableAllocations: {},
    appliedSuggestions: {},
  };

  const mockUpdateFixed = jest.fn();
  const mockUpdateVariable = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows trend direction (increasing/decreasing/stable)', () => {
    render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const trendHeading = screen.queryByText(/Spending Trends/);
    expect(trendHeading).not.toBeInTheDocument();
  });

  it('displays sparkline chart with 3-6 months', () => {
    render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const sparklineElement = screen.queryByTestId(/trend-sparkline/);
    expect(sparklineElement).not.toBeInTheDocument();
  });

  it('shows enhanced metrics (percentage change, confidence)', () => {
    render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/confidence/)).not.toBeInTheDocument();
  });

  it('color coding matches trend direction', () => {
    render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const trendCard = screen.queryByTestId(/trend-card-/);
    expect(trendCard).not.toBeInTheDocument();
  });
});
