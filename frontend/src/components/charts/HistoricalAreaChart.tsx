/**
 * Historical Area Chart Component
 * Displays filled area charts for token metrics (better for single metric visualization)
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  timestamp: string;
  [key: string]: string | number | null | undefined;
}

interface HistoricalAreaChartProps {
  data: DataPoint[];
  dataKey: string;
  name: string;
  color: string;
  gradientColor?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  formatter?: (value: number) => string;
}

// Custom tooltip component
const CustomTooltip: React.FC<
  TooltipProps<number, string> & {
    name: string;
    color: string;
    formatter?: (value: number) => string;
  }
> = ({ active, payload, label, name, color, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value as number;
  const formattedValue = formatter ? formatter(value) : value;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-gray-300 mb-2">{format(new Date(label), 'MMM d, yyyy h:mm a')}</p>
      <p className="text-sm" style={{ color }}>
        <span className="font-semibold">{name}:</span> {formattedValue}
      </p>
    </div>
  );
};

export const HistoricalAreaChart: React.FC<HistoricalAreaChartProps> = ({
  data,
  dataKey,
  name,
  color,
  gradientColor,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  formatter,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/50"
        style={{ height }}
      >
        <p className="text-gray-400">No historical data available</p>
      </div>
    );
  }

  const gradientId = `gradient-${dataKey}`;
  const fillColor = gradientColor || color;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          label={
            xAxisLabel
              ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#9CA3AF' }
              : undefined
          }
        />
        <YAxis
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          label={
            yAxisLabel
              ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9CA3AF' }
              : undefined
          }
        />
        <Tooltip content={<CustomTooltip name={name} color={color} formatter={formatter} />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          name={name}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
