import { render, screen } from '@testing-library/react';
import { BudgetMetricCard } from '../BudgetMetricCard';
import { Wallet } from 'lucide-react';

describe('BudgetMetricCard', () => {
  const defaultProps = {
    label: 'Test Metric',
    value: '$1,000',
    icon: <Wallet className="w-5 h-5" />,
    iconColor: 'green' as const,
  };

  it('renders metric card with correct content', () => {
    render(<BudgetMetricCard {...defaultProps} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Lucide icon
  });

  it('applies correct variant class', () => {
    render(<BudgetMetricCard {...defaultProps} variant="success" />);
    
    const valueElement = screen.getByText('$1,000');
    expect(valueElement).toHaveClass('metricValueSuccess');
  });

  it('applies custom className', () => {
    render(<BudgetMetricCard {...defaultProps} className="custom-class" />);
    
    const card = screen.getByText('Test Metric').closest('div');
    expect(card).toHaveClass('custom-class');
  });
});
