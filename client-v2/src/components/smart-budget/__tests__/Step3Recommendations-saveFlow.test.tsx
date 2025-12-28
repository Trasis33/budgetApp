import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';

describe('Step3Recommendations - Save Flow', () => {
  const mockState: WizardState = {
    step: 3,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: { 1: 3000 },
    variableAllocations: { 3: 3000 },
    appliedSuggestions: {},
  };

  const mockUpdateFixed = jest.fn();
  const mockUpdateVariable = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows confirmation summary when Save Budget Plan button is clicked', () => {
    render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Budget Saved Successfully')).not.toBeInTheDocument();

    const saveButton = screen.getByText('Save Budget Plan');
    fireEvent.click(saveButton);

    expect(screen.getByText(/Budget.*Saved.*Successfully/i)).toBeInTheDocument();
    expect(screen.getByText(/6\s?000/)).toBeInTheDocument();
  });

  it('calls onSave when View Dashboard button is clicked', () => {
    render(
      <Step3Recommendations
        state={mockState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText('Save Budget Plan');
    fireEvent.click(saveButton);

    const viewDashboardButton = screen.getByText('View Dashboard');
    fireEvent.click(viewDashboardButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('validates unallocated >= 0 before saving', () => {
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

    const saveButton = screen.getByText('Save Budget Plan');
    fireEvent.click(saveButton);

    expect(screen.queryByText(/Budget.*Saved.*Successfully/i)).not.toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
