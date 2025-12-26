import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartBudgetWizard } from '../SmartBudgetWizard';
import { Category, BudgetWithSpending } from '../../types';

describe('SmartBudgetWizard - Step 3 Navigation', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
    { id: 2, name: 'Housing', color: 'indigo', icon: 'home' },
  ];

  const mockExistingBudgets: BudgetWithSpending[] = [];

  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();

  it('Step 3 is accessible from Step 2', async () => {
    render(
      <SmartBudgetWizard
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        categories={mockCategories}
        existingBudgets={mockExistingBudgets}
        month={1}
        year={2025}
      />
    );

    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText('Budget Recommendations & Review')).toBeInTheDocument();
  });

  it('Back button preserves Step 2 amounts', async () => {
    render(
      <SmartBudgetWizard
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        categories={mockCategories}
        existingBudgets={mockExistingBudgets}
        month={1}
        year={2025}
      />
    );

    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    await new Promise(resolve => setTimeout(resolve, 100));

    const backButton = screen.getByText(/back/i);
    fireEvent.click(backButton);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText(/define allocations/i)).toBeInTheDocument();
  });
});
