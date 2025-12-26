import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';
import { Category } from '../../types';

describe('Step3Recommendations', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
    { id: 2, name: 'Housing', color: 'indigo', icon: 'home' },
  ];

  const mockState: WizardState = {
    step: 3,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: { 1: 1000, 2: 3000 },
    variableAllocations: { 1: 500, 2: 2000 },
  };

  const mockUpdateFixed = jest.fn();
  const mockUpdateVariable = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSave = jest.fn();

  it('renders without crashing', () => {
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

    expect(screen.getByText('Budget Recommendations & Review')).toBeInTheDocument();
  });

  it('Props interface matches WizardState', () => {
    const props = {
      state: mockState,
      categories: mockCategories,
      updateFixed: mockUpdateFixed,
      updateVariable: mockUpdateVariable,
      onBack: mockOnBack,
      onSave: mockOnSave
    };

    render(<Step3Recommendations {...props} />);

    expect(screen.getByText('Budget Recommendations & Review')).toBeInTheDocument();
  });

  it('Back navigation works correctly', () => {
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

    const backButton = screen.getByText(/back/i);
    backButton.click();

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
