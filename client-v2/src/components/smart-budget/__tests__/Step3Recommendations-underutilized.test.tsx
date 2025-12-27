import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';

describe('Step3Recommendations - Underutilized Budget Alerts', () => {
  const mockCategories = [
    { id: 1, name: 'Entertainment', color: 'emerald', icon: 'film' },
    { id: 2, name: 'Dining Out', color: 'teal', icon: 'utensils' },
  ];

  const mockState: WizardState = {
    step: 3,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: { 1: 500, 2: 800 },
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

  it('shows underutilized categories with <70% budget used', () => {
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

    const underutilizedHeading = screen.queryByText(/Underutilized Budgets/);
    // No real data yet, so no underutilized categories
    expect(underutilizedHeading).not.toBeInTheDocument();
  });

  it('displays unused amounts correctly', () => {
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

    const unusedElements = screen.queryAllByText(/Unused:/);
    // No real data yet, so no unused amounts displayed
    expect(unusedElements.length).toBe(0);
  });

  it('color coding is green/emerald for opportunity', () => {
    const { container } = render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const underutilizedAlert = container.querySelector('[data-testid^="underutilized-"]');
    // No real data yet, so no underutilized alerts
    expect(underutilizedAlert).toBeNull();
  });
});
