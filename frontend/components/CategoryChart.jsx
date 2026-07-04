"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeProvider";

// Hex values mirror tailwind.config.js — Recharts needs real color values,
// not utility classes, so we resolve them here per active theme.
const PALETTE = {
  light: { teal: "#0F6E56", purple: "#3C3489", coral: "#993C1D", muted: "#5F5E5A" },
  dark: { teal: "#2FBF9B", purple: "#9A90E8", coral: "#E08A5E", muted: "#9B9992" },
};

const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;

/**
 * CategoryChart
 * @param {{category: string, amount: number, colorKey?: "teal"|"purple"|"coral"|"muted"}[]} data
 */
export default function CategoryChart({ data }) {
  const { theme } = useTheme();
  const colors = PALETTE[theme] || PALETTE.light;
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  const chartData = data.map((d, i) => ({
    ...d,
    fill: colors[d.colorKey] || Object.values(colors)[i % 4],
  }));

  return (
    <div className="rounded-card border border-hairline bg-surface p-4
                    dark:border-hairline-dark dark:bg-surface-dark">
      <p className="text-section-heading text-ink dark:text-ink-dark">Category breakdown</p>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius="65%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => rupee(value)}
                contentStyle={{
                  fontSize: 13,
                  borderRadius: 8,
                  border: "1px solid #D9D7CE",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Text legend: the number is always here in plain text, the chart
            never carries meaning on its own */}
        <ul className="w-full flex-1 space-y-1.5">
          {chartData.map((entry) => (
            <li key={entry.category} className="flex items-center justify-between gap-3 text-body">
              <span className="flex items-center gap-2 text-ink dark:text-ink-dark">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                  aria-hidden="true"
                />
                {entry.category}
              </span>
              <span className="text-muted dark:text-muted-dark">
                {rupee(entry.amount)}
                <span className="ml-1 text-caption">
                  ({Math.round((entry.amount / total) * 100)}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
