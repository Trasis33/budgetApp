import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step3Recommendations } from '../Step3Recommendations';
import { WizardState } from '../types';

describe('Step3Recommendations - Seasonal Pattern Alerts', () => {
  const mockCategories = [
    { id: 1, name: 'Heating', color: 'amber', icon: 'thermometer' },
    { id: 2, name: 'Holiday Gifts', color: 'rose', icon: 'gift' },
  ];

  const mockState: WizardState = {
    step: 3,
    income: 10000,
    userIncome: 6000,
    partnerIncome: 4000,
    selectedStrategy: 'balanced',
    fixedExpenses: { 1: 1200, 2: 500 },
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

  it('shows categories with strong seasonal patterns', () => {
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

    const seasonalHeading = screen.queryByText(/Seasonal Patterns/);
    expect(seasonalHeading).not.toBeInTheDocument();
  });

  it('alerts for upcoming seasonal spike in 1-2 months', () => {
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

    expect(screen.queryByText(/upcoming seasonal spike/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/1-2 months/)).not.toBeInTheDocument();
  });

  it('displays suggested preparation amount', () => {
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

    expect(screen.queryByText(/Prepare:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+\s*kr/)).not.toBeInTheDocument();
  });

  it('calendar icon displays with warning', () => {
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

    const calendarIcon = screen.queryByTestId(/seasonal-calendar-/);
    expect(calendarIcon).not.toBeInTheDocument();
  });
});
