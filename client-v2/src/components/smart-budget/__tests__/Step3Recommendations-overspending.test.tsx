import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';

describe('Step3Recommendations - Overspending Display', () => {
  const mockOverspending = [
    {
      categoryId: 1,
      categoryName: 'Groceries',
      overagePercentage: 25,
      suggestedReduction: 300,
      suggestedAmount: 1200,
      confidenceScore: 85,
      categoryColor: 'teal'
    }
  ];

  it('shows overspending categories with >20% variance', () => {
    const mockState = {
      step: 3,
      income: 10000,
      userIncome: 6000,
      partnerIncome: 4000,
      selectedStrategy: 'balanced' as const,
      fixedExpenses: { 1: 1500 },
      variableAllocations: {},
      appliedSuggestions: {}
    };

    const mockCategories = [
      { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
    ];

    render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={jest.fn()}
        updateVariable={jest.fn()}
        onBack={jest.fn()}
        onSave={jest.fn()}
        mockOverspending={mockOverspending}
      />
    );

    expect(screen.getByText(/Overspending Alerts/)).toBeInTheDocument();
  });

  it('displays reduction amounts with confidence scores', () => {
    const mockState = {
      step: 3,
      income: 10000,
      userIncome: 6000,
      partnerIncome: 4000,
      selectedStrategy: 'balanced' as const,
      fixedExpenses: { 1: 1500 },
      variableAllocations: {},
      appliedSuggestions: {}
    };

    const mockCategories = [
      { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
    ];

    render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={jest.fn()}
        updateVariable={jest.fn()}
        onBack={jest.fn()}
        onSave={jest.fn()}
        mockOverspending={mockOverspending}
      />
    );

    expect(screen.getByText(/Reduce by:/)).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('color coding is red/amber for urgency', () => {
    const mockState = {
      step: 3,
      income: 10000,
      userIncome: 6000,
      partnerIncome: 4000,
      selectedStrategy: 'balanced' as const,
      fixedExpenses: { 1: 1500 },
      variableAllocations: {},
      appliedSuggestions: {}
    };

    const mockCategories = [
      { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
    ];

    render(
      <Step3Recommendations
        state={mockState}
        categories={mockCategories}
        updateFixed={jest.fn()}
        updateVariable={jest.fn()}
        onBack={jest.fn()}
        onSave={jest.fn()}
        mockOverspending={mockOverspending}
      />
    );

    const overspendingAlert = screen.getByTestId(/overspending-\d+/);
    expect(overspendingAlert).toHaveClass(/bg-red-50|bg-amber-50/);
  });
});
