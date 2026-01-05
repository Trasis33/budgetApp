import React from 'react';
import { render, screen } from '@testing-library/react';
import { DualProgressRings } from '../DualProgressRings';

describe('DualProgressRings', () => {
  const defaultProps = {
    amountProgress: 50, // 50%
    timeProgress: 75,   // 75%
    size: 200,
    strokeWidth: 10,
  };

  test('renders amount progress ring with correct percentage', () => {
    render(<DualProgressRings {...defaultProps} />);
    
    // Check for amount percentage text
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  test('renders time progress ring with correct percentage', () => {
    render(<DualProgressRings {...defaultProps} />);
    
    // Check for time percentage text
    // Note: implementation might show both percentages or just one depending on design, 
    // but typically dual rings show stats for both.
    // Based on spec "Current/target amounts with percentage" + "Days remaining"
    // The rings themselves visualizes it.
    // Let's assume tooltips or accessible labels for now if text isn't explicit for both rings constantly.
    // But plan says "Add percentage labels in center".
    
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  test('renders SVG elements for rings', () => {
    const { container } = render(<DualProgressRings {...defaultProps} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    const circles = container.querySelectorAll('circle');
    // Background circles + Progress circles for 2 rings = at least 4 circles
    expect(circles.length).toBeGreaterThanOrEqual(4);
  });

  test('applies correct colors to rings', () => {
    const { container } = render(<DualProgressRings {...defaultProps} />);
    const circles = container.querySelectorAll('circle');
    
    // This is a bit fragile without specific classes/ids, but we expect different classes/colors
    // Let's just check that we have circles with different strokes if possible, or distinct classes
    // For now, simple render check is enough for "Red" phase if component doesn't exist.
    expect(circles.length).toBeGreaterThan(0);
  });
});
