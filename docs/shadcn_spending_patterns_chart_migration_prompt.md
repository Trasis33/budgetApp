# Minor Feature Implementation Plan: SpendingPatternsChart Migration to shadcn/ui

## Project Context

The Budget App is undergoing a gradual migration to shadcn/ui components as part of a Phase 5 enhancement. This migration aims to improve accessibility, maintainability, and developer experience while ensuring visual consistency with the existing design system. Two chart components (BudgetActualChart and CategorySpendingChart) have already been migrated from Chart.js to shadcn/ui with Recharts, and now the SpendingPatternsChart component needs to be migrated following the same pattern.

## Minor Feature Request

Migrate the SpendingPatternsChart.js component from using Chart.js to using shadcn/ui components with Recharts, maintaining visual consistency with the existing design system and ensuring functional parity with the original component.

## Current State

The current SpendingPatternsChart.js component:

- Uses Chart.js with react-chartjs-2 for rendering line charts
- Displays spending patterns across multiple categories over time
- Features a stats grid showing category-wise spending statistics with trend indicators
- Implements loading, error, and empty states
- Uses design-system.css variables for styling
- Has responsive design with fixed height constraints

Key dependencies:
```javascript
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, /* other imports */ } from 'chart.js';
```

The component processes spending pattern data, formats it for Chart.js, and renders a line chart with a stats grid below it. It uses custom chart options for styling and includes trend indicators with icons and colors.

## Target Changes

The migrated SpendingPatternsChart.js component should:

1. Replace Chart.js with shadcn/ui chart components using Recharts
2. Maintain the same visual appearance and functionality
3. Follow the patterns established in BudgetActualChart.js and CategorySpendingChart.js
4. Use design-system.css variables for styling
5. Implement the same loading, error, and empty states
6. Preserve the stats grid with trend indicators

Key dependencies will change to:
```javascript
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, /* other imports */ } from "recharts";
```

## Requirements

### Functional Requirements

1. The chart must display spending patterns across multiple categories over time
2. The chart must support tooltips showing detailed information on hover
3. The stats grid must display category-wise spending statistics with trend indicators
4. The component must handle loading, error, and empty states gracefully
5. The component must maintain responsive behavior across different screen sizes

### Non-Functional Requirements

1. The migrated component must match the visual appearance of the original
2. The component must use shadcn/ui chart components and follow their patterns
3. The component must use design-system.css variables for styling
4. The component must have comparable or better performance than the original

## Technical Requirements

### Dependencies

- shadcn/ui chart components
- Recharts library
- design-system.css

### Data Transformation

The data format needs to be transformed from Chart.js format to Recharts format:

**Chart.js format (current):**
```javascript
{
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Category 1',
      data: [100, 200, 300],
      borderColor: '#color1',
      backgroundColor: /* gradient */,
      // other styling properties
    },
    // more datasets for other categories
  ]
}
```

**Recharts format (target):**
```javascript
[
  { month: 'Jan', 'Category 1': 100, 'Category 2': 150 },
  { month: 'Feb', 'Category 1': 200, 'Category 2': 250 },
  { month: 'Mar', 'Category 1': 300, 'Category 2': 350 },
]
```

### Component Structure

The migrated component should follow this structure:

```jsx
"use client"

import React, { useState, useEffect } from 'react';
import formatCurrency from '../utils/formatCurrency';
import { modernColors } from '../utils/chartConfig';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import '../styles/design-system.css';

const SpendingPatternsChart = ({ patterns = null }) => {
  // State management (unchanged)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedPatterns, setProcessedPatterns] = useState(null);

  // Data processing (unchanged)
  useEffect(() => { /* ... */ }, [patterns]);

  // Data transformation for Recharts
  const getChartData = () => { /* transform to Recharts format */ };
  
  // Chart configuration for shadcn
  const chartConfig = { /* ... */ };
  
  // Render states (mostly unchanged)
  if (loading) { /* ... */ }
  if (error) { /* ... */ }
  if (!processedPatterns || Object.keys(processedPatterns).length === 0) { /* ... */ }
  
  return (
    <div className="chart-card glass-effect hover-lift">
      <div className="chart-header">
        <h3 className="chart-title text-gradient">📊 Spending Patterns</h3>
        <div className="chart-subtitle">Monthly spending trends by category</div>
      </div>
      
      <div className="chart-container">
        <ChartContainer config={chartConfig}>
          <LineChart data={getChartData()}>
            {/* Chart components */}
          </LineChart>
        </ChartContainer>
      </div>
      
      <div className="stats-grid">
        {/* Stats grid (mostly unchanged) */}
      </div>
    </div>
  );
};

export default SpendingPatternsChart;
```

## Implementation Approach

1. Install shadcn/ui chart component and ensure Recharts is installed
2. Create a backup of the original component
3. Implement the data transformation from Chart.js to Recharts format
4. Set up the ChartContainer and LineChart components
5. Configure axes, grid, and tooltip to match the original design
6. Migrate the stats grid with minimal changes
7. Test with various data scenarios to ensure functional parity
8. Refine styling to match the original visual appearance

## Testing Criteria

- The chart renders correctly with valid data
- Loading, error, and empty states display correctly
- Tooltips show correct data on hover
- Stats grid displays correct trend information
- Chart styling matches the design system
- Component is responsive across different screen sizes

## Resources

- BudgetActualChart.js and CategorySpendingChart.js as reference implementations
- design-system.css for styling variables
- shadcn/ui chart component documentation
- Recharts documentation for LineChart configuration

## Timeline

Estimated time: 2-3 days

- Day 1: Setup and initial migration (dependencies, data transformation)
- Day 2: Core functionality and styling (chart rendering, states, stats grid)
- Day 3: Testing and refinement (various data scenarios, styling adjustments)