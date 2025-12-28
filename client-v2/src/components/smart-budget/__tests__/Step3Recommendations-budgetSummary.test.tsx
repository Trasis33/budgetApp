import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';

describe('Step3Recommendations - Budget Summary Panel', () => {
  const mockState: WizardState = {
    step: 3,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: { 1: 1500, 2: 800 },
    variableAllocations: { 3: 2000, 4: 1500 },
    appliedSuggestions: {},
  };

  const mockUpdateFixed = jest.fn();
  const mockUpdateVariable = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSave = jest.fn();

  it('displays total income correctly', () => {
    render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/10\s?000/)).toBeInTheDocument();
  });

  it('calculates fixed expenses total correctly', () => {
    render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/2\s?300/)).toBeInTheDocument();
  });

  it('calculates variable budgets total correctly', () => {
    render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/3\s?500/)).toBeInTheDocument();
  });

  it('calculates unallocated amount correctly', () => {
    render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/4\s?200/)).toBeInTheDocument();
  });

  it('shows green color when unallocated >= 0', () => {
    const balancedState: WizardState = {
      ...mockState,
      fixedExpenses: { 1: 3000 },
      variableAllocations: { 3: 3000 },
    };

    render(
      <Step3Recommendations
        state={balancedState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const unallocatedElement = screen.getByText(/4\s?000/);
    expect(unallocatedElement).toHaveClass(/text-emerald-600|text-green-600/);
  });

  it('shows red color when unallocated < 0', () => {
    const overallocatedState: WizardState = {
      ...mockState,
      fixedExpenses: { 1: 5000 },
      variableAllocations: { 3: 6000 },
    };

    render(
      <Step3Recommendations
        state={overallocatedState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const unallocatedElement = screen.getByText((content) => {
      return content.includes('1') && content.includes('000') && (content.includes('-') || content.includes('−'));
    });
    expect(unallocatedElement).toHaveClass(/text-red-600|text-rose-600/);
  });

  it('updates summary in real-time after suggestion applies', () => {
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

    render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
        mockOverspending={mockOverspending}
      />
    );

    const { rerender } = render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
        mockOverspending={mockOverspending}
      />
    );

    const updatedState: WizardState = {
      ...mockState,
      fixedExpenses: { 1: 1200, 2: 800 },
      appliedSuggestions: { 1: 1200 },
    };

    rerender(
      <Step3Recommendations
        state={updatedState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
        mockOverspending={mockOverspending}
      />
    );

    expect(screen.getByText(/2\s?000/)).toBeInTheDocument();
  });
});
