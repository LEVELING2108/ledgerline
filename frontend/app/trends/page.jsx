"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import NavBar from "../../components/NavBar";
import MetricCard from "../../components/MetricCard";
import { useTheme } from "../../components/ThemeProvider";
import { getForecast } from "../../lib/api";
import { monthlyTrend as initialTrend, categoryBreakdown } from "../../lib/mockData";

const PALETTE = {
  light: { teal: "#0F6E56", muted: "#5F5E5A", hairline: "#D9D7CE" },
  dark: { teal: "#2FBF9B", muted: "#9B9992", hairline: "#2E3237" },
};

const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function TrendsPage() {
  const { theme } = useTheme();
  const colors = PALETTE[theme] || PALETTE.light;
  
  const [trendData, setTrendData] = useState(initialTrend);
  const [forecastMonth, setForecastMonth] = useState({ month: "Jul", forecast: 37100 });

  useEffect(() => {
    async function loadForecast() {
      try {
        const fcData = await getForecast();
        if (fcData.forecasts && fcData.forecasts.length > 0) {
          const first = fcData.forecasts[0];
          // Update the forecast item in trend
          const newTrend = initialTrend.map(item => {
            if (item.month === "Jul") {
              return { ...item, forecast: first.predicted_spend };
            }
            return item;
          });
          setTrendData(newTrend);
          setForecastMonth({ month: "Jul", forecast: first.predicted_spend });
        } else if (fcData.forecast_spend) {
          const newTrend = initialTrend.map(item => {
            if (item.month === "Jul") {
              return { ...item, forecast: fcData.forecast_spend };
            }
            return item;
          });
          setTrendData(newTrend);
          setForecastMonth({ month: "Jul", forecast: fcData.forecast_spend });
        }
      } catch (e) {
        console.warn("Failed to fetch trends forecast from server, using mock defaults", e);
      }
    }
    loadForecast();
  }, []);

  // Bridge the actual→forecast series so the dashed line continues visually
  // from the last real data point, rather than floating disconnected.
  const chartData = useMemo(() => {
    const lastActualIndex = [...trendData].reverse().findIndex((m) => m.actual != null);
    const bridgeIndex = trendData.length - 1 - lastActualIndex;

    return trendData.map((m, i) => ({
      month: m.month,
      actual: m.actual,
      forecast: m.forecast != null ? m.forecast : i === bridgeIndex ? m.actual : null,
    }));
  }, [trendData]);

  return (
    <div className="min-h-screen bg-cream dark:bg-cream-dark">
      <NavBar />
      <main className="mx-auto max-w-5xl space-y-5 px-4 pt-6 pb-24 md:py-6 md:px-6">
        <p className="text-page-title text-ink dark:text-ink-dark">Trends &amp; forecast</p>

        <p className="text-body text-ink dark:text-ink-dark">
          Spending has climbed steadily since April; {forecastMonth.month} is projected at{" "}
          <span className="font-medium">{rupee(forecastMonth.forecast)}</span>, mainly driven by rent and groceries.
        </p>

        <div className="rounded-card border border-hairline bg-surface p-4
                        dark:border-hairline-dark dark:bg-surface-dark">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.hairline} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: colors.muted }} axisLine={{ stroke: colors.hairline }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: colors.muted }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip formatter={(value) => rupee(value)} contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                <Line type="monotone" dataKey="actual" stroke={colors.teal} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke={colors.teal}
                  strokeOpacity={0.55}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, strokeOpacity: 0.55 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-section-heading text-ink dark:text-ink-dark">Forecast by category</p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoryBreakdown.map((c) => (
              <MetricCard
                key={c.category}
                label={c.category}
                value={rupee(Math.round(c.amount * 1.03))}
                deltaLabel="projected next month"
                tone="neutral"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
