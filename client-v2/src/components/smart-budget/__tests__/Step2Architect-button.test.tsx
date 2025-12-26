import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Step2Architect } from '../Step2Architect';
import { WizardState } from '../types';
import { Category } from '../../types';

describe('Step2Architect - Review Suggestions Button', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
  ];

  const mockState: WizardState = {
    step: 2,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: {},
    variableAllocations: {},
  };

  const mockUpdateFixed = jest.fn();
  const mockUpdateVariable = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSave = jest.fn();

  it('button text is "Review Suggestions" when wizard has Step 3 capability', () => {
    render(
      <Step2Architect
        state={mockState}
        categories={mockCategories}
        billCategoryIds={[]}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText('Review Suggestions');
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});
