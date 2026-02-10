"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  dot?: boolean;
}

interface LineChartProps {
  data: DataPoint[];
  xAxisKey: string;
  lines: LineConfig[];
  height?: number;
  formatXAxis?: (value: string | number) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  title?: string;
}

export function LineChart({
  data,
  xAxisKey,
  lines,
  height = 300,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  title,
}: LineChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxis}
            className="text-xs"
          />
          <YAxis tickFormatter={formatYAxis} className="text-xs" />
          <Tooltip
            formatter={(value) =>
              formatTooltip && typeof value === "number"
                ? formatTooltip(value)
                : String(value)
            }
            labelFormatter={(label) =>
              formatXAxis ? formatXAxis(label) : label
            }
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== false}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
