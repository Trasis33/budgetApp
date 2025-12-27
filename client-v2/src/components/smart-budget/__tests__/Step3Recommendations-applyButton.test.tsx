import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';

describe('Step3Recommendations - Apply Button Functionality', () => {
  const mockCategories = [
    { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart' },
    { id: 2, name: 'Dining', color: 'amber', icon: 'utensils' },
  ];

  const mockState: WizardState = {
    step: 3,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: { 1: 1500, 2: 800 },
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

  it('clicking apply updates budget amount', () => {
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

    const applyButtons = screen.getAllByText(/Apply/);
    expect(applyButtons.length).toBeGreaterThan(0);

    fireEvent.click(applyButtons[0]);

    expect(mockUpdateFixed).toHaveBeenCalledTimes(1);
    const args = mockUpdateFixed.mock.calls[0];
    expect(args[0]).toBe(1); // categoryId
    expect(args[1]).toBeDefined(); // suggestedAmount
  });

  it('apply button disables after clicking', () => {
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

    const applyButtons = screen.getAllByText(/Apply/);
    expect(applyButtons.length).toBeGreaterThan(0);

    const firstButton = applyButtons[0];
    expect(firstButton).not.toBeDisabled();

    fireEvent.click(firstButton);

    // After clicking, the button should be disabled and show "Applied"
    const appliedButton = screen.getByText(/Applied/);
    expect(appliedButton).toBeDisabled();
  });

  it('button shows checkmark when applied', () => {
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

    const applyButtons = screen.getAllByText(/Apply/);

    fireEvent.click(applyButtons[0]);

    // After clicking, the button should show a checkmark icon
    const checkIcons = container.querySelectorAll('svg');
    const checkIcon = Array.from(checkIcons).find(
      icon => icon.getAttribute('data-testid') === 'check-icon'
    );
    expect(checkIcon).toBeDefined();
  });
});
