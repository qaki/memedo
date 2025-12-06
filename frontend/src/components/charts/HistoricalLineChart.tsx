/**
 * Historical Line Chart Component
 * Displays time-series data for token metrics
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  timestamp: string;
  [key: string]: string | number | null | undefined;
}

interface HistoricalLineChartProps {
  data: DataPoint[];
  dataKeys: Array<{
    key: string;
    name: string;
    color: string;
    formatter?: (value: number) => string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}

// Custom tooltip component
const CustomTooltip: React.FC<
  TooltipProps<number, string> & {
    formatters?: Record<string, (value: number) => string>;
  }
> = ({ active, payload, label, formatters }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-gray-300 mb-2">{format(new Date(label), 'MMM d, yyyy h:mm a')}</p>
      {payload.map((entry, index) => {
        const formatter = formatters?.[entry.dataKey as string];
        const value = formatter ? formatter(entry.value as number) : entry.value;

        return (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-semibold">{entry.name}:</span> {value}
          </p>
        );
      })}
    </div>
  );
};

export const HistoricalLineChart: React.FC<HistoricalLineChartProps> = ({
  data,
  dataKeys,
  xAxisLabel,
  yAxisLabel,
  height = 300,
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

  // Prepare formatters object for tooltip
  const formatters: Record<string, (value: number) => string> = {};
  dataKeys.forEach((key) => {
    if (key.formatter) {
      formatters[key.key] = key.formatter;
    }
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
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
        <Tooltip content={<CustomTooltip formatters={formatters} />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
          formatter={(value) => <span className="text-gray-300">{value}</span>}
        />
        {dataKeys.map((dataKey) => (
          <Line
            key={dataKey.key}
            type="monotone"
            dataKey={dataKey.key}
            stroke={dataKey.color}
            strokeWidth={2}
            name={dataKey.name}
            dot={{ fill: dataKey.color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
