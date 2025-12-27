import React from 'react';
import { LineChart, Line } from 'recharts';

interface TrendData {
  month: string;
  value: number;
}

interface TrendSparklineProps {
  data: TrendData[];
  trend: 'increasing' | 'decreasing' | 'stable';
  height?: number;
  width?: number;
}

export function TrendSparkline({ data, trend, height = 60, width = 200 }: TrendSparklineProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'increasing':
        return 'var(--theme-rose)';
      case 'decreasing':
        return 'var(--theme-emerald)';
      case 'stable':
        return 'var(--theme-indigo)';
      default:
        return 'var(--theme-slate)';
    }
  };

  return (
    <div style={{ width, height }} className="relative">
      <LineChart width={width} height={height} data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={getTrendColor()}
          strokeWidth={2}
          dot={false}
          animationDuration={500}
        />
      </LineChart>
    </div>
  );
}
