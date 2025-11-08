import { render, screen } from '@testing-library/react';
import { BudgetProgressBar } from '../BudgetProgressBar';

describe('BudgetProgressBar', () => {
  it('renders progress bar with correct percentage', () => {
    render(<BudgetProgressBar percentage={75} variant="success" />);
    
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps percentage to maximum 100', () => {
    render(<BudgetProgressBar percentage={150} variant="danger" />);
    
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps percentage to minimum 0', () => {
    render(<BudgetProgressBar percentage={-10} variant="warning" />);
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('hides label when showLabel is false', () => {
    render(<BudgetProgressBar percentage={50} variant="success" showLabel={false} />);
    
    expect(screen.queryByText('50.0%')).not.toBeInTheDocument();
  });

  it('applies correct size class', () => {
    render(<BudgetProgressBar percentage={50} variant="success" size="lg" />);
    
    const progressBar = screen.getByRole('progressbar').parentElement;
    expect(progressBar).toHaveClass('progressBarLg');
  });
});
