"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataPoint {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
  stackId?: string;
}

interface BarChartProps {
  data: DataPoint[];
  xAxisKey: string;
  bars: BarConfig[];
  height?: number;
  layout?: "vertical" | "horizontal";
  formatXAxis?: (value: string | number) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function BarChart({
  data,
  xAxisKey,
  bars,
  height = 300,
  layout = "horizontal",
  formatXAxis,
  formatYAxis,
  formatTooltip,
  title,
  colors = DEFAULT_COLORS,
}: BarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          {isVertical ? (
            <>
              <XAxis type="number" tickFormatter={formatYAxis} />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tickFormatter={formatXAxis}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} />
              <YAxis tickFormatter={formatYAxis} />
            </>
          )}
          <Tooltip
            formatter={(value) =>
              formatTooltip && typeof value === "number"
                ? formatTooltip(value)
                : String(value)
            }
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || colors[index % colors.length]}
              stackId={bar.stackId}
            >
              {data.map((_, cellIndex) => (
                <Cell
                  key={`cell-${cellIndex}`}
                  fill={bar.color || colors[cellIndex % colors.length]}
                />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
