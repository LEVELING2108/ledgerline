"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import MetricCard from "../../components/MetricCard";
import AlertBanner from "../../components/AlertBanner";
import CategoryChart from "../../components/CategoryChart";
import ChatPanel from "../../components/ChatPanel";
import { getSummary, getForecast, getAlerts, askAgent } from "../../lib/api";
import { categoryBreakdown, chatHistory, alerts } from "../../lib/mockData";

const openAnomaliesDefault = alerts.filter((a) => !a.resolved);

export default function DashboardPage() {
  const [messages, setMessages] = useState(chatHistory);
  const [summary, setSummary] = useState({
    this_month_spend: -35200,
    delta_label: "vs ₹36,400 last month",
    tone: "positive",
    open_anomalies_count: openAnomaliesDefault.length,
    category_breakdown: categoryBreakdown,
    total_investment: 5000
  });
  const [forecast, setForecast] = useState({
    forecast_spend: 37100,
    delta_label: "up 5.4% from this month",
    tone: "negative",
    trend: [34200, 31900, 36400, 35200, 37100]
  });
  const [openAnomaly, setOpenAnomaly] = useState(openAnomaliesDefault[0] || null);
  
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const sumData = await getSummary();
        setSummary({
          this_month_spend: sumData.this_month_spend,
          delta_label: sumData.delta_label,
          tone: sumData.tone,
          open_anomalies_count: sumData.open_anomalies_count,
          category_breakdown: sumData.category_breakdown.length > 0 ? sumData.category_breakdown : categoryBreakdown,
          total_investment: sumData.total_investment || 0
        });
      } catch (e) {
        console.warn("Failed to fetch dashboard summary, using mock defaults", e);
      }

      try {
        const fcData = await getForecast();
        if (fcData.forecasts && fcData.forecasts.length > 0) {
          const first = fcData.forecasts[0];
          setForecast({
            forecast_spend: first.predicted_spend,
            delta_label: "projected next month",
            tone: "neutral",
            trend: [32800, 34200, 31900, 36400, 35200, first.predicted_spend]
          });
        } else if (fcData.forecast_spend) {
          setForecast({
            forecast_spend: fcData.forecast_spend,
            delta_label: fcData.delta_label,
            tone: fcData.tone,
            trend: [32800, 34200, 31900, 36400, 35200, fcData.forecast_spend]
          });
        }
      } catch (e) {
        console.warn("Failed to fetch forecast, using mock defaults", e);
      }

      try {
        const alertsList = await getAlerts();
        const openList = alertsList.filter((a) => !a.resolved);
        if (openList.length > 0) {
          setOpenAnomaly(openList[0]);
        } else {
          setOpenAnomaly(null);
        }
      } catch (e) {
        console.warn("Failed to fetch alerts, using mock defaults", e);
      }
    }
    loadData();
  }, []);

  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { id: `u${prev.length}`, role: "user", text }]);
    try {
      const res = await askAgent(text);
      setMessages((prev) => [...prev, {
        id: `a${prev.length}`,
        role: "assistant",
        text: res.answer,
        trace: res.trace
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: `a${prev.length}`,
        role: "assistant",
        text: "I couldn't connect to the AI service. (Response fallback: Dining spend is currently at ₹4,100)."
      }]);
    }
  };

  const chartData = summary.category_breakdown.map((c) => ({
    ...c,
    colorKey: {
      Rent: "purple",
      Groceries: "teal",
      Dining: "coral",
      Utilities: "purple",
      "Chai & UPI Micro-Spends": "coral"
    }[c.category] || "muted",
  }));

  const rupee = (n) => `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-cream dark:bg-cream-dark">
      <NavBar />
      <main className="mx-auto max-w-5xl space-y-5 px-4 pt-6 pb-24 md:py-6 md:px-6">
        <div>
          <p className="text-page-title text-ink dark:text-ink-dark">Good evening, Sourav</p>
          <p className="text-body text-muted dark:text-muted-dark">Here's where things stand.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="This month's spend"
            value={rupee(summary.this_month_spend)}
            deltaLabel={summary.delta_label}
            tone={summary.tone}
            trend={[32800, 34200, 31900, 36400, Math.abs(summary.this_month_spend)]}
          />
          <MetricCard
            label="Investments &amp; SIPs"
            value={rupee(summary.total_investment)}
            deltaLabel="towards wealth assets"
            tone="positive"
          />
          <MetricCard
            label="Next month's forecast"
            value={rupee(forecast.forecast_spend)}
            deltaLabel={forecast.delta_label}
            tone={forecast.tone}
            trend={forecast.trend}
          />
          <MetricCard
            label="Open anomalies"
            value={String(summary.open_anomalies_count)}
            deltaLabel={summary.open_anomalies_count > 0 ? "needs a look" : "all clear"}
            tone={summary.open_anomalies_count > 0 ? "negative" : "positive"}
          />
        </div>

        <CategoryChart data={chartData} />

        {openAnomaly && (
          <AlertBanner
            headline={openAnomaly.title}
            detail={openAnomaly.detail}
            onView={() => router.push("/alerts")}
          />
        )}

        {/* Pinned chat — persistent access point, kept compact on the dashboard */}
        <ChatPanel messages={messages} onSend={handleSend} compact title="Ask about your finances" />
      </main>
    </div>
  );
}
