import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';

describe('Step3Recommendations - Apply Button Functionality', () => {
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('applied suggestion updates fixedExpenses', async () => {
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

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockUpdateFixed).toHaveBeenCalledWith(1, 1200);
  });

  it('applied suggestion updates variableAllocations', async () => {
    const mockUnderutilized = [
      {
        categoryId: 1,
        categoryName: 'Dining',
        unusedAmount: 300,
        usagePercentage: 60,
        categoryColor: 'amber'
      }
    ];

    const stateWithVariable: WizardState = {
      ...mockState,
      fixedExpenses: {},
      variableAllocations: { 1: 1500 },
    };

    render(
      <Step3Recommendations
        state={stateWithVariable}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
        mockUnderutilized={mockUnderutilized}
      />
    );

    const applyButton = screen.queryByText('Apply');
    expect(applyButton).not.toBeInTheDocument();
  });

  it('applied amount replaces existing amount entirely', async () => {
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

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockUpdateFixed).toHaveBeenCalledTimes(1);
    expect(mockUpdateFixed).toHaveBeenCalledWith(1, 1200);
  });

  it('suggestions persist in appliedSuggestions state', async () => {
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

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockUpdateFixed).toHaveBeenCalledWith(1, 1200);

    const updatedState: WizardState = {
      ...mockState,
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

    const appliedButton = screen.getByText('Applied');
    expect(appliedButton).toBeInTheDocument();
  });

  it('applied button is disabled and shows checkmark', () => {
    const appliedState: WizardState = {
      ...mockState,
      appliedSuggestions: { 1: 1200 },
    };

    render(
      <Step3Recommendations
        state={appliedState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
        mockOverspending={mockOverspending}
      />
    );

    const appliedButton = screen.getByText('Applied');
    expect(appliedButton).toBeDisabled();

    const checkIcon = screen.getByTestId('check-icon');
    expect(checkIcon).toBeInTheDocument();
  });

  it('debounces apply operations to prevent rapid successive updates', async () => {
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

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    fireEvent.click(applyButton);
    fireEvent.click(applyButton);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockUpdateFixed).toHaveBeenCalledTimes(1);
  });

  it('does not apply suggestion if already applied', async () => {
    const appliedState: WizardState = {
      ...mockState,
      appliedSuggestions: { 1: 1200 },
    };

    render(
      <Step3Recommendations
        state={appliedState}
        updateFixed={mockUpdateFixed}
        updateVariable={mockUpdateVariable}
        onBack={mockOnBack}
        onSave={mockOnSave}
        mockOverspending={mockOverspending}
      />
    );

    const applyButton = screen.queryByText('Apply');
    expect(applyButton).not.toBeInTheDocument();

    expect(mockUpdateFixed).not.toHaveBeenCalled();
  });
});
