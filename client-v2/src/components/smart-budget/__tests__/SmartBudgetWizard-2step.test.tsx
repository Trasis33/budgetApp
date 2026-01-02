import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartBudgetWizard } from '../SmartBudgetWizard';
import { Category, BudgetWithSpending } from '../../../types';
import { budgetService } from '../../../api/services/budgetService';

// Mock the budget service
jest.mock('../../../api/services/budgetService', () => ({
    budgetService: {
        getBudgets: jest.fn().mockResolvedValue([]),
        createOrUpdateBudget: jest.fn().mockResolvedValue({}),
    },
}));

// Mock recurring expense service
jest.mock('../../../api/services/recurringExpenseService', () => ({
    recurringExpenseService: {
        getTemplates: jest.fn().mockResolvedValue([]),
    },
}));

// Mock ScopeContext
jest.mock('../../../context/ScopeContext', () => ({
    useScope: () => ({
        summary: null,
        refresh: jest.fn(),
    }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('SmartBudgetWizard - 2-Step Flow (Post-Pivot)', () => {
    const mockCategories: Category[] = [
        { id: 1, name: 'Groceries', color: 'teal', icon: 'shopping-cart', is_fixed: false },
        { id: 2, name: 'Housing', color: 'indigo', icon: 'home', is_fixed: true },
    ];

    const mockExistingBudgets: BudgetWithSpending[] = [];

    const mockOnClose = jest.fn();
    const mockOnComplete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('wizard has only 2 steps (no Step 3)', async () => {
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

        // Step 1 should be visible (check for step indicator)
        expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();

        // Navigate to Step 2
        const nextButton = screen.getByText(/continue to details/i);
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/fixed expenses/i)).toBeInTheDocument();
        });

        // Step 2's button should say "Apply Budget" not "Review Suggestions"
        expect(screen.getByText('Apply Budget')).toBeInTheDocument();
        expect(screen.queryByText('Review Suggestions')).not.toBeInTheDocument();
    });

    it('Step 2 "Apply Budget" button saves directly without going to Step 3', async () => {
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

        // Navigate to Step 2
        const nextButton = screen.getByText(/continue to details/i);
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/fixed expenses/i)).toBeInTheDocument();
        });

        // Click Apply Budget
        const applyButton = screen.getByText('Apply Budget');
        fireEvent.click(applyButton);

        // Should call budgetService and complete
        await waitFor(() => {
            expect(mockOnComplete).toHaveBeenCalled();
        });
    });

    it('does not render Step3Recommendations component', async () => {
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

        // Navigate to Step 2
        const nextButton = screen.getByText(/continue to details/i);
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/fixed expenses/i)).toBeInTheDocument();
        });

        // Click Apply Budget
        const applyButton = screen.getByText('Apply Budget');
        fireEvent.click(applyButton);

        // Wait for save to complete
        await waitFor(() => {
            expect(mockOnComplete).toHaveBeenCalled();
        });

        // Step 3 content should never appear
        expect(screen.queryByText('Budget Recommendations & Review')).not.toBeInTheDocument();
    });
});
