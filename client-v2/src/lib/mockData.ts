import { Expense, Budget, Income, User } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alex', email: 'alex@example.com' },
  { id: '2', name: 'Jordan', email: 'jordan@example.com' }
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2025-11-01',
    amount: 1200,
    category: 'Housing',
    description: 'Monthly Rent',
    paidBy: '1',
    splitType: 'equal',
    recurring: true,
    recurringDay: 1
  },
  {
    id: '2',
    date: '2025-10-28',
    amount: 85.50,
    category: 'Food',
    description: 'Grocery shopping',
    paidBy: '2',
    splitType: 'equal'
  },
  {
    id: '3',
    date: '2025-10-27',
    amount: 45.00,
    category: 'Entertainment',
    description: 'Movie tickets',
    paidBy: '1',
    splitType: 'equal'
  },
  {
    id: '4',
    date: '2025-10-26',
    amount: 120.00,
    category: 'Utilities',
    description: 'Electricity bill',
    paidBy: '2',
    splitType: 'equal',
    recurring: true,
    recurringDay: 26
  },
  {
    id: '5',
    date: '2025-10-25',
    amount: 60.00,
    category: 'Transportation',
    description: 'Gas',
    paidBy: '1',
    splitType: 'personal'
  },
  {
    id: '6',
    date: '2025-10-24',
    amount: 150.00,
    category: 'Shopping',
    description: 'Clothing',
    paidBy: '2',
    splitType: 'personal'
  },
  {
    id: '7',
    date: '2025-10-23',
    amount: 95.00,
    category: 'Food',
    description: 'Restaurant dinner',
    paidBy: '1',
    splitType: 'equal'
  },
  {
    id: '8',
    date: '2025-10-22',
    amount: 200.00,
    category: 'Healthcare',
    description: 'Doctor visit',
    paidBy: '2',
    splitType: 'personal'
  },
  {
    id: '9',
    date: '2025-10-20',
    amount: 75.00,
    category: 'Entertainment',
    description: 'Concert tickets',
    paidBy: '1',
    splitType: 'equal'
  },
  {
    id: '10',
    date: '2025-10-18',
    amount: 110.50,
    category: 'Food',
    description: 'Weekly groceries',
    paidBy: '2',
    splitType: 'equal'
  },
  {
    id: '11',
    date: '2025-10-15',
    amount: 55.00,
    category: 'Utilities',
    description: 'Internet bill',
    paidBy: '1',
    splitType: 'equal',
    recurring: true,
    recurringDay: 15
  },
  {
    id: '12',
    date: '2025-10-12',
    amount: 180.00,
    category: 'Transportation',
    description: 'Car insurance',
    paidBy: '2',
    splitType: 'custom',
    splitRatio: 60
  },
  {
    id: '13',
    date: '2025-10-10',
    amount: 40.00,
    category: 'Entertainment',
    description: 'Streaming services',
    paidBy: '1',
    splitType: 'equal',
    recurring: true,
    recurringDay: 10
  },
  {
    id: '14',
    date: '2025-10-08',
    amount: 92.00,
    category: 'Food',
    description: 'Takeout dinner',
    paidBy: '2',
    splitType: 'equal'
  },
  {
    id: '15',
    date: '2025-10-05',
    amount: 500.00,
    category: 'Savings',
    description: 'Emergency fund',
    paidBy: '1',
    splitType: 'personal'
  }
];

export const mockBudgets: Budget[] = [
  { id: '1', category: 'Housing', monthlyAmount: 1200 },
  { id: '2', category: 'Food', monthlyAmount: 600 },
  { id: '3', category: 'Transportation', monthlyAmount: 300 },
  { id: '4', category: 'Entertainment', monthlyAmount: 200 },
  { id: '5', category: 'Utilities', monthlyAmount: 250 },
  { id: '6', category: 'Shopping', monthlyAmount: 300 },
  { id: '7', category: 'Healthcare', monthlyAmount: 200 },
  { id: '8', category: 'Savings', monthlyAmount: 500 }
];

export const mockIncome: Income[] = [
  { id: '1', source: 'Alex Salary', amount: 3500, date: '2025-10-01' },
  { id: '2', source: 'Jordan Salary', amount: 3200, date: '2025-10-01' },
  { id: '3', source: 'Alex Salary', amount: 3500, date: '2025-11-01' },
  { id: '4', source: 'Jordan Salary', amount: 3200, date: '2025-11-01' }
];
